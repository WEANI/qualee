'use client';

import React, { useMemo } from 'react';
import { Prize } from '@/lib/types/database';

interface WheelSegment {
  id: string;
  name: string;
  color: string;
  textColor: string;
  type: 'prize' | 'unlucky' | 'retry';
}

export interface PrizeWithQuantity {
  prize: Prize;
  quantity: number;
}

interface SegmentColor {
  color: string;
  textColor: string;
}

interface WheelPreviewProps {
  prizeQuantities: PrizeWithQuantity[];
  unluckyQuantity: number;
  retryQuantity: number;
  size?: number;
  maxSegments?: number;
  segmentColors?: SegmentColor[];
}

// Default color palette for prize segments
const DEFAULT_COLORS: SegmentColor[] = [
  { color: '#E85A5A', textColor: '#ffffff' },
  { color: '#F5C6C6', textColor: '#8B4513' },
  { color: '#D4548A', textColor: '#ffffff' },
  { color: '#D4A574', textColor: '#ffffff' },
  { color: '#E85A5A', textColor: '#ffffff' },
  { color: '#F5C6C6', textColor: '#8B4513' },
  { color: '#D4548A', textColor: '#ffffff' },
  { color: '#D4A574', textColor: '#ffffff' },
];

// Distribute segments evenly so same-type segments are not adjacent
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

