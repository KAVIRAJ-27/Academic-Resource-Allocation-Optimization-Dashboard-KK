import React, { useState, useEffect } from 'react';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
} from '../../components/layout';
import {
  StatCard,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EmptyState,
} from '../../components/ui';
import {
  Wifi,
  Search,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { useWardenResources } from '../../hooks/useWardenResources';
import { HostelScopeSelector } from '../../components/warden/HostelScopeSelector';
import { WardenFacilitySummary } from '../../types/wardenOperations';

export const WardenResourcesPage: React.FC = () => {
  const { hostels, selectedHostelId, selectedHostel, selectHostel, loading: hostelsLoading } =
    useWardenHostels();

  const {
    resources,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading: resourcesLoading,
    error,
    filters,
    mutating,
    updateFilters,
    resetFilters,
    updateResource,
    refetch,
  } = useWardenResources({ hostelId: selectedHostelId });

  const [selectedFacility, setSelectedFacility] = useState<WardenFacilitySummary | null>(null);
  const [newStatus, setNewStatus] = useState<string>('ACTIVE');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHostelId !== filters.hostelId) {
      updateFilters({ hostelId: selectedHostelId });
    }
  }, [selectedHostelId, filters.hostelId, updateFilters]);

  const openUpdateModal = (facility: WardenFacilitySummary) => {
    setSelectedFacility(facility);
    setNewStatus(facility.status || 'ACTIVE');
    setNewDescription(facility.description || '');
    setNewQuantity(facility.quantity || 1);
    setModalError(null);
  };

  const handleSaveFacility = async () => {
    if (!selectedFacility) return;
    try {
      setModalError(null);
      await updateResource(selectedFacility.id, {
        status: newStatus,
        description: newDescription,
        quantity: newQuantity,
      });
      setSelectedFacility(null);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to update resource');
    }
  };

  const activeCount = resources.filter((r) => r.status === 'ACTIVE').length;
  const maintenanceCount = resources.filter((r) => r.status === 'MAINTENANCE').length;
  const inactiveCount = resources.filter((r) => r.status === 'INACTIVE').length;

  const statusTabs = [
    { key: '', label: 'All Resources' },
    { key: 'ACTIVE', label: 'Active / Nominal' },
    { key: 'MAINTENANCE', label: 'Under Maintenance' },
    { key: 'INACTIVE', label: 'Inactive / Decommissioned' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Facilities & Amenities"
        description="Monitor and manage physical residential equipment, Wi-Fi connectivity nodes, water purifiers, and recreational kits across authorized hostels."
        badge={<Badge variant="teal" dot>FACILITY REGISTRY</Badge>}
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${resourcesLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />

      {/* Hostel Scope Selector */}
      <div className="mb-6">
        <HostelScopeSelector
          hostels={hostels}
          selectedHostelId={selectedHostelId}
          onSelectHostel={selectHostel}
          loading={hostelsLoading}
        />
      </div>

      {/* Metrics Row */}
      <ContentSection title="Facility Status Breakdown">
        <DashboardGrid variant="stats">
          <StatCard
            title="Total Facilities"
            value={totalElements}
            description={selectedHostel ? selectedHostel.name : 'All authorized hostels'}
            icon={Wifi}
            badge={<Badge variant="teal">Registered</Badge>}
            trend={{ direction: 'neutral', label: 'Tracked Assets' }}
          />
          <StatCard
            title="Active & Online"
            value={activeCount}
            description="Operational in hostels"
            icon={CheckCircle2}
            badge={<Badge variant="success">Active</Badge>}
            trend={{ direction: 'up', label: 'Available for residents' }}
          />
          <StatCard
            title="In Maintenance"
            value={maintenanceCount}
            description="Under repair or inspection"
            icon={AlertTriangle}
            badge={<Badge variant="warning">Repairs</Badge>}
            trend={{ direction: 'neutral', label: 'Service dispatch pending' }}
          />
          <StatCard
            title="Inactive Assets"
            value={inactiveCount}
            description="Temporarily decommissioned"
            icon={Layers}
            badge={<Badge variant="gray">Standby</Badge>}
            trend={{ direction: 'down', label: 'Off-grid' }}
          />
        </DashboardGrid>
      </ContentSection>

      {/* Main Table Card */}
      <Card className="bg-[#0D1017] border-slate-200 shadow-xl mt-6">
        <CardHeader className="border-b border-slate-200 pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-gray-100 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-teal-400" />
                  Hostel Facilities Inventory
                </CardTitle>
                <CardDescription>
                  {selectedHostel
                    ? `Showing equipment and amenities for ${selectedHostel.name}`
                    : 'Showing facilities across all assigned hostels'}
                </CardDescription>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
              {statusTabs.map((tab) => {
                const isActive = (filters.status || '') === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => updateFilters({ status: tab.key || undefined })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search facility name or description..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="text-xs text-gray-400 font-mono">
                Showing {resources.length} of {totalElements} facilities
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {resourcesLoading ? (
            <div className="p-12 text-center text-xs text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
              Loading facility inventory...
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-200">Error loading facilities</p>
              <p className="text-xs text-gray-400 mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : resources.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No facilities found"
                description={
                  hostels.length === 0
                    ? 'No hostel has been assigned to your warden account.'
                    : 'No equipment or amenities match the selected criteria.'
                }
                icon={Wifi}
              >
                {(filters.search || filters.status) && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                )}
              </EmptyState>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-white text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Facility / Amenity</th>
                    <th className="py-3 px-4">Hostel</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {resources.map((item) => {
                    const statusVariant =
                      item.status === 'ACTIVE'
                        ? 'success'
                        : item.status === 'MAINTENANCE'
                        ? 'warning'
                        : 'gray';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-100 flex items-center gap-2">
                            <Wifi className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-[11px] text-slate-600 font-medium mt-0.5 truncate max-w-sm">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium">{item.hostelName}</div>
                          <div className="text-[10px] text-slate-500 font-medium font-mono">{item.hostelCode}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 font-medium">
                          {item.quantity} units
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusVariant} size="sm">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit3 className="w-3 h-3" />}
                            onClick={() => openUpdateModal(item)}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-200">
              <div className="text-xs text-gray-400 font-mono">
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0D1017] border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-400" />
                Update Facility: {selectedFacility.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="text-gray-400 hover:text-gray-200 text-sm"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {modalError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-mono">Operational Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="ACTIVE">ACTIVE — Online and operational</option>
                  <option value="MAINTENANCE">MAINTENANCE — Under repair / offline</option>
                  <option value="INACTIVE">INACTIVE — Decommissioned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-mono">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-mono">Description / Notes</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Location details, model, specifications..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFacility(null)}
                disabled={mutating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveFacility}
                disabled={mutating}
                leftIcon={mutating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              >
                {mutating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
