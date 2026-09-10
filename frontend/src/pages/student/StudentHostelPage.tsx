import React from 'react';
import {
  PageContainer,
  PageHeader,
} from '../../components/layout';
import {
  Button,
  Badge,
} from '../../components/ui';
import {
  RefreshCw,
  Hotel,
  AlertCircle,
} from 'lucide-react';
import { useStudentHostel } from '../../hooks/useStudentHostel';
import { StudentHostelStatusCard } from '../../components/student/hostel/StudentHostelStatusCard';
import { StudentHostelHierarchyCard } from '../../components/student/hostel/StudentHostelHierarchyCard';
import { StudentHostelRoomCard } from '../../components/student/hostel/StudentHostelRoomCard';
import { StudentHostelFacilitiesCard } from '../../components/student/hostel/StudentHostelFacilitiesCard';
import { StudentHostelWardenCard } from '../../components/student/hostel/StudentHostelWardenCard';
import { StudentHostelHistoryCard } from '../../components/student/hostel/StudentHostelHistoryCard';
import { StudentHostelSkeleton } from '../../components/student/hostel/StudentHostelSkeleton';
import { StudentHostelEmptyState } from '../../components/student/hostel/StudentHostelEmptyState';
import { HostelNavTabs } from '../../components/student/hostel/HostelNavTabs';

export const StudentHostelPage: React.FC = () => {
  const { data, loading, error, refresh } = useStudentHostel();

  if (loading && !data) {
    return (
      <PageContainer>
        <PageHeader
          title="Student Hostel & Residential Accommodation"
          description="Verified residential quarters, allocated room/bedspace, block facilities, and designated warden information."
          badge={<Badge variant="teal" dot>HOSTEL DESK</Badge>}
        />
        <StudentHostelSkeleton />
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer>
        <PageHeader
          title="Student Hostel & Residential Accommodation"
          description="Verified residential quarters, allocated room/bedspace, block facilities, and designated warden information."
          badge={<Badge variant="teal" dot>HOSTEL DESK</Badge>}
        />
        <div className="p-8 text-center bg-[#11141C] border border-[#1E2330] rounded-xl max-w-md mx-auto my-12 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">Unable to load hostel details</h3>
            <p className="text-xs text-gray-400">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="border-[#222838] text-gray-300"
          >
            Retry Connection
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!data) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Student Hostel & Residential Accommodation"
        description="Verified residential quarters, allocated room/bedspace, block facilities, and designated warden information."
        badge={<Badge variant="teal" dot>HOSTEL DESK</Badge>}
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={refresh}
            isLoading={loading}
            className="border-[#222838] text-gray-300"
          >
            Refresh Details
          </Button>
        }
      />

      {/* Sub-navigation tabs */}
      <HostelNavTabs />

      <div className="space-y-4 pt-2">
        {/* 1. Primary Allocation Status Banner */}
        <StudentHostelStatusCard data={data} />

        {data.allocated ? (
          <>
            {/* 2. 5-Tier Structural Lineage */}
            <StudentHostelHierarchyCard data={data} />

            {/* 3. Room & Bed Details with Capacity/Occupancy */}
            <StudentHostelRoomCard
              room={data.room}
              bed={data.bed}
              floor={data.floor}
              block={data.block}
            />

            {/* 4. Hostel Facilities */}
            <StudentHostelFacilitiesCard facilities={data.facilities} />

            {/* 5. Designated Wardens */}
            <StudentHostelWardenCard wardens={data.wardens} />

            {/* 6. Historical Allocation Records */}
            <StudentHostelHistoryCard history={data.history} />
          </>
        ) : (
          <>
            {/* Empty State for Day Scholars / Unallocated students */}
            <StudentHostelEmptyState onRefresh={refresh} loading={loading} />

            {/* Previous history if any */}
            {data.history && data.history.length > 0 && (
              <StudentHostelHistoryCard history={data.history} />
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};
