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
      <Card className="p-5 h-[240px] animate-pulse bg-white border-[#E8E0D0]">
        <div className="h-4 bg-[#F4F0E6] rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-[#FBF9F3] rounded-xl"></div>
      </Card>
    );
  }

  return (
    <Card className="p-5 flex flex-col justify-between h-full border-[#D8C9A8] bg-white shadow-none">
      <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#A87928]" />
            Unresolved Operational Issues
          </CardTitle>
          <CardDescription className="text-xs text-[#77736A] mt-0.5">
            Hostel student complaints & physical maintenance requests
          </CardDescription>
        </div>
        <Badge variant={totalIssues > 0 ? 'warning' : 'success'} dot>
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
            <div className="p-3.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-white text-[#A87928] border border-[#D8C9A8]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-[#202020]">Hostel Complaints</h5>
                  <p className="text-[11px] text-[#77736A]">Open student grievances</p>
                </div>
              </div>
              <span className="text-xl font-serif font-bold text-[#A87928]">
                {openComplaints}
              </span>
            </div>

            <div className="p-3.5 rounded bg-[#FBF9F3] border border-[#E8E0D0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-white text-[#B44747] border border-[#D8C9A8]">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-[#202020]">Maintenance Orders</h5>
                  <p className="text-[11px] text-[#77736A]">Plumbing, electrical & Wi-Fi</p>
                </div>
              </div>
              <span className="text-xl font-serif font-bold text-[#B44747]">
                {openMaintenance}
              </span>
            </div>
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#E8E0D0] text-[11px] text-[#77736A] font-mono">
        Complaints: OPEN, IN_PROGRESS · Maintenance: OPEN, ASSIGNED, IN_PROGRESS
      </div>
    </Card>
  );
};
