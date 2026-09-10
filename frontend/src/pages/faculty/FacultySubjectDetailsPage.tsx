import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, ContentSection } from '../../components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Alert,
  EmptyState,
} from '../../components/ui';
import { FacultyAcademicSkeleton } from '../../components/faculty/academic';
import { useFacultySubjectDetails } from '../../hooks/useFacultySubjectDetails';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  GraduationCap,
  Clock,
  Users,
  MapPin,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const FacultySubjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const subjectId = id ? parseInt(id, 10) : undefined;

  const { details, loading, error } = useFacultySubjectDetails(subjectId);

  if (loading) {
    return (
      <PageContainer>
        <FacultyAcademicSkeleton />
      </PageContainer>
    );
  }

  if (error || !details) {
    return (
      <PageContainer>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/faculty/subjects')}
          className="text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Assigned Subjects
        </Button>

        <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-8 shadow-card">
          <EmptyState
            icon={ShieldAlert}
            title="Subject details unavailable or unauthorized"
            description={
              error ||
              "This subject is either not assigned to your faculty profile or does not exist."
            }
            actionLabel="Return to My Subjects"
            onAction={() => navigate('/faculty/subjects')}
          />
        </div>
      </PageContainer>
    );
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
  };

  return (
    <PageContainer>
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/faculty/subjects')}
        className="text-gray-400 hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Assigned Subjects
      </Button>

      {/* Main Subject Header Card */}
      <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-6 mb-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="teal" size="sm">
                {details.subjectCode}
              </Badge>
              <Badge variant="neutral" size="sm">
                {details.subjectType}
              </Badge>
              <Badge variant={details.status === 'ACTIVE' ? 'teal' : 'neutral'} size="sm">
                {details.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {details.subjectName}
            </h1>
            <p className="text-xs text-gray-400">
              Department Curriculum Allocation • Read-only Faculty Perspective
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#171A23] border border-[#1E2330] rounded-lg p-3 text-center min-w-[90px]">
              <span className="text-xs text-gray-400 block">Credits</span>
              <span className="text-xl font-bold text-white">{details.credits}</span>
            </div>
            <div className="bg-[#171A23] border border-[#1E2330] rounded-lg p-3 text-center min-w-[90px]">
              <span className="text-xs text-gray-400 block">Total Workload</span>
              <span className="text-xl font-bold text-teal-400">
                {details.totalHoursPerWeek} <span className="text-xs font-normal">hrs</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <GraduationCap className="w-4 h-4 text-teal-400" />
            <span>Academic Program</span>
          </div>
          <div className="font-semibold text-white text-sm truncate">
            {details.programName || details.programCode || '—'}
          </div>
          <span className="text-[11px] text-gray-500">{details.degreeType || 'Degree Program'}</span>
        </div>

        <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Department</span>
          </div>
          <div className="font-semibold text-white text-sm truncate">
            {details.departmentName || '—'}
          </div>
          <span className="text-[11px] text-gray-500">{details.departmentCode || 'Academic Dept'}</span>
        </div>

        <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Semester Level</span>
          </div>
          <div className="font-semibold text-white text-sm">
            {details.semesterNumber ? `Semester ${details.semesterNumber}` : details.semesterName || '—'}
          </div>
          <span className="text-[11px] text-gray-500">{details.academicYearName || 'Current Term'}</span>
        </div>

        <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Assigned Sections</span>
          </div>
          <div className="font-semibold text-white text-sm">
            {details.assignedSections.length} {details.assignedSections.length === 1 ? 'Division' : 'Divisions'}
          </div>
          <span className="text-[11px] text-gray-500">Class Sections Active</span>
        </div>
      </div>

      {/* Assigned Sections */}
      <ContentSection
        title="Associated Class Sections"
        subtitle="Sections and divisions assigned to your instructional delivery"
        className="mb-8"
      >
        {details.assignedSections.length === 0 ? (
          <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-6 shadow-card">
            <EmptyState
              icon={Users}
              title="No sections are currently associated with your assignments."
              description="Specific section mappings will appear here once allocated."
              compact
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {details.assignedSections.map((sec) => (
              <div
                key={sec.assignmentId}
                className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 shadow-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300 text-xs">
                      {sec.sectionName}
                    </span>
                    <span className="font-bold text-white text-sm">Section {sec.sectionName}</span>
                  </div>
                  <Badge variant={sec.status === 'ACTIVE' ? 'teal' : 'neutral'} size="sm">
                    {sec.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 pt-2 border-t border-[#1E2330]">
                  <div>
                    <span className="text-gray-500 block">Student Capacity:</span>
                    <span className="text-gray-200 font-medium">{sec.capacity ?? 60} Students</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Weekly Hours:</span>
                    <span className="text-gray-200 font-medium">{sec.hoursPerWeek ?? 4} hrs/wk</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentSection>

      {/* Scheduled Timetable Slots */}
      <ContentSection
        title="Scheduled Timetable Slots"
        subtitle="Weekly periods, lecture halls, and laboratory rooms reserved for this subject"
      >
        {details.timetableSlots.length === 0 ? (
          <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-6 shadow-card">
            <EmptyState
              icon={Calendar}
              title="No timetable entries are currently available for this subject."
              description="Timetable entries will appear here once period schedules and room assignments are published."
              compact
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {details.timetableSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 shadow-card hover:border-teal-500/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 capitalize">
                    {slot.dayOfWeek.toLowerCase()}
                  </span>
                  <span className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-gray-400">
                    {slot.sectionName ? `Section ${slot.sectionName}` : 'All Sections'}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate pt-0.5">
                    {slot.subjectName}
                  </h4>
                </div>

                <div className="pt-2 border-t border-[#1E2330] flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span className="truncate text-gray-200 font-medium">
                      {slot.resourceName || slot.resourceCode || 'Classroom'}
                    </span>
                  </div>
                  {slot.resourceLocation && (
                    <span className="text-[11px] text-gray-500 truncate max-w-[120px]">
                      {slot.resourceLocation}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentSection>
    </PageContainer>
  );
};
