import React from 'react';
import { PageContainer, PageHeader, ContentSection } from '../../components/layout';
import { Alert, Button } from '../../components/ui';
import {
  FacultyAcademicNavTabs,
  FacultyTodayClassesCard,
  FacultyTimetableFilters,
  FacultyTimetableScheduleView,
  FacultyAcademicSkeleton,
} from '../../components/faculty/academic';
import { useFacultyTimetable } from '../../hooks/useFacultyTimetable';
import { RefreshCw } from 'lucide-react';

export const FacultyTimetablePage: React.FC = () => {
  const {
    timetableData,
    todayClasses,
    loading,
    error,
    dayOfWeek,
    setDayOfWeek,
    todayOnly,
    setTodayOnly,
    resetFilters,
    refresh,
  } = useFacultyTimetable();

  if (loading && !timetableData) {
    return (
      <PageContainer>
        <FacultyAcademicSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Instruction Timetable"
        description="Weekly instructional schedule, period intervals, and laboratory/classroom allocations"
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="border-slate-200 text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Nav Tabs */}
      <FacultyAcademicNavTabs
        todayClassesCount={timetableData?.todayEntriesCount}
      />

      {error && (
        <Alert variant="error" title="Timetable Service Notice" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Today's Classes Section */}
      <FacultyTodayClassesCard
        todayEntries={todayClasses}
        todayDayOfWeek={timetableData?.todayDayOfWeek}
        todayDate={timetableData?.todayDate}
      />

      {/* Timetable Filters */}
      <FacultyTimetableFilters
        dayOfWeek={dayOfWeek}
        onDayChange={setDayOfWeek}
        todayOnly={todayOnly}
        onTodayOnlyToggle={() => setTodayOnly(!todayOnly)}
        todayDayOfWeek={timetableData?.todayDayOfWeek}
        onReset={resetFilters}
      />

      {/* Schedule View Grouped by Day */}
      <ContentSection
        title={todayOnly ? "Today's Schedule Matrix" : "Weekly Schedule Overview"}
        subtitle={
          todayOnly
            ? "Displaying instructional sessions active for the current day"
            : `Showing ${timetableData?.entries.length || 0} scheduled periods across active academic days`
        }
      >
        <FacultyTimetableScheduleView entries={timetableData?.entries || []} />
      </ContentSection>
    </PageContainer>
  );
};
