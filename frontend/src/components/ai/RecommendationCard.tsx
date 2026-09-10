import React from 'react';
import { Lightbulb, ExternalLink, Clock } from 'lucide-react';
import { AiRecommendation } from '../../types/ai';

interface RecommendationCardProps {
  recommendation: AiRecommendation;
  onViewDetails?: (rec: AiRecommendation) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onViewDetails,
}) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 hover:border-teal-500/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-teal-400 font-mono uppercase tracking-wider block">
                {recommendation.type.replace(/_/g, ' ')}
              </span>
              <h4 className="text-sm font-semibold text-gray-200">{recommendation.entity_name}</h4>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(recommendation.priority)}`}>
            {recommendation.priority} PRIORITY
          </span>
        </div>

        <p className="text-sm text-gray-200 font-medium leading-relaxed my-3 bg-[#0B0D14] p-3 rounded-lg border border-[#1E2330]">
          "{recommendation.recommendation}"
        </p>

        <div className="text-xs text-gray-400 leading-relaxed mb-3">
          <span className="text-gray-300 font-medium">Analytical Rationale: </span>
          {recommendation.reason}
        </div>

        {recommendation.supporting_metrics && Object.keys(recommendation.supporting_metrics).length > 0 && (
          <div className="flex flex-wrap gap-2 my-2 pt-2 border-t border-[#1E2330]/60">
            {Object.entries(recommendation.supporting_metrics).map(([k, v]) => (
              <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-[#171A23] border border-[#262B3B] text-gray-300 font-mono">
                {k}: <span className="text-teal-400 font-bold">{String(v)}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1E2330] flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="w-3 h-3" />
          <span>Decision-Support Advisory Only</span>
        </div>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(recommendation)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171A23] hover:bg-[#202533] text-gray-200 border border-[#262B3B] hover:border-teal-500/30 text-xs font-medium transition-colors"
          >
            <span>View Details</span>
            <ExternalLink className="w-3 h-3 text-teal-400" />
          </button>
        )}
      </div>
    </div>
  );
};
