import React from 'react';
import { Sparkles, Check, Building, BedDouble } from 'lucide-react';
import { OptimizationRecommendation } from '../../types/optimization';
import { Badge, Button } from '../ui';

interface OptimizationComparisonTableProps {
  recommendations: OptimizationRecommendation[];
  selectedCandidateId: number | null;
  onSelect: (rec: OptimizationRecommendation) => void;
  domain?: 'ACADEMIC' | 'HOSTEL';
}

export const OptimizationComparisonTable: React.FC<OptimizationComparisonTableProps> = ({
  recommendations,
  selectedCandidateId,
  onSelect,
  domain = 'ACADEMIC',
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#D8C9A8] bg-white shadow-none overflow-hidden">
      <div className="px-4 py-3 border-b border-[#E8E0D0] bg-[#F8F6F0] flex items-center justify-between">
        <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-[#202020] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#B8A16A]" />
          Top Allocation Candidates Comparison
        </h4>
        <span className="text-xs text-[#77736A]">
          Showing {recommendations.length} evaluated options
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#555555]">
          <thead className="bg-[#F8F6F0] text-[#555555] font-semibold uppercase tracking-wider text-[10px] border-b border-[#D8C9A8]">
            <tr>
              <th className="py-2.5 px-4 font-semibold">Rank</th>
              {domain === 'ACADEMIC' ? (
                <>
                  <th className="py-2.5 px-4 font-semibold">Resource</th>
                  <th className="py-2.5 px-4 font-semibold">Location</th>
                  <th className="py-2.5 px-4 font-semibold">Capacity</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-4 font-semibold">Hostel & Block</th>
                  <th className="py-2.5 px-4 font-semibold">Room & Floor</th>
                  <th className="py-2.5 px-4 font-semibold">Bed</th>
                </>
              )}
              <th className="py-2.5 px-4 font-semibold">Score</th>
              <th className="py-2.5 px-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D0]">
            {recommendations.map((rec) => {
              const isSelected = selectedCandidateId === rec.candidateId;
              const isTop = rec.rank === 1;

              return (
                <tr
                  key={rec.candidateId}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F4F0E6]'
                      : isTop
                      ? 'bg-[#FAF7F0] hover:bg-[#F4F0E6]'
                      : 'hover:bg-[#F4F0E6]'
                  }`}
                  onClick={() => onSelect(rec)}
                >
                  <td className="py-3 px-4 font-semibold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                        isTop
                          ? 'bg-[#FAF7F0] text-[#A87928] font-bold border border-[#E8D8BA]'
                          : 'bg-[#F8F6F0] text-[#555555] border border-[#E8E0D0]'
                      }`}
                    >
                      #{rec.rank}
                    </span>
                  </td>

                  {domain === 'ACADEMIC' ? (
                    <>
                      <td className="py-3 px-4 font-semibold text-[#202020]">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#B8A16A]" />
                          <span>{rec.candidateName}</span>
                          {isTop && (
                            <Badge variant="warning" className="text-[9px] py-0">
                              Best Fit
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#555555]">
                        {rec.details?.building
                          ? `${rec.details.building} - ${rec.details.roomNumber || ''}`
                          : rec.details?.location || 'Campus'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#3F7655]">
                          {rec.details?.capacity || 'N/A'} Seats
                        </span>
                        {rec.details?.wastedCapacity !== undefined && (
                          <span className="text-[10px] text-[#77736A] block font-normal">
                            +{rec.details.wastedCapacity} spare
                          </span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-semibold text-[#202020]">
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="w-3.5 h-3.5 text-[#A87928]" />
                          <span>{rec.details?.hostelName || 'Hostel'}</span>
                          <span className="text-[#77736A] text-[11px]">
                            ({rec.details?.blockName || 'Block'})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#555555]">
                        Room {rec.details?.roomNumber || 'N/A'} (Floor {rec.details?.floorNumber || 1})
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral">Bed #{rec.details?.bedNumber || 'N/A'}</Badge>
                      </td>
                    </>
                  )}

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="font-serif font-bold text-[#202020] text-sm">{rec.score}</span>
                      <span className="text-[10px] text-[#77736A]">/ 100</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant={isSelected ? 'primary' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(rec);
                      }}
                      className="text-xs py-1 px-2.5 h-7"
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 mr-1" /> Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
