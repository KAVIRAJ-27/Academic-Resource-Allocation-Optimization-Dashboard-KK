import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface ShortageRiskBadgeProps {
  riskLevel: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
}

export const ShortageRiskBadge: React.FC<ShortageRiskBadgeProps> = ({ riskLevel }) => {
  if (riskLevel === 'HIGH_RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#FBF0F0] text-[#B44747] border border-[#ECC0C0]">
        <AlertTriangle className="w-3.5 h-3.5" />
        High Deficit Risk
      </span>
    );
  }
  if (riskLevel === 'MEDIUM_RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#FAF7F0] text-[#A87928] border border-[#E8DEC8]">
        <AlertCircle className="w-3.5 h-3.5" />
        Moderate Risk
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#F0F5F2] text-[#3F7655] border border-[#B6D1C1]">
      <CheckCircle className="w-3.5 h-3.5" />
      Sufficient Capacity
    </span>
  );
};
