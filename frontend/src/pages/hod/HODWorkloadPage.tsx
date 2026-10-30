import React from 'react';
import { PageContainer } from '../../components/layout';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { useHodWorkload } from '../../hooks/useHodWorkload';
import {
  HodWorkloadSummaryCards,
  HodWorkloadDistributionChart,
  HodWorkloadTable,
  HodFacultyWorkloadDetailModal,
  HodAssignmentsTable,
} from '../../components/hod/workload';
import { Clock, BookOpen, RefreshCw } from 'lucide-react';

export const HODWorkloadPage: React.FC = () => {
  const {
    overview,
    assignments,
    loading,
    error,
    activeTab,
    selectedFacultyWorkload,
    setActiveTab,
    refresh,
    viewFacultyWorkload,
    closeFacultyWorkload,
  } = useHodWorkload();

  const tabItems = [
    {
      id: 'workload',
      label: 'Faculty Workload',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'assignments',
      label: `Course Assignments (${assignments.length})`,
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Department Workload & Assignments
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Faculty teaching hours, workload equilibrium distribution, and course allocations
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            isLoading={loading}
            className="border-gray-800 text-gray-300 hover:text-white self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Workload Telemetry Error">
            <div className="space-y-3">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={refresh}>
                Retry Loading
              </Button>
            </div>
          </Alert>
        )}

        {/* Tab Navigation */}
        <Tabs
          tabs={tabItems}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as 'workload' | 'assignments')}
        />

        {/* Tab 1: Workload Overview & Distribution */}
        {activeTab === 'workload' && (
          <div className="space-y-6">
            {/* 4 Summary Cards */}
            <HodWorkloadSummaryCards
              totalFaculty={overview?.totalFaculty || 0}
              facultyWithWorkload={overview?.facultyWithWorkloadCount || 0}
              avgTeachingHours={overview?.averageWeeklyHours || 0}
              overloadCount={overview?.overloadCount || 0}
            />

            {/* Distribution Recharts Bar Chart */}
            <HodWorkloadDistributionChart
              balancedCount={overview?.balancedCount}
              overloadCount={overview?.overloadCount}
              underloadCount={overview?.underloadCount}
              pendingCalculationCount={overview?.pendingCalculationCount}
            />

            {/* Faculty Workload Table */}
            <HodWorkloadTable
              facultyWorkloads={overview?.facultyWorkloads || []}
              onViewBreakdown={viewFacultyWorkload}
            />
          </div>
        )}

        {/* Tab 2: Department Course Assignments */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <HodAssignmentsTable assignments={assignments} />
          </div>
        )}

        {/* Faculty Workload Breakdown Modal */}
        <HodFacultyWorkloadDetailModal
          workloadDetail={selectedFacultyWorkload}
          isOpen={selectedFacultyWorkload !== null}
          onClose={closeFacultyWorkload}
        />
      </div>
    </PageContainer>
  );
};
