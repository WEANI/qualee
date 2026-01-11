'use client';

import React, { useMemo } from 'react';
import { Prize } from '@/lib/types/database';

interface WheelSegment {
  id: string;
  name: string;
  color: string;
  textColor: string;
  type: 'prize' | 'unlucky' | 'retry';
  probability: number;
}

export interface PrizeWithQuantity {
  prize: Prize;
  quantity: number;
}

interface WheelPreviewProps {
  prizeQuantities: PrizeWithQuantity[];
  unluckyQuantity: number;
  retryQuantity: number;
  unluckyColor?: string;
  unluckyTextColor?: string;
  retryColor?: string;
  retryTextColor?: string;
  size?: number;
  maxSegments?: number;
}

// Default color palette for prize segments (fallback)
const DEFAULT_PRIZE_COLORS = [
  '#E85A5A', // Red
  '#F5C6C6', // Light pink
  '#D4548A', // Magenta
  '#D4A574', // Gold/Bronze
  '#FF9F1C', // Pink
  '#FFBF69', // Rose
];

// Distribute segments evenly so same-type segments are not adjacent
function distributeSegments(segments: WheelSegment[]): WheelSegment[] {
  if (segments.length <= 2) return segments;

  // Group segments by their base ID (without the index suffix)
  const groups: Map<string, WheelSegment[]> = new Map();
  segments.forEach(seg => {
    // Extract base ID (e.g., "prize-abc" from "prize-abc-0")
    const baseId = seg.id.replace(/-\d+$/, '');
    if (!groups.has(baseId)) {
      groups.set(baseId, []);
    }
    groups.get(baseId)!.push(seg);
  });

  // Sort groups by size (largest first) for better distribution
  const sortedGroups = Array.from(groups.values()).sort((a, b) => b.length - a.length);

  // Interleave segments from different groups
  const result: WheelSegment[] = [];
  const totalSegments = segments.length;
  const groupPointers = sortedGroups.map(() => 0);

  for (let i = 0; i < totalSegments; i++) {
    // Find a group that has remaining segments and won't create adjacency
    let placed = false;

    for (let g = 0; g < sortedGroups.length; g++) {
      const group = sortedGroups[g];
      const pointer = groupPointers[g];

      if (pointer >= group.length) continue;

      // Check if placing this segment would create adjacency
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

    // If no non-adjacent placement found, just place the next available
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
  unluckyColor = '#1a1a1a',
  unluckyTextColor = '#ff4444',
  retryColor = '#F59E0B',
  retryTextColor = '#1F2937',
  size = 300,
}: WheelPreviewProps) {

  // Build segments array based on quantities
  const segments = useMemo(() => {
    const allSegments: WheelSegment[] = [];
    let colorIndex = 0;

    // Add prize segments based on quantity
    prizeQuantities.forEach(({ prize, quantity }) => {
      for (let i = 0; i < quantity; i++) {
        allSegments.push({
          id: `${prize.id}-${i}`,
          name: prize.name.length > 10 ? prize.name.substring(0, 10) + '...' : prize.name,
          color: prize.color || DEFAULT_PRIZE_COLORS[colorIndex % DEFAULT_PRIZE_COLORS.length],
          textColor: prize.text_color || '#FFFFFF',
          type: 'prize',
          probability: prize.probability || 10,
        });
      }
      if (quantity > 0) colorIndex++;
    });

    // Add UNLUCKY segments based on quantity
    for (let i = 0; i < unluckyQuantity; i++) {
      allSegments.push({
        id: `unlucky-${i}`,
        name: 'UNLUCKY',
        color: unluckyColor,
        textColor: unluckyTextColor,
        type: 'unlucky',
        probability: 10,
      });
    }

    // Add RETRY segments based on quantity
    for (let i = 0; i < retryQuantity; i++) {
      allSegments.push({
        id: `retry-${i}`,
        name: 'RETRY',
        color: retryColor,
        textColor: retryTextColor,
        type: 'retry',
        probability: 10,
      });
    }

    // Distribute segments to avoid adjacency of same types
    return distributeSegments(allSegments);
  }, [prizeQuantities, unluckyQuantity, retryQuantity, unluckyColor, unluckyTextColor, retryColor, retryTextColor]);

  const totalSegments = segments.length;
  const segmentAngle = 360 / totalSegments;

  // Create segment path for the 3D wheel
  const createSegmentPath = (index: number, radius: number, innerRadius: number) => {
    const startAngle = (index * segmentAngle - 90) * Math.PI / 180;
    const endAngle = ((index + 1) * segmentAngle - 90) * Math.PI / 180;
    const cx = size / 2;
    const cy = size / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);

    return `M ${x4} ${y4} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  const getTextPosition = (index: number) => {
    const midAngle = ((index * segmentAngle) + (segmentAngle / 2) - 90) * Math.PI / 180;
    const radius = size * 0.32;
    const cx = size / 2;
    const cy = size / 2;
    return {
      x: cx + radius * Math.cos(midAngle),
      y: cy + radius * Math.sin(midAngle),
      rotation: index * segmentAngle + segmentAngle / 2
    };
  };

  // Decorative balls
  const decorativeBalls = [];
  const ballCount = Math.max(12, totalSegments);
  const cx = size / 2;
  const cy = size / 2;
  for (let i = 0; i < ballCount; i++) {
    const angle = (i * (360 / ballCount) - 90) * Math.PI / 180;
    decorativeBalls.push({
      x: cx + (size * 0.46) * Math.cos(angle),
      y: cy + (size * 0.46) * Math.sin(angle)
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

  const outerRadius = size * 0.445;
  const innerRadius = size * 0.15;
  const ballSize = size * 0.022;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Pointer at TOP pointing DOWN */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-30"
        style={{ top: '-8px' }}
      >
        <svg width="35" height="45" viewBox="0 0 70 90" style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.4))' }}>
          <defs>
            <linearGradient id="pointerGradientPreview" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A0F2A" />
              <stop offset="50%" stopColor="#8B2252" />
              <stop offset="100%" stopColor="#4A0F2A" />
            </linearGradient>
            <radialGradient id="pointerCenterGoldPreview" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#F5E6A3" />
              <stop offset="40%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8B6914" />
            </radialGradient>
          </defs>
          <path
            d="M35 90 C15 70, 5 50, 5 35 C5 15, 18 2, 35 2 C52 2, 65 15, 65 35 C65 50, 55 70, 35 90 Z"
            fill="url(#pointerGradientPreview)"
            stroke="#3A0820"
            strokeWidth="2"
          />
          <circle cx="35" cy="32" r="18" fill="url(#pointerCenterGoldPreview)" stroke="#8B6914" strokeWidth="1" />
          <circle cx="35" cy="32" r="12" fill="#D4AF37" />
          <circle cx="35" cy="32" r="6" fill="#8B6914" />
        </svg>
      </div>

      {/* Wheel SVG */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="goldRimOuterPreview" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="20%" stopColor="#F5E6A3" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#B8860B" />
            <stop offset="80%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>

          <linearGradient id="goldRimInnerPreview" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#F5E6A3" />
            <stop offset="75%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>

          <radialGradient id="centerHubGoldPreview" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F5E6A3" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#B8860B" />
            <stop offset="100%" stopColor="#8B6914" />
          </radialGradient>

          <linearGradient id="segmentShinePreview" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </linearGradient>

          <linearGradient id="blackSegmentShinePreview" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>
        </defs>

        {/* Outer gold ring */}
        <circle cx={cx} cy={cy} r={size * 0.495} fill="url(#goldRimOuterPreview)" />
        <circle cx={cx} cy={cy} r={size * 0.475} fill="url(#goldRimInnerPreview)" />
        <circle cx={cx} cy={cy} r={size * 0.455} fill="#1a1a1a" />

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
                strokeWidth="0.5"
              />
              <path
                d={createSegmentPath(index, outerRadius, innerRadius)}
                fill={isBlackSegment ? "url(#blackSegmentShinePreview)" : "url(#segmentShinePreview)"}
              />
              <text
                x={pos.x}
                y={pos.y}
                fill={segment.textColor}
                fontSize={segment.name.length > 8 ? size * 0.028 : segment.name.length > 6 ? size * 0.032 : size * 0.04}
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
            <ellipse cx={ball.x + 1} cy={ball.y + 2} rx={ballSize} ry={ballSize * 0.75} fill="rgba(0,0,0,0.25)" />
            <circle cx={ball.x} cy={ball.y} r={ballSize * 1.1} fill="#E0E0E0" />
            <circle cx={ball.x} cy={ball.y} r={ballSize} fill="#F8F8F8" />
            <circle cx={ball.x} cy={ball.y} r={ballSize * 0.7} fill="#FFFFFF" />
            <ellipse cx={ball.x - ballSize * 0.25} cy={ball.y - ballSize * 0.25} rx={ballSize * 0.35} ry={ballSize * 0.3} fill="rgba(255,255,255,1)" />
          </g>
        ))}

        {/* Center Hub with concentric rings */}
        <circle cx={cx} cy={cy} r={size * 0.145} fill="url(#goldRimOuterPreview)" />
        <circle cx={cx} cy={cy} r={size * 0.135} fill="url(#centerHubGoldPreview)" />

        {/* Concentric decorative rings */}
        <circle cx={cx} cy={cy} r={size * 0.12} fill="none" stroke="#8B6914" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={size * 0.105} fill="none" stroke="#B8860B" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={size * 0.09} fill="none" stroke="#8B6914" strokeWidth="0.75" />
        <circle cx={cx} cy={cy} r={size * 0.075} fill="none" stroke="#D4AF37" strokeWidth="0.75" />
        <circle cx={cx} cy={cy} r={size * 0.06} fill="none" stroke="#8B6914" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={size * 0.045} fill="none" stroke="#B8860B" strokeWidth="0.5" />

        {/* SPIN text in center */}
        <text
          x={cx}
          y={cy}
          fill="#4a2c00"
          fontSize={size * 0.05}
          fontWeight="bold"
          fontFamily="Arial Black, sans-serif"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}
        >
          SPIN
        </text>

        {/* Center highlight */}
        <ellipse cx={cx - size * 0.04} cy={cy - size * 0.04} rx={size * 0.04} ry={size * 0.03} fill="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  );
}
