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
        return 'bg-[#FBF0F0] text-[#B44747] border-[#ECC0C0]';
      case 'MEDIUM':
        return 'bg-[#FAF7F0] text-[#A87928] border-[#E8DEC8]';
      default:
        return 'bg-[#F0F5F2] text-[#3F7655] border-[#B6D1C1]';
    }
  };

  return (
    <div className="bg-white border border-[#D8C9A8] rounded-xl p-5 hover:border-[#B8A16A] transition-all flex flex-col justify-between shadow-none">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FBF9F3] border border-[#E8E0D0] text-[#B8A16A]">
              <Lightbulb className="w-4 h-4 text-[#B8A16A]" />
            </div>
            <div>
              <span className="text-[10px] text-[#B8A16A] font-mono uppercase tracking-wider block font-semibold">
                {recommendation.type.replace(/_/g, ' ')}
              </span>
              <h4 className="text-sm font-serif font-bold text-[#202020]">{recommendation.entity_name}</h4>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(recommendation.priority)}`}>
            {recommendation.priority} PRIORITY
          </span>
        </div>

        <p className="text-sm text-[#202020] font-medium leading-relaxed my-3 bg-[#FBF9F3] p-3 rounded border border-[#E8E0D0]">
          "{recommendation.recommendation}"
        </p>

        <div className="text-xs text-[#555555] leading-relaxed mb-3">
          <span className="text-[#202020] font-semibold">Analytical Rationale: </span>
          {recommendation.reason}
        </div>

        {recommendation.supporting_metrics && Object.keys(recommendation.supporting_metrics).length > 0 && (
          <div className="flex flex-wrap gap-2 my-2 pt-2 border-t border-[#E8E0D0]">
            {Object.entries(recommendation.supporting_metrics).map(([k, v]) => (
              <span key={k} className="text-[11px] px-2 py-0.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] text-[#555555] font-mono">
                {k}: <span className="text-[#B8A16A] font-bold">{String(v)}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#E8E0D0] flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-[#77736A]">
          <Clock className="w-3 h-3 text-[#77736A]" />
          <span>Decision-Support Advisory Only</span>
        </div>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(recommendation)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8] text-xs font-semibold transition-colors"
          >
            <span>View Details</span>
            <ExternalLink className="w-3 h-3 text-[#B8A16A]" />
          </button>
        )}
      </div>
    </div>
  );
};
