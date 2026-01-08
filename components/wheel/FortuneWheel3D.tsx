'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface WheelSegment {
  id: string;
  name: string;
  probability: number;
  color: string;
  textColor: string;
  type: 'prize' | 'unlucky' | 'retry';
}

interface FortuneWheel3DProps {
  segments: WheelSegment[];
  onSpinComplete: (segment: WheelSegment) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
  merchantLogo?: string;
  merchantName?: string;
  bgColor?: string;
  disabled?: boolean;
}

export function FortuneWheel3D({
  segments,
  onSpinComplete,
  isSpinning,
  setIsSpinning,
  merchantLogo,
  merchantName,
  bgColor = '#4a4a52',
  disabled = false,
}: FortuneWheel3DProps) {
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<WheelSegment | null>(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  const totalProbability = segments.reduce((sum, p) => sum + p.probability, 0);
  const segmentAngle = 360 / segments.length;

  const selectWinner = (): number => {
    const random = Math.random() * totalProbability;
    let cumulative = 0;
    for (let i = 0; i < segments.length; i++) {
      cumulative += segments[i].probability;
      if (random <= cumulative) return i;
    }
    return segments.length - 1;
  };

  const spinWheel = () => {
    if (isSpinning || disabled) return;
    setIsSpinning(true);
    setWinner(null);

    const winnerIndex = selectWinner();
    const segmentMiddle = winnerIndex * segmentAngle + segmentAngle / 2;
    const extraSpins = 5 + Math.random() * 3;
    const targetRotation = rotation + (extraSpins * 360) + (360 - segmentMiddle) - (rotation % 360);

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(segments[winnerIndex]);
      onSpinComplete(segments[winnerIndex]);
    }, 5000);
  };

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

  // Decorative balls - adjusted based on segment count
  const decorativeBalls = [];
  const ballCount = Math.max(12, segments.length);
  for (let i = 0; i < ballCount; i++) {
    const angle = (i * (360 / ballCount) - 90) * Math.PI / 180;
    decorativeBalls.push({
      x: 200 + 185 * Math.cos(angle),
      y: 200 + 185 * Math.sin(angle)
    });
  }

  const isUnlucky = winner && winner.type === 'unlucky';

  if (segments.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-[400px] bg-gray-100 rounded-full">
        <p className="text-gray-500 text-center px-4">
          Ajoutez des prix pour voir la roue
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center p-4 relative"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Wheel Assembly */}
      <div className="relative" style={{ perspective: '1200px' }}>

        {/* Pointer at TOP pointing DOWN */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-30"
          style={{ top: '-25px' }}
        >
          {merchantLogo ? (
            <div className="flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full p-1 shadow-xl flex items-center justify-center border-4 border-[#D4AF37] mb-[-12px] relative z-10 bg-white"
              >
                <img
                  src={merchantLogo}
                  alt={merchantName || 'Logo'}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <svg width="50" height="45" viewBox="0 0 50 45" style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.4))' }}>
                <defs>
                  <linearGradient id="pointerGradientLogo" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8B6914" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#8B6914" />
                  </linearGradient>
                </defs>
                <path
                  d="M25 45 L5 0 L45 0 Z"
                  fill="url(#pointerGradientLogo)"
                  stroke="#8B6914"
                  strokeWidth="1"
                />
              </svg>
            </div>
          ) : (
            <svg width="70" height="90" viewBox="0 0 70 90" style={{ filter: 'drop-shadow(3px 4px 6px rgba(0,0,0,0.5))' }}>
              <defs>
                <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                <linearGradient id="pointerShine" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
                </linearGradient>
              </defs>

              {/* Teardrop shape pointing DOWN */}
              <path
                d="M35 90 C15 70, 5 50, 5 35 C5 15, 18 2, 35 2 C52 2, 65 15, 65 35 C65 50, 55 70, 35 90 Z"
                fill="url(#pointerGradient)"
                stroke="#3A0820"
                strokeWidth="2"
              />

              {/* Shine overlay */}
              <path
                d="M35 90 C15 70, 5 50, 5 35 C5 15, 18 2, 35 2 C52 2, 65 15, 65 35 C65 50, 55 70, 35 90 Z"
                fill="url(#pointerShine)"
              />

              {/* Gold center circle with concentric rings */}
              <circle cx="35" cy="32" r="22" fill="url(#pointerCenterGold)" stroke="#8B6914" strokeWidth="1" />
              <circle cx="35" cy="32" r="17" fill="#B8860B" />
              <circle cx="35" cy="32" r="13" fill="#D4AF37" />
              <circle cx="35" cy="32" r="10" fill="none" stroke="#8B6914" strokeWidth="1.5" />
              <circle cx="35" cy="32" r="7" fill="none" stroke="#B8860B" strokeWidth="1" />
              <circle cx="35" cy="32" r="4" fill="#8B6914" />
              <circle cx="35" cy="32" r="2" fill="#D4AF37" />

              {/* Highlight */}
              <ellipse cx="28" cy="25" rx="6" ry="5" fill="rgba(255,255,255,0.35)" />
            </svg>
          )}
        </div>

        {/* Main Wheel */}
        <div className="relative" style={{ transform: 'rotateX(5deg)' }}>
          <svg
            ref={wheelRef}
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
            {segments.map((segment, index) => {
              const pos = getTextPosition(index);
              const isBlackSegment = segment.color === '#1a1a1a' || segment.color === '#000000';
              return (
                <g key={segment.id}>
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
                  {segment.type === 'unlucky' && (
                    <text
                      x={200 + 105 * Math.cos(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}
                      y={200 + 105 * Math.sin(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}
                      fontSize="16"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${index * segmentAngle + segmentAngle / 2}, ${200 + 105 * Math.cos(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}, ${200 + 105 * Math.sin(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)})`}
                    >

                    </text>
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    fill={segment.textColor}
                    fontSize={segment.name.length > 8 ? "12" : segment.name.length > 6 ? "14" : "18"}
                    fontWeight="bold"
                    fontFamily="Arial Black, sans-serif"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
                    style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                  >
                    {segment.name}
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
            disabled={isSpinning || disabled}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full font-black text-lg tracking-wider transition-all z-20 flex items-center justify-center"
            style={{
              background: isSpinning || disabled
                ? 'radial-gradient(circle at 35% 35%, #666 0%, #444 50%, #333 100%)'
                : 'radial-gradient(circle at 35% 35%, #F5E6A3 0%, #D4AF37 30%, #B8860B 70%, #8B6914 100%)',
              color: isSpinning || disabled ? '#888' : '#4a2c00',
              boxShadow: isSpinning || disabled
                ? 'inset 0 2px 5px rgba(0,0,0,0.5)'
                : '0 4px 15px rgba(139,105,20,0.5), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.2)',
              cursor: isSpinning || disabled ? 'not-allowed' : 'pointer',
              textShadow: isSpinning || disabled ? 'none' : '0 1px 0 rgba(255,255,255,0.3)',
              border: '3px solid #8B6914',
              transform: 'translate(-50%, -50%) rotateX(-5deg)'
            }}
          >
            {isSpinning ? (
              <span className="animate-pulse">...</span>
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
    </div>
  );
}

export default FortuneWheel3D;
