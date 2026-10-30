import React from 'react';
import { Card, Button } from '../../../ui';
import { AlertTriangle, Plus, RotateCcw } from 'lucide-react';

interface Props {
  isFiltered: boolean;
  onResetFilters?: () => void;
  onCreateNew?: () => void;
}

export const HostelComplaintEmptyState: React.FC<Props> = ({
  isFiltered,
  onResetFilters,
  onCreateNew,
}) => {
  return (
    <Card className="p-12 text-center bg-white border-slate-200 rounded-xl my-6">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1.5">
        {isFiltered ? 'No matching hostel complaints' : "You haven't submitted any complaints"}
      </h3>
      <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
        {isFiltered
          ? 'Try adjusting your search terms, status filters, or category selections.'
          : 'Report electrical, plumbing, furniture, internet, or cleanliness issues for prompt resolution.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {isFiltered && onResetFilters ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="border-slate-200 text-gray-300"
          >
            Clear Filters
          </Button>
        ) : onCreateNew ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNew}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-teal-600 hover:bg-teal-500 text-white"
          >
            Report an Issue / Complaint
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
