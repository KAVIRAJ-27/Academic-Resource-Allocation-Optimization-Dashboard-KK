import React from 'react';
import { AlertTriangle, Wrench, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, EmptyState } from '../../ui';

interface OpenIssuesSummaryProps {
  openComplaints: number;
  openMaintenance: number;
  loading: boolean;
}

export const OpenIssuesSummary: React.FC<OpenIssuesSummaryProps> = ({
  openComplaints,
  openMaintenance,
  loading,
}) => {
  const totalIssues = openComplaints + openMaintenance;

  if (loading) {
    return (
      <Card className="p-5 h-[240px] animate-pulse bg-[#11141C] border-[#1E2330]">
        <div className="h-4 bg-[#1E2330] rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-[#1E2330]/40 rounded-xl"></div>
      </Card>
    );
  }

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Unresolved Operational Issues
          </CardTitle>
          <CardDescription className="text-xs text-gray-400 mt-0.5">
            Hostel student complaints & physical maintenance requests
          </CardDescription>
        </div>
        <Badge variant={totalIssues > 0 ? 'danger' : 'success'} dot>
          {totalIssues > 0 ? `${totalIssues} Unresolved` : 'Nominal'}
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col justify-center my-2">
        {totalIssues === 0 ? (
          <EmptyState
            title="No unresolved issues"
            description="All student complaints and facility repair work orders are resolved."
            icon={CheckCircle2}
            compact
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#171A23] border border-[#1E2330] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-200">Hostel Complaints</h5>
                  <p className="text-[11px] text-gray-400">Open student grievances</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-amber-400">
                {openComplaints}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#171A23] border border-[#1E2330] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-200">Maintenance Orders</h5>
                  <p className="text-[11px] text-gray-400">Plumbing, electrical & Wi-Fi</p>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-rose-400">
                {openMaintenance}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#1E2330] text-[10px] text-gray-500 font-mono">
        Complaints: OPEN, IN_PROGRESS · Maintenance: OPEN, ASSIGNED, IN_PROGRESS
      </div>
    </Card>
  );
};
