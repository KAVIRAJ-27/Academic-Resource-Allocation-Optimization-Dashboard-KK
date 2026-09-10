import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ModulePlaceholderCard } from '../../components/dashboard/ModulePlaceholderCard';
import { EmptyState, EmptyPreset } from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Sparkles, Layers, LucideIcon, ChevronRight } from 'lucide-react';

interface SubpagePlaceholderProps {
  title: string;
  subtitle: string;
  domain: 'Academic' | 'Hostel' | 'General';
  phase?: string;
  icon?: LucideIcon;
  emptyPreset?: EmptyPreset;
  modules?: {
    title: string;
    description: string;
    tags: string[];
    icon?: LucideIcon;
  }[];
}

export const SubpagePlaceholder: React.FC<SubpagePlaceholderProps> = ({
  title,
  subtitle,
  domain,
  phase = 'Phase 2',
  icon: PageIcon,
  emptyPreset,
  modules = [],
}) => {
  const navigate = useNavigate();

  const domainBadge = {
    Academic: 'teal',
    Hostel: 'orange',
    General: 'purple',
  }[domain] as 'teal' | 'orange' | 'purple';

  return (
    <div className="space-y-6">
      {/* Header Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2330]">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>AHRAO</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-teal-400 capitalize">{domain} Domain</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-300">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            {PageIcon && (
              <div className="p-2 rounded-xl bg-[#171A23] border border-[#1E2330] text-teal-400">
                <PageIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={domainBadge}>{domain} Domain</Badge>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-gray-400 bg-[#171A23] px-2.5 py-1 rounded-lg border border-white/5">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            {phase}
          </span>
        </div>
      </div>

      {/* Notice Card */}
      <Card className="p-5 border-teal-500/20 bg-gradient-to-r from-[#11141C] via-[#151924] to-[#11141C]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              Foundation Active — Detailed Business Logic Scheduled for {phase}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              The routing foundation, authorization boundary, and navigation hierarchy for this module are established. Database persistence models and CRUD controllers will connect in {phase}.
            </p>
          </div>
        </div>
      </Card>

      {/* Sub-modules list */}
      {modules.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Planned Module Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m, idx) => (
              <ModulePlaceholderCard
                key={idx}
                title={m.title}
                description={m.description}
                domain={domain === 'General' ? 'Core' : domain}
                phase={phase}
                icon={m.icon}
                tags={m.tags}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State Demonstration */}
      {emptyPreset && (
        <div className="pt-2">
          <EmptyState
            preset={emptyPreset}
            actionLabel="Return to Dashboard"
            onAction={() => navigate(-1)}
          />
        </div>
      )}

      {/* Back Button */}
      <div className="pt-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Return to Previous Portal
        </Button>
      </div>
    </div>
  );
};
