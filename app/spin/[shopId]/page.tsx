'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Prize } from '@/lib/types/database';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

export default function SpinPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();
  const shopId = params.shopId as string;

  // Get phone number and language from URL params (passed from redirect page)
  const phoneFromUrl = searchParams.get('phone');
  const langFromUrl = searchParams.get('lang');
  const currentLang = langFromUrl || i18n.language || 'en';

  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [spinsRemaining, setSpinsRemaining] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string>('');
  const [resultType, setResultType] = useState<'win' | 'retry' | 'lost' | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [unluckyProbability, setUnluckyProbability] = useState(20);
  const [retryProbability, setRetryProbability] = useState(10);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<any>(null);

  // Segment colors from merchant config or defaults
  const [segmentColors, setSegmentColors] = useState<{ color: string; textColor: string }[]>([
    { color: '#E85A5A', textColor: '#ffffff' },
    { color: '#F5C6C6', textColor: '#8B4513' },
    { color: '#D4548A', textColor: '#ffffff' },
    { color: '#D4A574', textColor: '#ffffff' },
    { color: '#1a1a1a', textColor: '#ff4444' },
    { color: '#E85A5A', textColor: '#ffffff' },
    { color: '#F5C6C6', textColor: '#8B4513' },
    { color: '#D4548A', textColor: '#ffffff' },
  ]);

  // Segment types
  type SegmentType = 'prize' | 'unlucky' | 'retry';
  interface WheelSegment {
    type: SegmentType;
    prize?: Prize;
    label: string;
    color: string;
    textColor: string;
  }

  useEffect(() => {
    setIsClient(true);
    if (langFromUrl && i18n.language !== langFromUrl) {
      i18n.changeLanguage(langFromUrl);
    }
  }, [langFromUrl, i18n]);

  useEffect(() => {
    const checkSpinEligibility = async () => {
      const userToken = localStorage.getItem('user_token');

      if (userToken) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data } = await supabase
          .from('spins')
          .select('*')
          .eq('merchant_id', shopId)
          .eq('user_token', userToken)
          .gte('created_at', today.toISOString())
          .maybeSingle();

        if (data) {
          setHasSpun(true);
        }
      }

      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', shopId)
        .maybeSingle();

      if (merchantData) {
        setMerchant(merchantData);
        if (merchantData.unlucky_probability !== undefined) {
          setUnluckyProbability(merchantData.unlucky_probability);
        }
        if (merchantData.retry_probability !== undefined) {
          setRetryProbability(merchantData.retry_probability);
        }
        // Load segment colors if configured
        if (merchantData.segment_colors) {
          setSegmentColors(merchantData.segment_colors);
        }
      }

      const { data: prizesData } = await supabase
        .from('prizes')
        .select('*')
        .eq('merchant_id', shopId)
        .order('id', { ascending: true });

      if (prizesData) {
        setPrizes(prizesData);
      }
      setLoading(false);
    };

    checkSpinEligibility();
  }, [shopId]);

  // Generate wheel segments
  const generateWheelSegments = (): WheelSegment[] => {
    const segments: WheelSegment[] = [];

    // Always add UNLUCKY and RETRY segments
    segments.push({
      type: 'unlucky',
      label: '#UNLUCKY#',
      color: '#1a1a1a',
      textColor: '#ff4444'
    });
    segments.push({
      type: 'retry',
      label: '#REESSAYER#',
      color: '#D4A574',
      textColor: '#ffffff'
    });

    if (prizes.length === 0) {
      segments.push({ type: 'unlucky', label: '#UNLUCKY#', color: '#1a1a1a', textColor: '#ff4444' });
      segments.push({ type: 'retry', label: '#REESSAYER#', color: '#D4A574', textColor: '#ffffff' });
      segments.push({ type: 'unlucky', label: '#UNLUCKY#', color: '#1a1a1a', textColor: '#ff4444' });
      segments.push({ type: 'retry', label: '#REESSAYER#', color: '#D4A574', textColor: '#ffffff' });
      return segments;
    }

    let prizeSegments: WheelSegment[] = prizes.map((prize, index) => ({
      type: 'prize' as const,
      prize,
      label: prize.name,
      color: segmentColors[index % segmentColors.length]?.color || '#E85A5A',
      textColor: segmentColors[index % segmentColors.length]?.textColor || '#ffffff'
    }));

    if (prizes.length < 3) {
      const duplicated = [...prizeSegments];
      while (duplicated.length < 4) {
        duplicated.push(...prizeSegments.slice(0, Math.min(prizeSegments.length, 4 - duplicated.length)));
      }
      prizeSegments = duplicated;
    }

    segments.push(...prizeSegments);

    if (segments.length > 8) {
      const specialSegments = segments.filter(s => s.type !== 'prize');
      const prizeSegs = segments.filter(s => s.type === 'prize').slice(0, 8 - specialSegments.length);
      return [...specialSegments, ...prizeSegs];
    }

    while (segments.length < 6) {
      segments.push({ type: 'unlucky', label: '#UNLUCKY#', color: '#1a1a1a', textColor: '#ff4444' });
    }

    const prizeSegs = segments.filter(s => s.type === 'prize');
    const specialSegs = segments.filter(s => s.type !== 'prize');
    const interleaved: WheelSegment[] = [];

    const maxLen = Math.max(prizeSegs.length, specialSegs.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < prizeSegs.length) interleaved.push(prizeSegs[i]);
      if (i < specialSegs.length) interleaved.push(specialSegs[i]);
    }

    return interleaved;
  };

  const allSegments = generateWheelSegments();
  const totalSegments = allSegments.length;
  const segmentAngle = totalSegments > 0 ? 360 / totalSegments : 0;

  const selectWinningSegment = () => {
    const totalPrizeProbability = prizes.reduce((sum, prize) => sum + (prize.probability || 0), 0);
    const totalProbability = totalPrizeProbability + unluckyProbability + retryProbability;

    const random = Math.random() * totalProbability;

    let currentProb = 0;
    for (let i = 0; i < allSegments.length; i++) {
      const segment = allSegments[i];

      if (segment.type === 'prize' && segment.prize) {
        currentProb += (segment.prize.probability || 0);
        if (random <= currentProb) return i;
      } else if (segment.type === 'unlucky') {
        const unluckyCount = allSegments.filter(s => s.type === 'unlucky').length;
        currentProb += unluckyProbability / unluckyCount;
        if (random <= currentProb) return i;
      } else if (segment.type === 'retry') {
        const retryCount = allSegments.filter(s => s.type === 'retry').length;
        currentProb += retryProbability / retryCount;
        if (random <= currentProb) return i;
      }
    }

    return 0;
  };

  const spinWheel = async () => {
    if (isSpinning || spinsRemaining <= 0) return;

    setIsSpinning(true);
    setSpinsRemaining(prev => prev - 1);
    setResult('');
    setResultType(null);
    setCouponCode('');
    setWinner(null);

    const winnerIndex = selectWinningSegment();
    const winningSegment = allSegments[winnerIndex];

    // Calculate rotation to land on winning segment
    // Segments are drawn starting from -90° (top), so segment center position is:
    // segmentVisualCenter = winnerIndex * segmentAngle + segmentAngle/2 - 90
    // To align this segment with the pointer at top (-90°), we need to rotate by:
    // targetAngle = -90 - segmentVisualCenter = -90 - (winnerIndex * segmentAngle + segmentAngle/2 - 90)
    //             = -winnerIndex * segmentAngle - segmentAngle/2
    const segmentVisualCenter = (winnerIndex * segmentAngle) + (segmentAngle / 2) - 90;
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.6; // Random offset within segment

    // Calculate target angle to align segment with pointer at top
    const targetAngle = -90 - segmentVisualCenter - randomOffset;

    // Normalize current rotation
    const currentNormalized = rotation % 360;
    const distToTarget = ((targetAngle - currentNormalized) % 360 + 360) % 360;

    // Add 5-7 full spins
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = rotation + (extraSpins * 360) + distToTarget;

    setRotation(totalRotation);

    setTimeout(async () => {
      let type: 'win' | 'retry' | 'lost' = 'lost';
      let selectedPrize: Prize | undefined = undefined;

      if (winningSegment.type === 'prize' && winningSegment.prize) {
        type = 'win';
        selectedPrize = winningSegment.prize;
      } else if (winningSegment.type === 'retry') {
        type = 'retry';
      } else {
        type = 'lost';
      }

      setWinner(winningSegment);
      await handleSpinComplete(selectedPrize, type);
      setIsSpinning(false);
    }, 5000);
  };

  const handleSpinComplete = async (prize: Prize | undefined, type: 'win' | 'retry' | 'lost') => {
    setResultType(type);

    if (type === 'win' && prize) {
      setIsSaving(true);
      setSaveError(false);
      setResult(prize.name);

      if (typeof window !== 'undefined' && (window as any).confetti) {
        (window as any).confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#2d8a3e', '#ffb700', '#ff9500']
        });
      }

      try {
        const userToken = localStorage.getItem('user_token') || crypto.randomUUID();
        localStorage.setItem('user_token', userToken);

        const { data: spinData, error: spinError } = await supabase
          .from('spins')
          .insert({
            merchant_id: shopId,
            prize_id: prize.id,
            user_token: userToken,
          })
          .select()
          .maybeSingle();

        if (spinError) throw spinError;

        if (spinData) {
          const generatedCode = `${merchant.business_name?.substring(0, 3).toUpperCase()}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);

          const { error: couponError } = await supabase.from('coupons').insert({
            spin_id: spinData.id,
            merchant_id: shopId,
            code: generatedCode,
            prize_name: prize.name,
            expires_at: expiresAt.toISOString(),
          });

          if (couponError) throw couponError;

          setCouponCode(generatedCode);

          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              merchantId: shopId,
              type: 'spin',
              title: '🎰 Nouveau gain !',
              message: `Un client a gagné "${prize.name}" !`,
              data: { prizeName: prize.name, couponCode: generatedCode },
            }),
          }).catch(() => {});

          if (phoneFromUrl && merchant?.workflow_mode === 'whatsapp') {
            fetch('/api/whatsapp/congratulate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                merchantId: shopId,
                phoneNumber: phoneFromUrl,
                prizeName: prize.name,
                couponCode: generatedCode,
                language: currentLang,
              }),
            }).catch(() => {});
          }
        }
      } catch {
        setSaveError(true);
      } finally {
        setIsSaving(false);
      }
    } else if (type === 'retry') {
      setResult(t('wheel.retry'));
      setSpinsRemaining(prev => prev + 1);
    } else {
      setResult(t('wheel.unlucky'));
      setHasSpun(true);
    }
  };

  // SVG helpers for wheel rendering
  const createSegmentPath = (index: number, radius: number, innerRadius: number) => {
    const startAngle = (index * segmentAngle - 90) * Math.PI / 180;
    const endAngle = ((index + 1) * segmentAngle - 90) * Math.PI / 180;

    const x1 = 200 + radius * Math.cos(startAngle);
    const y1 = 200 + radius * Math.sin(startAngle);
    const x2 = 200 + radius * Math.cos(endAngle);
    const y2 = 200 + radius * Math.sin(endAngle);
    const x3 = 200 + innerRadius * Math.cos(endAngle);
    const y3 = 200 + innerRadius * Math.sin(endAngle);
    const x4 = 200 + innerRadius * Math.cos(startAngle);
    const y4 = 200 + innerRadius * Math.sin(startAngle);

    return `M ${x4} ${y4} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  const getTextPosition = (index: number) => {
    const midAngle = ((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180;
    const radius = 130;
    return {
      x: 200 + radius * Math.cos(midAngle),
      y: 200 + radius * Math.sin(midAngle),
      rotation: index * segmentAngle + segmentAngle / 2
    };
  };

  // Decorative balls
  const decorativeBalls = [];
  const ballCount = Math.max(12, totalSegments);
  for (let i = 0; i < ballCount; i++) {
    const angle = (i * (360 / ballCount) - 90) * Math.PI / 180;
    decorativeBalls.push({
      x: 200 + 185 * Math.cos(angle),
      y: 200 + 185 * Math.sin(angle)
    });
  }

  const isUnlucky = winner && winner.label === '#UNLUCKY#';

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#4a4a52]">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (hasSpun) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {merchant?.background_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${merchant.background_url})` }}
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-[#4a4a52]"></div>
        )}
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('wheel.alreadySpun')}
          </h1>
          <p className="text-gray-600">{t('wheel.tryAgainTomorrow')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-8 pb-16 px-4 relative overflow-x-hidden overflow-y-auto"
      style={{
        backgroundColor: merchant?.wheel_bg_color || '#4a4a52'
      }}
    >
      {/* Background */}
      {merchant?.background_url && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center blur-sm"
            style={{ backgroundImage: `url(${merchant.background_url})` }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </>
      )}

      {/* Wheel Assembly */}
      <div className="relative z-10" style={{ perspective: '1200px' }}>

        {/* Pointer at TOP pointing DOWN */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30"
          style={{ top: '-25px' }}
        >
          {merchant?.logo_url ? (
            <div className="flex flex-col items-center">
              <div
                className="w-20 h-20 rounded-full p-2 shadow-xl flex items-center justify-center border-4 border-amber-400 mb-[-15px] relative z-10"
                style={{ backgroundColor: merchant.logo_background_color || '#FFFFFF' }}
              >
                <img
                  src={merchant.logo_url}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <svg width="70" height="50" viewBox="0 0 70 50" style={{ marginTop: '-10px' }}>
                <defs>
                  <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B6914" />
                    <stop offset="25%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#F5E6A3" />
                    <stop offset="75%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#8B6914" />
                  </linearGradient>
                </defs>
                <path
                  d="M35 50 L15 0 L55 0 Z"
                  fill="url(#pointerGradient)"
                  stroke="#8B6914"
                  strokeWidth="1"
                />
              </svg>
            </div>
          ) : (
            <svg width="70" height="90" viewBox="0 0 70 90" style={{ filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.5))' }}>
              <defs>
                <linearGradient id="pointerGradientDefault" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4A0F2A" />
                  <stop offset="25%" stopColor="#6B1B3D" />
                  <stop offset="50%" stopColor="#8B2252" />
                  <stop offset="75%" stopColor="#6B1B3D" />
                  <stop offset="100%" stopColor="#4A0F2A" />
                </linearGradient>
                <radialGradient id="pointerCenterGold" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#F5E6A3" />
                  <stop offset="40%" stopColor="#D4AF37" />
                  <stop offset="70%" stopColor="#B8860B" />
                  <stop offset="100%" stopColor="#8B6914" />
                </radialGradient>
              </defs>
              <path
                d="M35 90 C15 70, 5 50, 5 35 C5 15, 18 2, 35 2 C52 2, 65 15, 65 35 C65 50, 55 70, 35 90 Z"
                fill="url(#pointerGradientDefault)"
                stroke="#3A0820"
                strokeWidth="2"
              />
              <circle cx="35" cy="32" r="22" fill="url(#pointerCenterGold)" stroke="#8B6914" strokeWidth="1" />
              <circle cx="35" cy="32" r="17" fill="#B8860B" />
              <circle cx="35" cy="32" r="13" fill="#D4AF37" />
              <ellipse cx="28" cy="25" rx="6" ry="5" fill="rgba(255,255,255,0.35)" />
            </svg>
          )}
        </div>

        {/* Main Wheel */}
        <div className="relative" style={{ transform: 'rotateX(5deg)' }}>
          <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.15, 0.60, 0.15, 1)' : 'none',
              filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.4))'
            }}
          >
            <defs>
              <linearGradient id="goldRimOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" />
                <stop offset="20%" stopColor="#F5E6A3" />
                <stop offset="40%" stopColor="#D4AF37" />
                <stop offset="60%" stopColor="#B8860B" />
                <stop offset="80%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>

              <linearGradient id="goldRimInner" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B8860B" />
                <stop offset="25%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#F5E6A3" />
                <stop offset="75%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>

              <radialGradient id="centerHubGold" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#F5E6A3" />
                <stop offset="30%" stopColor="#D4AF37" />
                <stop offset="60%" stopColor="#B8860B" />
                <stop offset="100%" stopColor="#8B6914" />
              </radialGradient>

              <linearGradient id="segmentShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
              </linearGradient>

              <linearGradient id="blackSegmentShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
              </linearGradient>
            </defs>

            {/* Outer gold ring */}
            <circle cx="200" cy="200" r="198" fill="url(#goldRimOuter)" />
            <circle cx="200" cy="200" r="190" fill="url(#goldRimInner)" />
            <circle cx="200" cy="200" r="182" fill="#1a1a1a" />

            {/* Segments */}
            {allSegments.map((segment, index) => {
              const pos = getTextPosition(index);
              const isBlackSegment = segment.color === '#1a1a1a' || segment.color === '#000000';
              return (
                <g key={`segment-${index}`}>
                  <path
                    d={createSegmentPath(index, 178, 60)}
                    fill={segment.color}
                    stroke="rgba(0,0,0,0.15)"
                    strokeWidth="1"
                  />
                  <path
                    d={createSegmentPath(index, 178, 60)}
                    fill={isBlackSegment ? "url(#blackSegmentShine)" : "url(#segmentShine)"}
                  />
                  {/* Skull icon for UNLUCKY segment */}
                  {segment.label === '#UNLUCKY#' && (
                    <text
                      x={200 + 105 * Math.cos(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}
                      y={200 + 105 * Math.sin(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}
                      fontSize="16"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${index * segmentAngle + segmentAngle / 2}, ${200 + 105 * Math.cos(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}, ${200 + 105 * Math.sin(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)})`}
                    >
                      💀
                    </text>
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    fill={segment.textColor}
                    fontSize={segment.label.length > 8 ? "12" : "16"}
                    fontWeight="bold"
                    fontFamily="Arial Black, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
                    style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}

            {/* Decorative balls */}
            {decorativeBalls.map((ball, i) => (
              <g key={`ball-${i}`}>
                <ellipse cx={ball.x + 2} cy={ball.y + 3} rx="8" ry="6" fill="rgba(0,0,0,0.3)" />
                <circle cx={ball.x} cy={ball.y} r="9" fill="#E0E0E0" />
                <circle cx={ball.x} cy={ball.y} r="8" fill="#F8F8F8" />
                <circle cx={ball.x} cy={ball.y} r="6" fill="#FFFFFF" />
                <ellipse cx={ball.x - 2} cy={ball.y - 2} rx="3" ry="2.5" fill="rgba(255,255,255,1)" />
              </g>
            ))}

            {/* Center Hub with concentric rings */}
            <circle cx="200" cy="200" r="58" fill="url(#goldRimOuter)" />
            <circle cx="200" cy="200" r="54" fill="url(#centerHubGold)" />

            {/* Concentric decorative rings */}
            <circle cx="200" cy="200" r="48" fill="none" stroke="#8B6914" strokeWidth="2" />
            <circle cx="200" cy="200" r="42" fill="none" stroke="#B8860B" strokeWidth="2" />
            <circle cx="200" cy="200" r="36" fill="none" stroke="#8B6914" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="30" fill="none" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="24" fill="none" stroke="#8B6914" strokeWidth="1" />
            <circle cx="200" cy="200" r="18" fill="none" stroke="#B8860B" strokeWidth="1" />

            {/* Center highlight */}
            <ellipse cx="185" cy="185" rx="18" ry="14" fill="rgba(255,255,255,0.25)" />
          </svg>

          {/* SPIN Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full font-black text-lg tracking-wider transition-all z-20 flex items-center justify-center"
            style={{
              background: isSpinning
                ? 'radial-gradient(circle at 35% 35%, #666 0%, #444 50%, #333 100%)'
                : 'radial-gradient(circle at 35% 35%, #F5E6A3 0%, #D4AF37 30%, #B8860B 70%, #8B6914 100%)',
              color: isSpinning ? '#888' : '#4a2c00',
              boxShadow: isSpinning
                ? 'inset 0 2px 5px rgba(0,0,0,0.5)'
                : '0 4px 15px rgba(139,105,20,0.5), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.2)',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              textShadow: isSpinning ? 'none' : '0 1px 0 rgba(255,255,255,0.3)',
              border: '3px solid #8B6914',
              transform: 'translate(-50%, -50%) rotateX(-5deg)'
            }}
          >
            {isSpinning ? (
              <span className="animate-pulse">•••</span>
            ) : (
              'SPIN'
            )}
          </button>
        </div>

        {/* Gold Pedestal */}
        <div className="flex flex-col items-center -mt-2" style={{ filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.4))' }}>
          <svg width="80" height="55" viewBox="0 0 80 55">
            <defs>
              <linearGradient id="standNeck" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B6914" />
                <stop offset="25%" stopColor="#B8860B" />
                <stop offset="50%" stopColor="#F5E6A3" />
                <stop offset="75%" stopColor="#B8860B" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>
            </defs>
            <path d="M28 0 L52 0 L58 55 L22 55 Z" fill="url(#standNeck)" />
            <ellipse cx="40" cy="5" rx="14" ry="5" fill="#D4AF37" />
          </svg>

          <svg width="130" height="55" viewBox="0 0 130 55" className="-mt-1">
            <defs>
              <linearGradient id="standBase" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B6914" />
                <stop offset="20%" stopColor="#B8860B" />
                <stop offset="40%" stopColor="#D4AF37" />
                <stop offset="50%" stopColor="#F5E6A3" />
                <stop offset="60%" stopColor="#D4AF37" />
                <stop offset="80%" stopColor="#B8860B" />
                <stop offset="100%" stopColor="#8B6914" />
              </linearGradient>
            </defs>
            <path d="M45 0 L85 0 L110 40 L110 48 L20 48 L20 40 Z" fill="url(#standBase)" />
            <ellipse cx="65" cy="5" rx="22" ry="7" fill="#D4AF37" />
            <rect x="20" y="45" width="90" height="8" rx="2" fill="url(#standBase)" />
            <ellipse cx="55" cy="25" rx="12" ry="16" fill="rgba(255,255,255,0.1)" />
          </svg>
        </div>
      </div>

      {/* Winner Display */}
      {winner && (
        <div
          className="mt-8 p-6 rounded-2xl text-center max-w-sm relative z-20 mx-4 w-full sm:w-auto"
          style={{
            background: isUnlucky
              ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(60,20,20,0.95) 100%)'
              : resultType === 'retry'
              ? 'linear-gradient(135deg, rgba(212,165,116,0.95) 0%, rgba(180,130,80,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(212,175,55,0.95) 0%, rgba(139,105,20,0.95) 100%)',
            border: isUnlucky ? '2px solid #ff4444' : '2px solid #D4AF37',
            boxShadow: isUnlucky ? '0 0 40px rgba(255,50,50,0.4)' : '0 0 40px rgba(212,175,55,0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {resultType === 'win' ? (
            <>
              <p className="text-amber-400 text-lg">🎉 Félicitations!</p>
              <p
                className="text-4xl font-black mt-2"
                style={{
                  color: '#ffffff',
                  textShadow: '0 0 20px rgba(212,175,55,0.5)'
                }}
              >
                {result}
              </p>
              <button
                disabled={isSaving || !couponCode}
                onClick={() => router.push(`/coupon/${shopId}?code=${couponCode}&lang=${currentLang}`)}
                className={`mt-4 w-full py-3 px-6 font-bold rounded-xl transition-colors text-lg ${
                  isSaving || !couponCode
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {isSaving ? 'Génération...' : 'Récupérer mon prix →'}
              </button>
              {saveError && (
                <p className="text-red-500 mt-2 text-sm font-bold">Erreur. Contactez le support.</p>
              )}
            </>
          ) : resultType === 'retry' ? (
            <>
              <p className="text-amber-400 text-lg">🔄 Réessayez!</p>
              <p className="text-2xl font-black mt-2 text-white">Vous avez un tour gratuit!</p>
              <button
                onClick={() => { setWinner(null); setResult(''); }}
                className="mt-4 w-full py-3 px-6 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors text-lg"
              >
                Tourner encore ↻
              </button>
            </>
          ) : (
            <>
              <p className="text-red-400 text-lg">😈 Pas de chance!</p>
              <p
                className="text-4xl font-black mt-2"
                style={{
                  color: '#ff4444',
                  textShadow: '0 0 20px rgba(255,50,50,0.5)'
                }}
              >
                💀 UNLUCKY 💀
              </p>
              <p className="text-gray-400 text-sm mt-2">Retentez votre chance demain!</p>
            </>
          )}
        </div>
      )}

      {/* Footer instruction */}
      <p className="mt-6 text-gray-400 text-sm relative z-10">
        Cliquez sur <span className="text-amber-400 font-bold">SPIN</span> au centre pour tourner!
      </p>
    </div>
  );
}