export function WheelPreview({
  prizeQuantities,
  unluckyQuantity,
  retryQuantity,
  size = 300,
  maxSegments = 8,
  segmentColors = DEFAULT_COLORS
}: WheelPreviewProps) {

  // Build segments array based on quantities
  const segments = useMemo(() => {
    const allSegments: WheelSegment[] = [];
    let colorIndex = 0;

    // Add prize segments based on quantity
    prizeQuantities.forEach(({ prize, quantity }) => {
      for (let i = 0; i < quantity; i++) {
        const colors = segmentColors[colorIndex % segmentColors.length] || DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
        allSegments.push({
          id: `${prize.id}-${i}`,
          name: prize.name.length > 10 ? prize.name.substring(0, 10) + '...' : prize.name,
          color: colors.color,
          textColor: colors.textColor,
          type: 'prize',
        });
        colorIndex++;
      }
    });

    // Add UNLUCKY segments based on quantity
    for (let i = 0; i < unluckyQuantity; i++) {
      allSegments.push({
        id: `unlucky-${i}`,
        name: '#UNLUCKY#',
        color: '#1a1a1a',
        textColor: '#ff4444',
        type: 'unlucky',
      });
    }

    // Add RETRY segments based on quantity
    for (let i = 0; i < retryQuantity; i++) {
      allSegments.push({
        id: `retry-${i}`,
        name: '#RÉESSAYER#',
        color: '#D4A574',
        textColor: '#ffffff',
        type: 'retry',
      });
    }

    return distributeSegments(allSegments);
  }, [prizeQuantities, unluckyQuantity, retryQuantity, segmentColors]);

  const totalSegments = segments.length;
  const segmentAngle = totalSegments > 0 ? 360 / totalSegments : 0;
  const viewBoxSize = 400;
  const center = 200;
  const outerRadius = 178;
  const innerRadius = 60;

  // SVG helpers
  const createSegmentPath = (index: number, radius: number, inner: number) => {
    const startAngle = (index * segmentAngle - 90) * Math.PI / 180;
    const endAngle = ((index + 1) * segmentAngle - 90) * Math.PI / 180;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const x3 = center + inner * Math.cos(endAngle);
    const y3 = center + inner * Math.sin(endAngle);
    const x4 = center + inner * Math.cos(startAngle);
    const y4 = center + inner * Math.sin(startAngle);

    return `M ${x4} ${y4} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 0 0 ${x4} ${y4} Z`;
  };

  const getTextPosition = (index: number) => {
    const midAngle = ((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180;
    const textRadius = 130;
    return {
      x: center + textRadius * Math.cos(midAngle),
      y: center + textRadius * Math.sin(midAngle),
      rotation: index * segmentAngle + segmentAngle / 2
    };
  };

  // Decorative balls
  const decorativeBalls = [];
  const ballCount = Math.max(12, totalSegments);
  for (let i = 0; i < ballCount; i++) {
    const angle = (i * (360 / ballCount) - 90) * Math.PI / 180;
    decorativeBalls.push({
      x: center + 185 * Math.cos(angle),
      y: center + 185 * Math.sin(angle)
    });
  }

  if (totalSegments === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-full"
        style={{ width: size, height: size }}
      >
        <p className="text-gray-500 text-sm text-center px-4">
          Ajoutez des prix pour voir la roue
        </p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Pointer at top */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{ top: '-10px' }}
      >
        <svg width="40" height="50" viewBox="0 0 70 90" style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.4))' }}>
          <defs>
            <linearGradient id="previewPointer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A0F2A" />
              <stop offset="50%" stopColor="#8B2252" />
              <stop offset="100%" stopColor="#4A0F2A" />
            </linearGradient>
            <radialGradient id="previewPointerGold" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#F5E6A3" />
              <stop offset="40%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B6914" />
            </radialGradient>
          </defs>
          <path
            d="M35 90 C15 70, 5 50, 5 35 C5 15, 18 2, 35 2 C52 2, 65 15, 65 35 C65 50, 55 70, 35 90 Z"
            fill="url(#previewPointer)"
            stroke="#3A0820"
            strokeWidth="2"
          />
          <circle cx="35" cy="32" r="18" fill="url(#previewPointerGold)" stroke="#8B6914" strokeWidth="1" />
          <circle cx="35" cy="32" r="12" fill="#B8860B" />
          <circle cx="35" cy="32" r="8" fill="#D4AF37" />
        </svg>
      </div>

      {/* Wheel SVG */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="drop-shadow-xl"
        style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="previewGoldRimOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="20%" stopColor="#F5E6A3" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#B8860B" />
            <stop offset="80%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>

          <linearGradient id="previewGoldRimInner" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#F5E6A3" />
            <stop offset="75%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>

          <radialGradient id="previewCenterHub" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F5E6A3" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B6914" />
          </radialGradient>

          <linearGradient id="previewSegmentShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
          </linearGradient>

          <linearGradient id="previewBlackShine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </linearGradient>
        </defs>

        {/* Outer gold ring */}
        <circle cx={center} cy={center} r="198" fill="url(#previewGoldRimOuter)" />
        <circle cx={center} cy={center} r="190" fill="url(#previewGoldRimInner)" />
        <circle cx={center} cy={center} r="182" fill="#1a1a1a" />

        {/* Segments */}
        {segments.map((segment, index) => {
          const pos = getTextPosition(index);
          const isBlackSegment = segment.color === '#1a1a1a' || segment.color === '#000000';
          return (
            <g key={segment.id}>
              <path
                d={createSegmentPath(index, outerRadius, innerRadius)}
                fill={segment.color}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1"
              />
              <path
                d={createSegmentPath(index, outerRadius, innerRadius)}
                fill={isBlackSegment ? "url(#previewBlackShine)" : "url(#previewSegmentShine)"}
              />
              {/* Skull for UNLUCKY */}
              {segment.type === 'unlucky' && (
                <text
                  x={center + 105 * Math.cos(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}
                  y={center + 105 * Math.sin(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}
                  fontSize="14"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${index * segmentAngle + segmentAngle / 2}, ${center + 105 * Math.cos(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)}, ${center + 105 * Math.sin(((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180)})`}
                >
                  💀
                </text>
              )}
              <text
                x={pos.x}
                y={pos.y}
                fill={segment.textColor}
                fontSize={segment.name.length > 8 ? "10" : "14"}
                fontWeight="bold"
                fontFamily="Arial Black, sans-serif"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {segment.name}
              </text>
            </g>
          );
        })}

        {/* Decorative balls */}
        {decorativeBalls.map((ball, i) => (
          <g key={`ball-${i}`}>
            <ellipse cx={ball.x + 1} cy={ball.y + 2} rx="6" ry="4" fill="rgba(0,0,0,0.3)" />
            <circle cx={ball.x} cy={ball.y} r="7" fill="#E0E0E0" />
            <circle cx={ball.x} cy={ball.y} r="6" fill="#F8F8F8" />
            <circle cx={ball.x} cy={ball.y} r="4" fill="#FFFFFF" />
            <ellipse cx={ball.x - 1} cy={ball.y - 1} rx="2" ry="1.5" fill="rgba(255,255,255,1)" />
          </g>
        ))}

        {/* Center Hub with gold rings */}
        <circle cx={center} cy={center} r="58" fill="url(#previewGoldRimOuter)" />
        <circle cx={center} cy={center} r="54" fill="url(#previewCenterHub)" />
        <circle cx={center} cy={center} r="48" fill="none" stroke="#8B6914" strokeWidth="2" />
        <circle cx={center} cy={center} r="42" fill="none" stroke="#B8860B" strokeWidth="2" />
        <circle cx={center} cy={center} r="36" fill="none" stroke="#8B6914" strokeWidth="1.5" />
        <circle cx={center} cy={center} r="30" fill="none" stroke="#D4AF37" strokeWidth="1.5" />

        {/* SPIN text in center */}
        <text
          x={center}
          y={center}
          fill="#4a2c00"
          fontSize="24"
          fontWeight="bold"
          fontFamily="Arial Black, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
        >
          SPIN
        </text>
      </svg>
    </div>
  );
}
