import React from 'react';
import { AlertCircle, AlertTriangle, Info, Flame } from 'lucide-react';

const PRIORITY_CONFIG = {
  Low: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Info,
    pulse: false,
  },
  Medium: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: AlertCircle,
    pulse: false,
  },
  High: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertTriangle,
    pulse: false,
  },
  Critical: {
    bg: 'bg-red-50 text-red-700 border-red-300 font-bold',
    icon: Flame,
    pulse: true,
  },
};

export default function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.pulse ? 'animate-bounce text-red-600' : ''}`} />
      <span>{priority}</span>
    </span>
  );
}
