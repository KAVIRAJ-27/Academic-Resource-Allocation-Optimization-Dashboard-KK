import React from 'react';
import { PageContainer, PageHeader } from '../../components/layout';
import { Alert, Button, EmptyState } from '../../components/ui';
import {
  FacultyWorkloadSummaryCards,
  FacultyWorkloadChart,
  FacultyWorkloadBreakdownTable,
  FacultyWorkloadHistoryTable,
  FacultyWorkloadSkeleton,
} from '../../components/faculty/workload';
import { useFacultyWorkload } from '../../hooks/useFacultyWorkload';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';

export const FacultyWorkloadPage: React.FC = () => {
  const { data, loading, error, refetch } = useFacultyWorkload();

  if (loading && !data) {
    return (
      <PageContainer>
        <PageHeader
          title="Faculty Workload"
          description="Comprehensive overview of instructional hours, assigned subjects, and workload distribution"
        />
        <FacultyWorkloadSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Faculty Workload"
        description="Comprehensive overview of instructional hours, assigned subjects, and workload distribution"
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="border-slate-200 text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" title="Unable to load workload">
            {error}
          </Alert>
        )}

        {/* Empty State when no summary or data */}
        {!data && !error && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-card">
            <EmptyState
              icon={Clock}
              title="Workload information is not currently available."
              description="Your instructional workload records will appear once department allocations and course assignments are finalized."
            />
          </div>
        )}

        {/* Main Workload View */}
        {data && (
          <>
            {/* 1. Summary Cards */}
            <FacultyWorkloadSummaryCards summary={data.summary} />

            {/* 2. Visual Analytics Chart */}
            <FacultyWorkloadChart breakdown={data.breakdown} />

            {/* 3. Detailed Teaching Breakdown Table */}
            <FacultyWorkloadBreakdownTable breakdown={data.breakdown} />

            {/* 4. Historical Workloads Table */}
            <FacultyWorkloadHistoryTable history={data.history} />
          </>
        )}
      </div>
    </PageContainer>
  );
};
