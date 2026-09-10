import React from 'react';
import { Clock, CheckSquare, ShieldCheck, AlertTriangle } from 'lucide-react';
import { StatCard, Badge } from '../../ui';
import { DashboardGrid } from '../../layout';
import { AdminDashboardOverview } from '../../../types/dashboard';
import { SkeletonCard } from '../../common/SkeletonCard';

interface AdminOperationalStatsProps {
  data: AdminDashboardOverview | null;
  loading: boolean;
}

export const AdminOperationalStats: React.FC<AdminOperationalStatsProps> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <DashboardGrid variant="stats">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </DashboardGrid>
    );
  }

  const issueSubtext = `${data.openComplaints} Complaints · ${data.openMaintenanceRequests} Repairs`;
  const requestSubtext = `${data.requestSummary.approved} Approved · ${data.requestSummary.rejected} Rejected`;
  const allocSubtext = `${data.allocationSummary.pending} Pending · ${data.allocationSummary.completed} Completed`;

  return (
    <DashboardGrid variant="stats">
      <StatCard
        title="Pending Requests"
        value={data.pendingRequests}
        description={requestSubtext}
        icon={Clock}
        iconColor="teal"
        badge={
          <Badge variant={data.pendingRequests > 0 ? 'warning' : 'success'}>
            {data.pendingRequests > 0 ? 'Action Needed' : 'Queue Clear'}
          </Badge>
        }
        footerText={`Total requests submitted: ${data.requestSummary.totalRequests}`}
      />
      <StatCard
        title="Active Allocations"
        value={data.activeAllocations}
        description={allocSubtext}
        icon={CheckSquare}
        iconColor="blue"
        badge={<Badge variant="blue">Operational</Badge>}
        footerText={`Total allocation records: ${data.allocationSummary.totalAllocations}`}
      />
      <StatCard
        title="Pending Approvals"
        value={data.pendingApprovals}
        description="Awaiting institutional review"
        icon={ShieldCheck}
        iconColor="purple"
        badge={
          <Badge variant={data.pendingApprovals > 0 ? 'warning' : 'success'}>
            {data.pendingApprovals > 0 ? 'Pending Sign-Off' : 'All Signed'}
          </Badge>
        }
        footerText={`Approved: ${data.approvalSummary.approved} · Rejected: ${data.approvalSummary.rejected}`}
      />
      <StatCard
        title="Open Issues"
        value={data.openIssues}
        description={issueSubtext}
        icon={AlertTriangle}
        iconColor="rose"
        badge={
          <Badge variant={data.openIssues > 0 ? 'danger' : 'success'}>
            {data.openIssues > 0 ? 'Attention Required' : 'Zero Issues'}
          </Badge>
        }
        footerText="Hostel complaints & maintenance"
      />
    </DashboardGrid>
  );
};
