import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../ui';
import { StudentProfile } from '../../../types/student';
import { Shield, Key, Clock, CheckCircle, Lock } from 'lucide-react';

interface StudentAccountCardProps {
  profile: StudentProfile;
}

export const StudentAccountCard: React.FC<StudentAccountCardProps> = ({ profile }) => {
  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-100">
                Security & Account Credentials
              </CardTitle>
              <CardDescription className="text-xs text-gray-400">
                Authentication profile and role authorization status
              </CardDescription>
            </div>
          </div>
          <Badge variant={profile.userStatus === 'ACTIVE' ? 'success' : 'neutral'} dot size="sm">
            {profile.userStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Username */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              Username
            </div>
            <p className="text-xs font-mono font-semibold text-gray-100">
              {profile.username}
            </p>
          </div>

          {/* Assigned System Role */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              System Role
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {profile.roles && profile.roles.length > 0 ? (
                profile.roles.map((r, i) => (
                  <Badge key={i} variant="teal" size="sm">
                    {r.replace('ROLE_', '')}
                  </Badge>
                ))
              ) : (
                <Badge variant="teal" size="sm">
                  STUDENT
                </Badge>
              )}
            </div>
          </div>

          {/* Last Login */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 font-bold text-[10px] font-mono uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Last Session
            </div>
            <p className="text-xs font-mono text-gray-300">
              {profile.lastLoginAt
                ? new Date(profile.lastLoginAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Active session'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
