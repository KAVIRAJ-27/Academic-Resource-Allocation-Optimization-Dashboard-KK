import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  Building,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '../../components/ui';
import { useAcademicAllocationPreview } from '../../hooks/useAcademicAllocationPreview';
import { useAcademicAllocationMutations } from '../../hooks/useAcademicAllocationMutations';
import { AcademicResourceCandidateDto } from '../../types/academicAllocation';
import { ConflictPanel } from '../../components/conflict';
import { ConflictItem } from '../../types/conflict';
import { academicAllocationApi } from '../../services/api/academicAllocationApi';
import { OptimizationResult, OptimizationRecommendation } from '../../types/optimization';
import {
  OptimizationRecommendationCard,
  OptimizationComparisonTable,
} from '../../components/optimization';

interface AcademicAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedRequestId?: number;
}

export const AcademicAllocationModal: React.FC<AcademicAllocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedRequestId,
}) => {
  const [requestIdInput, setRequestIdInput] = useState<string>(
    preselectedRequestId ? String(preselectedRequestId) : ''
  );
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [purposeOverride, setPurposeOverride] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [serverConflicts, setServerConflicts] = useState<ConflictItem[] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Phase 31: Optimization state
  const [activeTab, setActiveTab] = useState<'STANDARD' | 'OPTIMIZATION'>('OPTIMIZATION');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizationLoading, setOptimizationLoading] = useState<boolean>(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  const { preview, loading: previewLoading, error: previewError, fetchPreview, resetPreview } =
    useAcademicAllocationPreview();

  const { allocate, autoAllocate, submitting } = useAcademicAllocationMutations();

  const hasBlockingConflicts = Boolean(
    (preview && !preview.canAllocate) ||
    (serverConflicts && serverConflicts.some((c) => c.severity === 'ERROR')) ||
    (preview?.conflicts && preview.conflicts.some((c) => c.severity === 'ERROR'))
  );

  useEffect(() => {
    if (isOpen && preselectedRequestId) {
      setRequestIdInput(String(preselectedRequestId));
      fetchPreview({ requestId: preselectedRequestId }).catch(() => {});
      runOptimization(preselectedRequestId);
    } else if (!isOpen) {
      setRequestIdInput('');
      setSelectedResourceId(null);
      setPurposeOverride('');
      setActionError(null);
      setServerConflicts(null);
      setSuccessMessage(null);
      setOptimizationResult(null);
      setOptimizationError(null);
      setActiveTab('OPTIMIZATION');
      resetPreview();
    }
  }, [isOpen, preselectedRequestId, fetchPreview, resetPreview]);

  if (!isOpen) return null;

  const runOptimization = async (reqId: number) => {
    setOptimizationError(null);
    setOptimizationLoading(true);
    try {
      const res = await academicAllocationApi.optimizeAllocation({ requestId: reqId });
      if (res.data) {
        setOptimizationResult(res.data);
        setActiveTab('OPTIMIZATION');
        if (res.data.recommendations && res.data.recommendations.length > 0) {
          setSelectedResourceId(res.data.recommendations[0].candidateId);
        }
      }
    } catch (err: any) {
      setOptimizationError(err?.response?.data?.message || err?.message || 'Unable to generate recommendations.');
    } finally {
      setOptimizationLoading(false);
    }
  };

  const handleSearchPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setServerConflicts(null);
    setSelectedResourceId(null);
    const reqId = parseInt(requestIdInput.trim(), 10);
    if (isNaN(reqId) || reqId <= 0) {
      setActionError('Please enter a valid numeric Request ID.');
      return;
    }
    try {
      const data = await fetchPreview({ requestId: reqId });
      if (data?.recommendedResource) {
        setSelectedResourceId(data.recommendedResource.resourceId);
      }
      setActiveTab('STANDARD');
    } catch (err: any) {
      // preview hook handles error
    }
  };

  const handleOptimizeClick = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActionError(null);
    setServerConflicts(null);
    const reqId = parseInt(requestIdInput.trim(), 10);
    if (isNaN(reqId) || reqId <= 0) {
      setActionError('Please enter a valid numeric Request ID to optimize.');
      return;
    }
    // Also fetch preview in background to populate request metadata
    fetchPreview({ requestId: reqId }).catch(() => {});
    await runOptimization(reqId);
  };

  const handleSelectRecommendation = (rec: OptimizationRecommendation) => {
    setSelectedResourceId(rec.candidateId);
    setSuccessMessage(`Selected #${rec.rank}: ${rec.candidateName} (Score: ${rec.score})`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleManualAllocate = async () => {
    const reqId = preview?.requestId || (optimizationResult ? optimizationResult.requestId : parseInt(requestIdInput, 10));
    if (!reqId || !selectedResourceId) {
      setActionError('Please select an eligible resource to allocate.');
      return;
    }
    setActionError(null);
    setServerConflicts(null);
    try {
      await allocate({
        requestId: reqId,
        resourceId: selectedResourceId,
        purpose: purposeOverride.trim() || undefined,
      });
      setSuccessMessage('Academic resource allocated successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      const backendConflicts = err?.response?.data?.conflicts;
      if (Array.isArray(backendConflicts) && backendConflicts.length > 0) {
        setServerConflicts(backendConflicts);
      }
      if (err?.response?.status === 409 || err?.response?.status === 400) {
        setActionError('The recommended resource is no longer available. Please optimize again.');
      } else {
        setActionError(err?.response?.data?.message || err?.message || 'Failed to allocate resource');
      }
    }
  };

  const handleAutoAllocate = async () => {
    if (!preview) return;
    setActionError(null);
    setServerConflicts(null);
    try {
      const result = await autoAllocate({
        requestId: preview.requestId,
        purpose: purposeOverride.trim() || undefined,
      });
      setSelectedResourceId(result.resourceId);
      setSuccessMessage('Best candidate resource auto-allocated successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      const backendConflicts = err?.response?.data?.conflicts;
      if (Array.isArray(backendConflicts) && backendConflicts.length > 0) {
        setServerConflicts(backendConflicts);
      }
      if (err?.response?.status === 409) {
        setActionError('The recommended resource is no longer available. Please optimize again.');
      } else {
        setActionError(err?.response?.data?.message || err?.message || 'Auto-allocation failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Academic Resource Allocation</h2>
              <p className="text-xs text-slate-400">
                Deterministic conflict checking, explainable scoring & optimization engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Request Intake Form */}
          <form onSubmit={handleSearchPreview} className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="Enter Academic Request ID (e.g., 101)..."
                value={requestIdInput}
                onChange={(e) => setRequestIdInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={handleOptimizeClick}
              disabled={optimizationLoading || !requestIdInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {optimizationLoading ? 'Finding best allocation...' : 'Optimize & Recommend'}
            </Button>
            <Button type="submit" variant="outline" disabled={previewLoading || !requestIdInput.trim()}>
              {previewLoading ? 'Evaluating...' : 'Standard Preview'}
            </Button>
          </form>

          {/* Feedback Alerts */}
          {actionError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold text-rose-200">Allocation Constraint Violated</p>
                <p className="text-xs mt-0.5 opacity-90">{actionError}</p>
              </div>
            </div>
          )}

          {optimizationError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold text-rose-200">Optimization Error</p>
                <p className="text-xs mt-0.5 opacity-90">{optimizationError}</p>
              </div>
            </div>
          )}

          {previewError && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-3 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-200">Candidate Evaluation Error</p>
                <p className="text-xs mt-0.5 opacity-90">{previewError}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Request Context Card */}
          {preview && (
            <Card className="bg-slate-800/60 border-slate-750">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Requester / Dept:</span>
                    <span className="font-medium text-white truncate block mt-0.5">
                      {preview.requesterName || 'N/A'}
                    </span>
                    <span className="text-slate-400 text-[11px] block">
                      {preview.departmentName || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Schedule Window:</span>
                    <div className="flex items-center gap-1 font-medium text-white mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>{preview.requestedDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300 text-[11px] mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {preview.startTime} - {preview.endTime}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Category & Seats:</span>
                    <span className="font-medium text-white block mt-0.5">
                      {preview.categoryName || 'Academic Resource'}
                    </span>
                    <div className="flex items-center gap-1 text-blue-400 text-[11px] mt-0.5">
                      <Users className="w-3 h-3" />
                      <span>{preview.requestedCapacity} seats required</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Purpose:</span>
                    <span className="font-medium text-slate-200 block truncate mt-0.5" title={preview.requestPurpose}>
                      {preview.requestPurpose}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mode Switcher Tabs */}
          {(optimizationResult || preview) && (
            <div className="flex border-b border-slate-800 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('OPTIMIZATION')}
                className={`pb-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'OPTIMIZATION'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Explainable Recommendations (
                {optimizationResult ? optimizationResult.recommendations.length : 0})
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={() => setActiveTab('STANDARD')}
                  className={`pb-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === 'STANDARD'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  All Available Resources ({preview.eligibleResources.length})
                </button>
              )}
            </div>
          )}

          {/* Tab 1: Phase 31 Optimization Recommendations */}
          {activeTab === 'OPTIMIZATION' && (
            <div className="space-y-4">
              {optimizationLoading && (
                <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-800 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">Finding best allocation...</p>
                  <p className="text-xs text-slate-500">
                    Evaluating capacity efficiency, scheduling constraints & workload balance
                  </p>
                </div>
              )}

              {!optimizationLoading && optimizationResult && optimizationResult.recommendations.length === 0 && (
                <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center space-y-2">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No valid allocation candidates found.</p>
                  <p className="text-xs text-slate-500">
                    {optimizationResult.message || 'All evaluated resources violated hard capacity or scheduling constraints.'}
                  </p>
                </div>
              )}

              {!optimizationLoading && optimizationResult && optimizationResult.recommendations.length > 0 && (
                <div className="space-y-4">
                  {/* Results summary header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Optimization Results:
                      </span>
                      <Badge variant="success">
                        {optimizationResult.recommendations.length} suitable {optimizationResult.recommendations.length === 1 ? 'allocation' : 'allocations'} found
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      Evaluated {optimizationResult.totalCandidatesEvaluated} candidate resources
                    </span>
                  </div>

                  {/* Comparison Table */}
                  <OptimizationComparisonTable
                    recommendations={optimizationResult.recommendations}
                    selectedCandidateId={selectedResourceId}
                    onSelect={handleSelectRecommendation}
                    domain="ACADEMIC"
                  />

                  {/* Top Recommendations Cards with explainability */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      Detailed Recommendations & Explainable Breakdown
                    </h4>
                    {optimizationResult.recommendations.map((rec) => (
                      <OptimizationRecommendationCard
                        key={rec.candidateId}
                        recommendation={rec}
                        isSelected={selectedResourceId === rec.candidateId}
                        onSelect={handleSelectRecommendation}
                        domain="ACADEMIC"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Standard Candidates Preview */}
          {activeTab === 'STANDARD' && preview && (
            <div className="space-y-6">
              {/* Conflict Detection Panel */}
              {(serverConflicts || preview?.conflictResult || (preview?.conflicts && preview.conflicts.length > 0)) && (
                <ConflictPanel
                  title="Academic Allocation Constraints & Conflict Assessment"
                  conflictResult={preview?.conflictResult}
                  conflicts={serverConflicts || preview?.conflicts}
                  valid={!hasBlockingConflicts}
                />
              )}

              {/* Auto Allocate Banner */}
              {preview.recommendedResource && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/30 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          Recommended Match: {preview.recommendedResource.resourceName}
                        </span>
                        <Badge variant="success">Best Fit</Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {preview.recommendedResource.resourceCode} • Capacity: {preview.recommendedResource.capacity} seats • Wasted: +
                        {preview.recommendedResource.wastedCapacity} seats
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAutoAllocate}
                    disabled={submitting || hasBlockingConflicts}
                    className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    {submitting ? 'Allocating...' : 'Auto-Allocate Best Match'}
                  </Button>
                </div>
              )}

              {/* Candidate Resources Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Eligible Resources ({preview.eligibleResources.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    Ranked deterministically by minimal capacity waste
                  </span>
                </div>

                {preview.eligibleResources.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-center text-xs text-slate-400">
                    No eligible resource found meeting all time and capacity constraints.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {preview.eligibleResources.map((res: AcademicResourceCandidateDto) => {
                      const isSelected = selectedResourceId === res.resourceId;
                      return (
                        <div
                          key={res.resourceId}
                          onClick={() => setSelectedResourceId(res.resourceId)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/50 shadow-md'
                              : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">
                                  {res.resourceName}
                                </span>
                                <Badge variant="gray" className="text-[10px] py-0">
                                  {res.resourceCode}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-slate-500" />
                                {res.building ? `${res.building} - ${res.roomNumber}` : res.location || 'Campus'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold text-emerald-400 block">
                                {res.capacity} Seats
                              </span>
                              <span className="text-[10px] text-slate-400">
                                +{res.wastedCapacity} spare
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">{res.categoryName}</span>
                            <span
                              className={`text-xs font-medium ${
                                isSelected ? 'text-blue-400' : 'text-slate-400'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Click to Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purpose / Remarks Override */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-slate-300">
              Allocation Remarks / Purpose Override (Optional):
            </label>
            <input
              type="text"
              placeholder="Enter remarks or leave blank to keep request purpose..."
              value={purposeOverride}
              onChange={(e) => setPurposeOverride(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleManualAllocate}
              disabled={submitting || !selectedResourceId || hasBlockingConflicts}
            >
              {submitting ? 'Committing Allocation...' : 'Confirm Allocation'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
