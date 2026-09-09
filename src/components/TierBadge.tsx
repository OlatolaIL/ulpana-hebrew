'use client';

import React from 'react';
import { Crown, Sparkles, CheckCircle2 } from 'lucide-react';

export type TierType = 'pro-beta' | 'always-free' | 'pro';

interface TierBadgeProps {
  tier: TierType;
  size?: 'xs' | 'sm' | 'md';
  isUlpan?: boolean;
  className?: string;
  showIcon?: boolean;
  customLabel?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'sm',
  isUlpan = false,
  className = '',
  showIcon = true,
  customLabel,
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-0.5',
    sm: 'px-2 py-0.5 text-[10px] sm:text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }[size];

  if (tier === 'pro-beta') {
    return (
      <span
        className={`inline-flex items-center font-bold tracking-tight rounded-md select-none border bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400/40 dark:border-amber-500/40 shadow-2xs ${sizeClasses} ${className}`}
        title={
          isUlpan
            ? 'פָּתוּחַ בִּתְקוּפַת הַבֵּטָא • בְּגִרְסָה סוֹפִית יִהְיֶה בְּתָכְנִית PRO'
            : 'Открыто в рамках открытого бета-тестирования • В релизе станет частью PRO'
        }
      >
        {showIcon && <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />}
        <span>{customLabel || (isUlpan ? 'PRO בֵּטָא' : 'PRO БЕТА')}</span>
      </span>
    );
  }

  if (tier === 'always-free') {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-md select-none border bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50 ${sizeClasses} ${className}`}
        title={
          isUlpan
            ? 'גִּישָׁה בְּסִיסִית חִנָּמִית תָּמִיד'
            : 'Базовый доступ навсегда бесплатно'
        }
      >
        {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
        <span>{customLabel || (isUlpan ? 'חִנָּם' : 'Бесплатно')}</span>
      </span>
    );
  }

  // Standard PRO
  return (
    <span
      className={`inline-flex items-center font-bold rounded-md select-none bg-amber-500 text-white shadow-2xs ${sizeClasses} ${className}`}
      title={isUlpan ? 'מִנּוּי PRO' : 'Тариф PRO'}
    >
      {showIcon && <Crown className="w-3 h-3 shrink-0" />}
      <span>{customLabel || 'PRO'}</span>
    </span>
  );
};
