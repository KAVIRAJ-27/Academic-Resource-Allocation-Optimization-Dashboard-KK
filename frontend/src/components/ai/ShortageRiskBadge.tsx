import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface ShortageRiskBadgeProps {
  riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
}

export const ShortageRiskBadge: React.FC<ShortageRiskBadgeProps> = ({ riskLevel }) => {
  if (riskLevel === 'HIGH_RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        High Deficit Risk
      </span>
    );
  }
  if (riskLevel === 'MEDIUM_RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <AlertCircle className="w-3.5 h-3.5" />
        Moderate Risk
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
      <CheckCircle className="w-3.5 h-3.5" />
      Sufficient Capacity
    </span>
  );
};
