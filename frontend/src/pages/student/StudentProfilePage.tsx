import React from 'react';
import {
  PageContainer,
  PageHeader,
} from '../../components/layout';
import { Button, Badge, Card, EmptyState } from '../../components/ui';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { StudentProfileForm } from '../../components/student/profile/StudentProfileForm';
import { StudentAcademicInfoCard } from '../../components/student/profile/StudentAcademicInfoCard';
import { StudentAccountCard } from '../../components/student/profile/StudentAccountCard';
import { StudentHostelInfoCard } from '../../components/student/profile/StudentHostelInfoCard';
import { StudentProfileSkeleton } from '../../components/student/profile/StudentProfileSkeleton';
import { User, RefreshCw, Hash, Calendar, GraduationCap, AlertCircle } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const {
    profile,
    loading,
    error,
    updating,
    updateError,
    fetchProfile,
    updateProfile,
  } = useStudentProfile();

  if (loading && !profile) {
    return (
      <PageContainer>
        <PageHeader
          title="Student Profile & Institutional Identification"
          description="Confidential enrollment credentials, contact records, academic curriculum, and residential allocation."
          badge={<Badge variant="teal" dot>STUDENT PROFILE</Badge>}
        />
        <StudentProfileSkeleton />
      </PageContainer>
    );
  }

  if (error && !profile) {
    return (
      <PageContainer>
        <PageHeader
          title="Student Profile & Institutional Identification"
          description="Confidential enrollment credentials, contact records, academic curriculum, and residential allocation."
          badge={<Badge variant="teal" dot>STUDENT PROFILE</Badge>}
        />
        <div className="py-12">
          <EmptyState
            title="Unable to load profile data"
            description={error}
            icon={AlertCircle}
            actionLabel="Retry Connection"
            onAction={fetchProfile}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Student Profile & Institutional Identification"
        description="Confidential enrollment credentials, contact records, academic curriculum, and residential allocation."
        badge={<Badge variant="teal" dot>STUDENT ID</Badge>}
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchProfile}
            isLoading={loading}
          >
            Refresh Records
          </Button>
        }
      />

      {profile && (
        <div className="space-y-6">
          {/* 1. Student Identity Header Banner */}
          <Card className="p-5 bg-gradient-to-r from-[#11141C] via-[#141824] to-[#11141C] border-[#1E2330]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 shadow-card">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {profile.fullName || `${profile.firstName} ${profile.lastName}`}
                    </h2>
                    <Badge variant={profile.status === 'ACTIVE' ? 'teal' : 'neutral'} dot size="sm">
                      {profile.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap font-mono">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-gray-400" />
                      {profile.registerNumber}
                    </span>
                    {profile.rollNumber && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>Roll: {profile.rollNumber}</span>
                      </>
                    )}
                    <span className="text-gray-400">•</span>
                    <span>Sem {profile.currentSemester}</span>
                    {profile.sectionName && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>Sec {profile.sectionName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#171A23] border border-[#222838] text-right">
                  <div className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">
                    Degree Level
                  </div>
                  <div className="text-xs font-bold text-teal-300 font-mono mt-0.5">
                    {profile.degreeLevel ? profile.degreeLevel.replace('_', ' ') : 'Undergraduate'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Personal & Contact Form (Editable) */}
          <StudentProfileForm
            profile={profile}
            onUpdate={updateProfile}
            updating={updating}
            error={updateError}
          />

          {/* 3. Academic Curriculum (Read-only) */}
          <StudentAcademicInfoCard profile={profile} />

          {/* 4. Residential Hostel Allocation (Read-only) */}
          <StudentHostelInfoCard profile={profile} />

          {/* 5. Account & Security Credentials (Read-only) */}
          <StudentAccountCard profile={profile} />
        </div>
      )}
    </PageContainer>
  );
};
