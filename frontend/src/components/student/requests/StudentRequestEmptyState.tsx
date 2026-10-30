import React from 'react';
import { Card } from '../../ui';
import { Button } from '../../ui';
import { FileQuestion, Plus, RefreshCw } from 'lucide-react';

interface Props {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
}

export const StudentRequestEmptyState: React.FC<Props> = ({
  isFiltered = false,
  onClearFilters,
  onCreateNew,
  onRefresh,
}) => {
  return (
    <Card className="p-12 text-center bg-white border-slate-200">
      <div className="flex flex-col items-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-inner">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-slate-900">
            {isFiltered ? 'No matching requests found' : 'No resource requests yet'}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {isFiltered
              ? 'Try adjusting or resetting your search keywords, status filter, or date range.'
              : 'You can request access to classrooms, computing laboratories, and academic equipment when needed for coursework or capstone demonstrations.'}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {isFiltered ? (
            <>
              {onClearFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="border-slate-200 text-gray-300"
                >
                  Clear Filters
                </Button>
              )}
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  className="text-gray-400"
                >
                  Refresh
                </Button>
              )}
            </>
          ) : (
            onCreateNew && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={onCreateNew}
                className="bg-teal-500 hover:bg-teal-400 text-black font-semibold"
              >
                Create Resource Request
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
};
