'use client';

import React, { useState } from 'react';
import { stripNikkud } from '@/lib/transcription';
import { getWordVisualConfig, VerbAnimType } from '@/lib/wordVisuals';
import { getHebrewPictogram } from '@/lib/pictograms';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WordVisualProps {
  /** Hebrew word with nikud */
  hebrew: string;
  /** Hebrew word without nikud (optional — derived automatically if omitted) */
  hebrewPlain?: string;
  /** Controls visual size */
  size?: 'sm' | 'md' | 'lg';
  /** Only renders enhanced visual in ulpan mode */
  ulpanMode?: boolean;
  /** Extra className on the wrapper */
  className?: string;
}

// ─── Size tables ──────────────────────────────────────────────────────────────

const IMAGE_SIZE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 40,
  md: 64,
  lg: 96,
};

const EMOJI_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-7xl',
};

const ARROW_SIZE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 40,
  md: 56,
  lg: 88,
};

// ─── Animation class map ──────────────────────────────────────────────────────

const VERB_ANIM_CLASS: Record<VerbAnimType, string> = {
  bounce:    'animate-bounce',
  pulse:     'animate-pulse',
  heartbeat: 'animate-ulpan-heartbeat',
  tilt:      'animate-ulpan-tilt',
  speak:     'animate-ulpan-speak',
  spin:      'animate-ulpan-spin',
};

// ─── Directional Arrow (pure SVG + CSS animation) ────────────────────────────

function DirectionArrow({
  direction,
  size,
}: {
  direction: 'left' | 'right' | 'up' | 'down';
  size: 'sm' | 'md' | 'lg';
}) {
  const px = ARROW_SIZE[size];

  const animClass =
    direction === 'left'  ? 'animate-ulpan-arrow-left'  :
    direction === 'right' ? 'animate-ulpan-arrow-right' :
    direction === 'up'    ? 'animate-ulpan-arrow-up'    :
                            'animate-ulpan-arrow-down';

  // Rotation so the same path always points right; then we rotate the SVG
  const rotate =
    direction === 'left'  ? 180 :
    direction === 'right' ? 0   :
    direction === 'up'    ? -90 :
                            90;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      className={`${animClass} select-none`}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      {/* Background circle */}
      <circle cx="24" cy="24" r="22" fill="#3B82F6" fillOpacity="0.12" />
      {/* Arrow shaft */}
      <line x1="10" y1="24" x2="36" y2="24" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
      {/* Arrowhead */}
      <polyline
        points="26,14 38,24 26,34"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * WordVisual — Ulpan-mode card visual
 *
 * In Ulpan mode shows:
 *  • Animated emoji for verbs  (CSS keyframes)
 *  • OpenMoji SVG for nouns/objects (CDN, with emoji fallback)
 *  • Animated SVG arrow for directional words
 *  • Fallback to large emoji (from pictogram map)
 *
 * In normal mode returns null — the caller keeps its own small emoji badge.
 */
export function WordVisual({
  hebrew,
  hebrewPlain,
  size = 'md',
  ulpanMode = true,
  className = '',
}: WordVisualProps) {
  const [imgFailed, setImgFailed] = useState(false);

  // Only enhanced in ulpan mode
  if (!ulpanMode) return null;

  const plain = hebrewPlain || stripNikkud(hebrew);
  const config = getWordVisualConfig(plain);

  // ── 1. Direction arrow ─────────────────────────────────────────────────────
  if (config?.dirArrow) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <DirectionArrow direction={config.dirArrow} size={size} />
      </div>
    );
  }

  // ── 2. Animated verb emoji ─────────────────────────────────────────────────
  if (config?.verbAnim && config.emoji) {
    const animClass = VERB_ANIM_CLASS[config.verbAnim];
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span
          className={`${EMOJI_SIZE[size]} select-none leading-none ${animClass}`}
          aria-hidden
        >
          {config.emoji}
        </span>
      </div>
    );
  }

  // ── 3. OpenMoji SVG image ──────────────────────────────────────────────────
  if (config?.openmojiHex && !imgFailed) {
    const px = IMAGE_SIZE[size];
    // Flag emojis have composite hex (e.g. "1F1EE-1F1F1") — skip image, use emoji text
    if (!config.openmojiHex.includes('-')) {
      return (
        <div className={`flex items-center justify-center ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://openmoji.org/data/color/svg/${config.openmojiHex}.svg`}
            alt=""
            width={px}
            height={px}
            loading="lazy"
            draggable={false}
            onError={() => setImgFailed(true)}
            style={{ imageRendering: 'auto' }}
          />
        </div>
      );
    }
    // Flag or composite → fall through to emoji text
  }

  // ── 4. Fallback emoji (from config or pictogram map) ──────────────────────
  const fallbackEmoji =
    config?.emoji ||
    (getHebrewPictogram(hebrew) ?? '').replace(/[♂♀⚥①]/g, '').trim();

  if (fallbackEmoji) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <span
          className={`${EMOJI_SIZE[size]} select-none leading-none`}
          aria-hidden
        >
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  return null;
}
