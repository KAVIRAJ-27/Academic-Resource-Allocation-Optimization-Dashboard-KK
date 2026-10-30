import React from 'react';
import { Card } from '../../ui';
import { Button } from '../../ui';
import { Hotel, RefreshCw, Info } from 'lucide-react';

interface Props {
  onRefresh?: () => void;
  loading?: boolean;
}

export const StudentHostelEmptyState: React.FC<Props> = ({ onRefresh, loading }) => {
  return (
    <Card className="p-10 text-center bg-white border-slate-200">
      <div className="flex flex-col items-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
          <Hotel className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-slate-900">
            No hostel allocation currently assigned
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Hostel allocation information will appear here once an allocation has been assigned by the residential administration.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-left text-xs text-gray-400 w-full">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px]">
            <span className="font-semibold text-gray-300">Day Scholar Status</span>
            <p>
              Students commuting from home or private accommodation do not receive campus bed allocations. Contact the residential warden office if residential accommodation is required.
            </p>
          </div>
        </div>

        {onRefresh && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              isLoading={loading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-slate-200 text-gray-300"
            >
              Check for Updates
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
