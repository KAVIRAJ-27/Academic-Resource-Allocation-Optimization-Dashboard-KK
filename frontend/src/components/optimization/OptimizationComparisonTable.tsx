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
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Top Allocation Candidates Comparison
        </h4>
        <span className="text-xs text-slate-400">
          Showing {recommendations.length} evaluated options
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4">Rank</th>
              {domain === 'ACADEMIC' ? (
                <>
                  <th className="py-2.5 px-4">Resource</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Capacity</th>
                </>
              ) : (
                <>
                  <th className="py-2.5 px-4">Hostel & Block</th>
                  <th className="py-2.5 px-4">Room & Floor</th>
                  <th className="py-2.5 px-4">Bed</th>
                </>
              )}
              <th className="py-2.5 px-4">Score</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {recommendations.map((rec) => {
              const isSelected = selectedCandidateId === rec.candidateId;
              const isTop = rec.rank === 1;

              return (
                <tr
                  key={rec.candidateId}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/15'
                      : isTop
                      ? 'bg-indigo-950/20 hover:bg-indigo-950/40'
                      : 'hover:bg-slate-800/40'
                  }`}
                  onClick={() => onSelect(rec)}
                >
                  <td className="py-3 px-4 font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs ${
                        isTop
                          ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      #{rec.rank}
                    </span>
                  </td>

                  {domain === 'ACADEMIC' ? (
                    <>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          <span>{rec.candidateName}</span>
                          {isTop && (
                            <Badge variant="warning" className="text-[9px] py-0">
                              Best Fit
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {rec.details?.building
                          ? `${rec.details.building} - ${rec.details.roomNumber || ''}`
                          : rec.details?.location || 'Campus'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-400">
                          {rec.details?.capacity || 'N/A'} Seats
                        </span>
                        {rec.details?.wastedCapacity !== undefined && (
                          <span className="text-[10px] text-slate-500 block">
                            +{rec.details.wastedCapacity} spare
                          </span>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="w-3.5 h-3.5 text-slate-500" />
                          <span>{rec.details?.hostelName || 'Hostel'}</span>
                          <span className="text-slate-400 text-[11px]">
                            ({rec.details?.blockName || 'Block'})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        Room {rec.details?.roomNumber || 'N/A'} (Floor {rec.details?.floorNumber || 1})
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="teal">Bed #{rec.details?.bedNumber || 'N/A'}</Badge>
                      </td>
                    </>
                  )}

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-white text-sm">{rec.score}</span>
                      <span className="text-[10px] text-slate-400">/ 100</span>
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
