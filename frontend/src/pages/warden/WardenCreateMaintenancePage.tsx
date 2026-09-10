import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
  GridCol,
} from '../../components/layout';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui';
import {
  ArrowLeft,
  Wrench,
  Building,
  AlertTriangle,
  Send,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { wardenApi } from '../../services/api/wardenApi';
import { PriorityLevel } from '../../types/wardenOperations';

export const WardenCreateMaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const { hostels, selectedHostelId, loading: hostelsLoading } = useWardenHostels();

  const [hostelId, setHostelId] = useState<number | ''>(selectedHostelId || '');
  const [roomNumber, setRoomNumber] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize initial hostel selection if available
  React.useEffect(() => {
    if (!hostelId && selectedHostelId) {
      setHostelId(selectedHostelId);
    }
  }, [selectedHostelId, hostelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelId) {
      setError('Please select an authorized hostel block.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a work order title.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a detailed description of the maintenance issue.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const parsedResourceId = resourceId.trim() ? parseInt(resourceId.trim(), 10) : undefined;

      const res = await wardenApi.createMaintenance({
        hostelId: Number(hostelId),
        resourceId: parsedResourceId && !isNaN(parsedResourceId) ? parsedResourceId : undefined,
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      if (res.success && res.data) {
        navigate(`/warden/maintenance/${res.data.id}`);
      } else {
        navigate('/warden/maintenance');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Failed to submit maintenance work order'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Report Hostel Maintenance Issue"
        description="Log an urgent work order for electrical, plumbing, carpentry, or HVAC repair within your authorized hostel blocks."
        badge={<Badge variant="orange" dot>WORK ORDER INTAKE</Badge>}
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/warden/maintenance')}
          >
            Back to Maintenance
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <DashboardGrid variant="split">
          {/* LEFT 2 COLS: Issue Details */}
          <GridCol span={2}>
            <ContentSection
              title="Issue Particulars"
              subtitle="Describe the equipment failure or repair need"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    Problem Description & Categorization
                  </CardTitle>
                  <CardDescription>
                    Provide comprehensive details to assist technicians with tool and parts preparation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Work Order Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Geyser water heater leakage on 2nd floor bathroom"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg text-slate-100 p-2.5 text-sm focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Priority and Equipment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Severity / Priority <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg text-slate-100 p-2.5 text-xs focus:outline-none focus:border-orange-500"
                      >
                        <option value="LOW">LOW - Routine maintenance</option>
                        <option value="MEDIUM">MEDIUM - Standard repair</option>
                        <option value="HIGH">HIGH - Urgent disruption</option>
                        <option value="URGENT">URGENT - Emergency / Safety hazard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Linked Facility Asset ID (Optional)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 10 (Water Purifier / Wi-Fi)"
                        value={resourceId}
                        onChange={(e) => setResourceId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg text-slate-100 p-2.5 text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Detailed Issue Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Explain symptoms, affected fixtures, floor damage, or safety considerations..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg text-slate-100 p-3 text-sm focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </ContentSection>
          </GridCol>

          {/* RIGHT 1 COL: Location & Submission */}
          <GridCol span={1}>
            <ContentSection
              title="Location & Dispatch"
              subtitle="Designate affected hostel block"
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-400" />
                    Residential Facility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hostel Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Authorized Hostel Block <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={hostelId}
                      onChange={(e) => setHostelId(Number(e.target.value) || '')}
                      required
                      disabled={hostelsLoading}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg text-slate-100 p-2.5 text-xs focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select Hostel...</option>
                      {hostels.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Room / Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Room / Area (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 204 or 'Wing B Corridors'"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg text-slate-100 p-2.5 text-xs focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-orange-400 font-medium">
                      <Info className="w-3.5 h-3.5" />
                      <span>Technician Notification</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Logging this ticket places it in the active maintenance dispatch queue. You can assign a specific technician from the detail page once created.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      leftIcon={<Send className="w-4 h-4" />}
                      loading={submitting}
                      disabled={submitting}
                    >
                      Submit Work Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ContentSection>
          </GridCol>
        </DashboardGrid>
      </form>
    </PageContainer>
  );
};
