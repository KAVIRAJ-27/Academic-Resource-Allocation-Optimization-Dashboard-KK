import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Building,
  BedDouble,
  BarChart3,
  Sliders,
  Check,
} from 'lucide-react';
import { OptimizationRecommendation } from '../../types/optimization';
import { Badge, Button } from '../ui';

interface OptimizationRecommendationCardProps {
  recommendation: OptimizationRecommendation;
  isSelected?: boolean;
  onSelect: (rec: OptimizationRecommendation) => void;
  domain?: 'ACADEMIC' | 'HOSTEL';
}

export const OptimizationRecommendationCard: React.FC<OptimizationRecommendationCardProps> = ({
  recommendation,
  isSelected = false,
  onSelect,
  domain = 'ACADEMIC',
}) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);
  const isTopMatch = recommendation.rank === 1;

  // Format factor labels nicely
  const formatFactorLabel = (factor: string) => {
    return factor
      .toLowerCase()
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? 'bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/40 shadow-lg'
          : isTopMatch
          ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900/80 to-slate-900/60 border-indigo-500/40 hover:border-indigo-400'
          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
      }`}
    >
      {/* Header bar */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Rank Badge */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-md ${
              isTopMatch
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 ring-2 ring-amber-400/40'
                : recommendation.rank === 2
                ? 'bg-slate-700 text-slate-200 border border-slate-600'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            #{recommendation.rank}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-white tracking-tight">
                {recommendation.candidateName}
              </h4>
              {isTopMatch && (
                <Badge variant="warning" className="flex items-center gap-1 text-[11px] py-0.5">
                  <Award className="w-3 h-3" /> Top Recommendation
                </Badge>
              )}
              {recommendation.candidateCode && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                  {recommendation.candidateCode}
                </span>
              )}
            </div>

            {/* Subtitle details */}
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              {domain === 'ACADEMIC' ? (
                <>
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    {recommendation.details?.building
                      ? `${recommendation.details.building} - ${recommendation.details.roomNumber || ''}`
                      : recommendation.details?.location || 'Campus'}
                  </span>
                  <span>•</span>
                  <span>Capacity: <strong className="text-slate-200">{recommendation.details?.capacity || 'N/A'}</strong> seats</span>
                  {recommendation.details?.wastedCapacity !== undefined && (
                    <span className="text-emerald-400">
                      (+{recommendation.details.wastedCapacity} spare)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                    {recommendation.details?.hostelName || 'Hostel'}
                  </span>
                  <span>•</span>
                  <span>
                    {recommendation.details?.blockName || 'Block'} (Floor {recommendation.details?.floorNumber || 1})
                  </span>
                  <span>•</span>
                  <span>
                    Room {recommendation.details?.roomNumber || ''} • Bed #{recommendation.details?.bedNumber || ''}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Score & Select Button */}
        <div className="text-right flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-lg font-extrabold text-white tracking-tight">
              {recommendation.score}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
          </div>

          <Button
            size="sm"
            variant={isSelected ? 'primary' : isTopMatch ? 'primary' : 'outline'}
            onClick={() => onSelect(recommendation)}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" /> Selected
              </>
            ) : (
              'Use Recommendation'
            )}
          </Button>
        </div>
      </div>

      {/* Rationale Bullet Points */}
      {recommendation.reasons && recommendation.reasons.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-900/50 border-t border-slate-800/80">
          <div className="space-y-1">
            {recommendation.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Factor Breakdown Toggle */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>{showBreakdown ? 'Hide Scoring Breakdown' : 'View Explainable Scoring Breakdown'}</span>
          {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <span className="text-[10px] text-slate-500">
          Deterministic 5-Factor Score
        </span>
      </div>

      {/* Factor Breakdown Panel */}
      {showBreakdown && recommendation.factors && (
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendation.factors.map((factor, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    {formatFactorLabel(factor.factor)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">
                      Raw: {Math.round(factor.rawScore)}%
                    </span>
                    <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      +{factor.weightedScore} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, factor.rawScore)}%` }}
                  />
                </div>

                {factor.description && (
                  <p className="text-[10px] text-slate-400 leading-snug">
                    {factor.description} (Weight: {factor.weight}%)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
