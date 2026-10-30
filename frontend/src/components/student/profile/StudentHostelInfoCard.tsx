import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState } from '../../ui';
import { StudentProfile } from '../../../types/student';
import { Hotel, BedDouble, MapPin, Calendar } from 'lucide-react';

interface StudentHostelInfoCardProps {
  profile: StudentProfile;
}

export const StudentHostelInfoCard: React.FC<StudentHostelInfoCardProps> = ({ profile }) => {
  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100">
                Residential Accommodation
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Hostel residence, block, room, and bed space designation
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={profile.hostelAllocated ? 'orange' : 'neutral'}
            dot={profile.hostelAllocated}
            size="sm"
          >
            {profile.hostelAllocated ? 'Resident Scholar' : 'Day Scholar / Pending'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {profile.hostelAllocated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Hostel & Block */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
                <Hotel className="w-3.5 h-3.5 text-orange-400" />
                Hostel & Block
              </div>
              <p className="text-xs font-bold text-gray-100 truncate" title={profile.hostelName}>
                {profile.hostelName || 'Hostel Campus'}
              </p>
              <span className="text-[10px] font-mono text-orange-400 block mt-0.5">
                {profile.blockName || 'Main Block'}
              </span>
            </div>

            {/* Room & Floor */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                Room & Level
              </div>
              <p className="text-xs font-bold text-gray-100">
                Room {profile.roomNumber || '--'}
              </p>
              <span className="text-[10px] font-mono text-teal-400 block mt-0.5">
                Floor {profile.floorNumber ?? '--'}
              </span>
            </div>

            {/* Bed Space */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
                <BedDouble className="w-3.5 h-3.5 text-blue-400" />
                Bed Allocation
              </div>
              <p className="text-xs font-bold text-gray-100 font-mono">
                Bed {profile.bedNumber || 'Assigned'}
              </p>
              <span className="text-[10px] font-mono text-blue-400 block mt-0.5">
                Status: {profile.allocationStatus || 'ACTIVE'}
              </span>
            </div>

            {/* Allocation Date */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Term Start
              </div>
              <p className="text-xs font-bold text-gray-100 font-mono">
                {profile.allocationStartDate || 'Current Academic Year'}
              </p>
              <span className="text-[10px] font-mono text-purple-400 block mt-0.5">
                Verified Resident
              </span>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No hostel allocation currently assigned"
            description="You are currently registered as a Day Scholar or your residential room request is pending Warden allocation."
            icon={Hotel}
            compact
          />
        )}
      </CardContent>
    </Card>
  );
};
