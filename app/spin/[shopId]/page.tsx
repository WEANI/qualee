'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Prize } from '@/lib/types/database';
import { useTranslation } from 'react-i18next';
import { FortuneWheel3D, WheelSegment } from '@/components/wheel/FortuneWheel3D';
import '@/lib/i18n/config';

// Default color palette for prize segments
const DEFAULT_PRIZE_COLORS = [
  '#FF9F1C', // Orange primary
  '#FFBF69', // Orange light
  '#2EC4B6', // Turquoise primary
  '#CBF3F0', // Turquoise light
  '#E85A5A', // Red
  '#D4A574', // Gold/Bronze
];

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
  const [unluckyQuantity, setUnluckyQuantity] = useState(1);
  const [retryQuantity, setRetryQuantity] = useState(1);

  // Segment colors
  const [unluckyColor, setUnluckyColor] = useState('#1a1a1a');
  const [unluckyTextColor, setUnluckyTextColor] = useState('#ff4444');
  const [retryColor, setRetryColor] = useState('#F59E0B');
  const [retryTextColor, setRetryTextColor] = useState('#1F2937');

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
          .single();

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
        if (merchantData.unlucky_quantity !== undefined) {
          setUnluckyQuantity(merchantData.unlucky_quantity);
        }
        if (merchantData.retry_quantity !== undefined) {
          setRetryQuantity(merchantData.retry_quantity);
        }
        // Load segment colors
        if (merchantData.unlucky_color) {
          setUnluckyColor(merchantData.unlucky_color);
        }
        if (merchantData.unlucky_text_color) {
          setUnluckyTextColor(merchantData.unlucky_text_color);
        }
        if (merchantData.retry_color) {
          setRetryColor(merchantData.retry_color);
        }
        if (merchantData.retry_text_color) {
          setRetryTextColor(merchantData.retry_text_color);
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

  // Distribute segments evenly
  function distributeSegments(segments: WheelSegment[]): WheelSegment[] {
    if (segments.length <= 2) return segments;

    const groups: Map<string, WheelSegment[]> = new Map();
    segments.forEach(seg => {
      const baseId = seg.id.replace(/-\d+$/, '');
      if (!groups.has(baseId)) {
        groups.set(baseId, []);
      }
      groups.get(baseId)!.push(seg);
    });

    const sortedGroups = Array.from(groups.values()).sort((a, b) => b.length - a.length);
    const result: WheelSegment[] = [];
    const totalSegments = segments.length;
    const groupPointers = sortedGroups.map(() => 0);

    for (let i = 0; i < totalSegments; i++) {
      let placed = false;

      for (let g = 0; g < sortedGroups.length; g++) {
        const group = sortedGroups[g];
        const pointer = groupPointers[g];

        if (pointer >= group.length) continue;

        const lastSegment = result[result.length - 1];
        const candidateBaseId = group[pointer].id.replace(/-\d+$/, '');
        const lastBaseId = lastSegment?.id.replace(/-\d+$/, '');

        if (!lastSegment || candidateBaseId !== lastBaseId) {
          result.push(group[pointer]);
          groupPointers[g]++;
          placed = true;
          break;
        }
      }

      if (!placed) {
        for (let g = 0; g < sortedGroups.length; g++) {
          if (groupPointers[g] < sortedGroups[g].length) {
            result.push(sortedGroups[g][groupPointers[g]]);
            groupPointers[g]++;
            break;
          }
        }
      }
    }

    return result;
  }

  // Generate wheel segments for FortuneWheel3D
  const wheelSegments: WheelSegment[] = useMemo(() => {
    const segments: WheelSegment[] = [];
    let colorIndex = 0;

    // Add prize segments
    prizes.forEach((prize) => {
      const quantity = merchant?.prize_quantities?.[prize.id] || 1;
      for (let i = 0; i < quantity; i++) {
        segments.push({
          id: `${prize.id}-${i}`,
          name: prize.name.length > 10 ? prize.name.substring(0, 10) + '...' : prize.name,
          probability: prize.probability || 10,
          color: prize.color || DEFAULT_PRIZE_COLORS[colorIndex % DEFAULT_PRIZE_COLORS.length],
          textColor: prize.text_color || '#ffffff',
          type: 'prize',
        });
      }
      colorIndex++;
    });

    // Add UNLUCKY segments
    for (let i = 0; i < unluckyQuantity; i++) {
      segments.push({
        id: `unlucky-${i}`,
        name: 'UNLUCKY',
        probability: unluckyProbability / unluckyQuantity,
        color: unluckyColor,
        textColor: unluckyTextColor,
        type: 'unlucky',
      });
    }

    // Add RETRY segments
    for (let i = 0; i < retryQuantity; i++) {
      segments.push({
        id: `retry-${i}`,
        name: 'RETRY',
        probability: retryProbability / retryQuantity,
        color: retryColor,
        textColor: retryTextColor,
        type: 'retry',
      });
    }

    // Distribute segments to avoid adjacency
    return distributeSegments(segments);
  }, [prizes, merchant, unluckyQuantity, retryQuantity, unluckyProbability, retryProbability, unluckyColor, unluckyTextColor, retryColor, retryTextColor]);

  const handleSpinComplete = async (segment: WheelSegment) => {
    setSpinsRemaining(prev => prev - 1);

    if (segment.type === 'prize') {
      // Find the original prize
      const prizeId = segment.id.replace(/-\d+$/, '');
      const prize = prizes.find(p => p.id === prizeId);

      if (prize) {
        setResultType('win');
        setResult(prize.name);
        setIsSaving(true);
        setSaveError(false);

        // Confetti effect
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
            .single();

          if (spinError) throw spinError;

          if (spinData) {
            const generatedCode = `${merchant.business_name?.substring(0, 3).toUpperCase() || 'PRZ'}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
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

            // Send spin notification
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

            // WhatsApp congratulation message
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
      }
    } else if (segment.type === 'retry') {
      setResultType('retry');
      setResult(t('wheel.retry'));
      setSpinsRemaining(prev => prev + 1);
    } else {
      setResultType('lost');
      setResult(t('wheel.unlucky'));
      setHasSpun(true);
    }
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9F1C] to-[#2EC4B6]">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (hasSpun && resultType !== 'retry') {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
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

      {/* Wheel */}
      <div className="relative z-10">
        <FortuneWheel3D
          segments={wheelSegments}
          onSpinComplete={handleSpinComplete}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
          merchantLogo={merchant?.logo_url}
          merchantName={merchant?.business_name}
          disabled={spinsRemaining <= 0 || hasSpun}
        />
      </div>

      {/* Result Display */}
      {result && (
        <div className="relative z-10 mt-6" style={{ animation: 'fadeIn 0.5s ease' }}>
          <div className="inline-block bg-black/90 px-8 py-6 rounded-2xl backdrop-blur-lg border-2 border-[#ffd700]" style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)' }}>
            {resultType === 'win' ? (
              <>
                <div className="text-xl text-[#ffd700] mb-3">🎊 FÉLICITATIONS ! 🎊</div>
                <div className="text-2xl text-white font-bold mb-4">{result}</div>
                <button
                  disabled={isSaving || !couponCode}
                  onClick={() => router.push(`/coupon/${shopId}?code=${couponCode}&lang=${currentLang}`)}
                  className={`w-full py-3 px-6 font-bold rounded-xl transition-colors text-lg ${
                    isSaving || !couponCode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#ffd700] text-black hover:bg-[#ffb700]'
                  }`}
                  style={!(isSaving || !couponCode) ? { boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)' } : {}}
                >
                  {isSaving ? 'Génération du coupon...' : 'Récupérer mon prix →'}
                </button>
                {saveError && (
                  <p className="text-red-500 mt-2 text-sm font-bold">Erreur de connexion. Veuillez contacter le support.</p>
                )}
              </>
            ) : resultType === 'retry' ? (
              <>
                <div className="text-xl text-[#ffd700] mb-3">🔄 RÉESSAYEZ ! 🔄</div>
                <div className="text-2xl text-white font-bold mb-4">Tentez à nouveau votre chance !</div>
                <button
                  onClick={() => setResult('')}
                  className="w-full py-3 px-6 bg-[#ffd700] text-black font-bold rounded-xl hover:bg-[#ffb700] transition-colors text-lg"
                  style={{ boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)' }}
                >
                  Tourner encore ↻
                </button>
              </>
            ) : (
              <>
                <div className="text-xl text-red-500 mb-3">😢 PERDU... 😢</div>
                <div className="text-xl text-white font-bold mb-4">Meilleure chance la prochaine fois !</div>
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 px-6 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-500 transition-colors text-lg"
                >
                  Retour
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer hint */}
      {!result && (
        <p className="relative z-10 mt-6 text-gray-300 text-sm">
          Cliquez sur <span className="text-[#ffd700] font-bold">SPIN</span> pour tourner la roue !
        </p>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
