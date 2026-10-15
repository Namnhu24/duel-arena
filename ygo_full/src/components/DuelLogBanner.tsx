/**
 * DuelLogBanner - High-Tech Master Duel Action Notification Banner
 */

import React from 'react';
import { Sparkles, Swords, Zap, ShieldAlert } from 'lucide-react';

interface DuelLogBannerProps {
  logs: string[];
}

export const DuelLogBanner: React.FC<DuelLogBannerProps> = ({ logs }) => {
  const latest = logs[logs.length - 1] || 'Võ đài sẵn sàng. Bắt đầu trận đấu!';

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-xl w-full px-4">
      <div className="bg-[#071322]/90 backdrop-blur-md border border-[#3b7294]/70 px-4 py-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex items-center justify-center gap-2.5 text-center text-xs text-sky-200">
        <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 animate-spin" />
        <p className="truncate font-medium">{latest}</p>
      </div>
    </div>
  );
};
