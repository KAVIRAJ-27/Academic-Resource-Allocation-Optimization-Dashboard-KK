import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  BedDouble,
  Calendar,
  AlertCircle,
  Layers,
  Sliders,
  Award,
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { useHostelAllocationEngine } from '../../hooks/useHostelAllocationEngine';
import { HostelCandidateDto } from '../../types/hostelAllocation';
import { ConflictPanel } from '../../components/conflict';
import { ConflictItem } from '../../types/conflict';
import { hostelAllocationApi } from '../../services/api/hostelAllocationApi';
import { OptimizationResult, OptimizationRecommendation } from '../../types/optimization';
import {
  OptimizationRecommendationCard,
  OptimizationComparisonTable,
} from '../../components/optimization';

interface HostelAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedRequestId?: number;
}

export const HostelAllocationModal: React.FC<HostelAllocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedRequestId,
}) => {
  const [mode, setMode] = useState<'OPTIMIZE' | 'AUTO' | 'MANUAL'>('OPTIMIZE');
  const [requestIdInput, setRequestIdInput] = useState<string>(
    preselectedRequestId ? String(preselectedRequestId) : ''
  );
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [hostelIdInput, setHostelIdInput] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<HostelCandidateDto | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [serverConflicts, setServerConflicts] = useState<ConflictItem[] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Phase 31: Hostel Optimization State
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [optimizationLoading, setOptimizationLoading] = useState<boolean>(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);

  const {
    preview,
    previewLoading,
    actionLoading,
    error: engineError,
    runPreview,
    autoAllocate,
    manualAllocate,
    resetState,
  } = useHostelAllocationEngine();

  const hasBlockingConflicts = Boolean(
    (preview && !preview.eligible) ||
    (serverConflicts && serverConflicts.some((c) => c.severity === 'ERROR')) ||
    (preview?.conflicts && preview.conflicts.some((c) => c.severity === 'ERROR'))
  );

  useEffect(() => {
    if (isOpen && preselectedRequestId) {
      setRequestIdInput(String(preselectedRequestId));
      runPreview({ hostelRequestId: preselectedRequestId });
      runOptimization(preselectedRequestId, undefined, undefined);
    } else if (!isOpen) {
      setRequestIdInput('');
      setStudentIdInput('');
      setHostelIdInput('');
      setSelectedCandidate(null);
      setActionError(null);
      setServerConflicts(null);
      setSuccessMessage(null);
      setOptimizationResult(null);
      setOptimizationError(null);
      setMode('OPTIMIZE');
      resetState();
    }
  }, [isOpen, preselectedRequestId, runPreview, resetState]);

  useEffect(() => {
    if (preview?.recommendedBed && mode !== 'OPTIMIZE') {
      setSelectedCandidate(preview.recommendedBed);
    }
  }, [preview, mode]);

  if (!isOpen) return null;

  const runOptimization = async (reqId?: number, stuId?: number, hstId?: number) => {
    setActionError(null);
    setServerConflicts(null);
    setOptimizationError(null);
    setOptimizationLoading(true);

    try {
      const res = await hostelAllocationApi.optimizeAllocation({
        hostelRequestId: reqId,
        studentId: stuId,
        hostelId: hstId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res.data) {
        setOptimizationResult(res.data);
        setMode('OPTIMIZE');
        if (res.data.recommendations && res.data.recommendations.length > 0) {
          const top = res.data.recommendations[0];
          setSelectedCandidate({
            bedId: top.candidateId,
            bedNumber: String(top.details?.bedNumber || ''),
            roomId: top.details?.roomId || 0,
            roomNumber: String(top.details?.roomNumber || ''),
            roomType: 'STANDARD',
            currentOccupancy: top.details?.occupiedBeds || 0,
            capacity: top.details?.roomCapacity || 1,
            availableCapacity: Math.max(0, (top.details?.roomCapacity || 1) - (top.details?.occupiedBeds || 0)),
            floorId: 0,
            floorNumber: top.details?.floorNumber || 1,
            blockId: 0,
            blockName: String(top.details?.blockName || ''),
            hostelId: top.details?.hostelId || 0,
            hostelName: String(top.details?.hostelName || ''),
            hostelCode: String(top.details?.hostelName || ''),
            available: true,
          });
        }
      }
    } catch (err: any) {
      setOptimizationError(err?.response?.data?.message || err?.message || 'Unable to generate recommendations.');
    } finally {
      setOptimizationLoading(false);
    }
  };

  const handleSimulatePreview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActionError(null);
    setServerConflicts(null);
    setSuccessMessage(null);

    const reqId = requestIdInput.trim() ? parseInt(requestIdInput.trim(), 10) : undefined;
    const stuId = studentIdInput.trim() ? parseInt(studentIdInput.trim(), 10) : undefined;
    const hstId = hostelIdInput.trim() ? parseInt(hostelIdInput.trim(), 10) : undefined;

    if (!reqId && !stuId) {
      setActionError('Please provide either a valid Hostel Request ID or Student ID to simulate allocation.');
      return;
    }

    await runPreview({
      hostelRequestId: reqId,
      studentId: stuId,
      hostelId: hstId,
    });
    setMode('AUTO');
  };

  const handleOptimizeClick = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const reqId = requestIdInput.trim() ? parseInt(requestIdInput.trim(), 10) : undefined;
    const stuId = studentIdInput.trim() ? parseInt(studentIdInput.trim(), 10) : undefined;
    const hstId = hostelIdInput.trim() ? parseInt(hostelIdInput.trim(), 10) : undefined;

    if (!reqId && !stuId) {
      setActionError('Please provide either a valid Hostel Request ID or Student ID to optimize.');
      return;
    }

    // Also trigger preview in background for request context
    runPreview({ hostelRequestId: reqId, studentId: stuId, hostelId: hstId }).catch(() => {});
    await runOptimization(reqId, stuId, hstId);
  };

  const handleSelectRecommendation = (rec: OptimizationRecommendation) => {
    setSelectedCandidate({
      bedId: rec.candidateId,
      bedNumber: String(rec.details?.bedNumber || ''),
      roomId: rec.details?.roomId || 0,
      roomNumber: String(rec.details?.roomNumber || ''),
      roomType: 'STANDARD',
      currentOccupancy: rec.details?.occupiedBeds || 0,
      capacity: rec.details?.roomCapacity || 1,
      availableCapacity: Math.max(0, (rec.details?.roomCapacity || 1) - (rec.details?.occupiedBeds || 0)),
      floorId: 0,
      floorNumber: rec.details?.floorNumber || 1,
      blockId: 0,
      blockName: String(rec.details?.blockName || ''),
      hostelId: rec.details?.hostelId || 0,
      hostelName: String(rec.details?.hostelName || ''),
      hostelCode: String(rec.details?.hostelName || ''),
      available: true,
    });
    setSuccessMessage(`Selected #${rec.rank}: Bed #${rec.details?.bedNumber} in ${rec.details?.hostelName} (Score: ${rec.score})`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAutoAllocate = async () => {
    setActionError(null);
    setServerConflicts(null);
    setSuccessMessage(null);

    const reqId = parseInt(requestIdInput.trim(), 10);
    if (isNaN(reqId) || reqId <= 0) {
      setActionError('Auto-allocation requires a valid Hostel Request ID.');
      return;
    }

    try {
      const res = await autoAllocate({
        hostelRequestId: reqId,
        hostelId: hostelIdInput.trim() ? parseInt(hostelIdInput.trim(), 10) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      if (res) {
        setSuccessMessage(`Successfully allocated Bed #${res.bedNumber} in ${res.hostelName} to student.`);
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      const backendConflicts = err?.response?.data?.conflicts;
      if (Array.isArray(backendConflicts) && backendConflicts.length > 0) {
        setServerConflicts(backendConflicts);
      }
      if (err?.response?.status === 409) {
        setActionError('The recommended resource is no longer available. Please optimize again.');
      } else {
        setActionError(err?.response?.data?.message || err?.message || 'Failed to auto-allocate bed.');
      }
    }
  };

  const handleManualAllocate = async () => {
    setActionError(null);
    setServerConflicts(null);
    setSuccessMessage(null);

    const stuId = studentIdInput.trim()
      ? parseInt(studentIdInput.trim(), 10)
      : undefined;

    if (!stuId) {
      setActionError('Please specify a student ID before manual allocation.');
      return;
    }

    if (!selectedCandidate) {
      setActionError('Please select an available bed candidate from the recommendations or eligible list.');
      return;
    }

    try {
      const res = await manualAllocate({
        studentId: stuId,
        hostelId: selectedCandidate.hostelId,
        roomId: selectedCandidate.roomId,
        bedId: selectedCandidate.bedId,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || undefined,
        hostelRequestId: requestIdInput.trim() ? parseInt(requestIdInput.trim(), 10) : undefined,
      });

      if (res) {
        setSuccessMessage(`Successfully allocated Bed #${res.bedNumber} in Room ${res.roomNumber} (${res.hostelName}).`);
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      const backendConflicts = err?.response?.data?.conflicts;
      if (Array.isArray(backendConflicts) && backendConflicts.length > 0) {
        setServerConflicts(backendConflicts);
      }
      if (err?.response?.status === 409) {
        setActionError('The recommended resource is no longer available. Please optimize again.');
      } else {
        setActionError(err?.response?.data?.message || err?.message || 'Failed to allocate bed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-[#0E1118] border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#121622]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Hostel Resource Allocation & Optimization Engine
              </h3>
              <p className="text-xs text-gray-400">
                Deterministic candidate scoring, occupancy balancing & conflict prevention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:bg-[#1E2330] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode Switch */}
          <div className="flex bg-[#0B0D14] p-1 rounded-lg w-fit border border-slate-200 flex-wrap gap-1">
            <button
              onClick={() => setMode('OPTIMIZE')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                mode === 'OPTIMIZE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Explainable Optimizer
            </button>
            <button
              onClick={() => setMode('AUTO')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                mode === 'AUTO'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Engine Auto-Allocate
            </button>
            <button
              onClick={() => setMode('MANUAL')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                mode === 'MANUAL'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Manual Selection
            </button>
          </div>

          {/* Feedback alerts */}
          {(actionError || engineError) && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{actionError || engineError}</div>
            </div>
          )}

          {optimizationError && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{optimizationError}</div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div className="font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Request / Intake form */}
          <form onSubmit={handleOptimizeClick} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-1">
                Hostel Request ID
              </label>
              <input
                type="number"
                value={requestIdInput}
                onChange={(e) => setRequestIdInput(e.target.value)}
                placeholder="e.g. 101"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-[#0B0D14] text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-1">
                Student ID (Optional)
              </label>
              <input
                type="number"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-[#0B0D14] text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider mb-1">
                Target Hostel ID (Optional)
              </label>
              <input
                type="number"
                value={hostelIdInput}
                onChange={(e) => setHostelIdInput(e.target.value)}
                placeholder="Filter to specific hostel"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-[#0B0D14] text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-center justify-between gap-4 pt-1 flex-wrap">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Start:
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="ml-1 px-2 py-1 text-xs rounded border border-slate-200 bg-[#0B0D14] text-white"
                  />
                </span>
                <span className="flex items-center gap-1">
                  End:
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="ml-1 px-2 py-1 text-xs rounded border border-slate-200 bg-[#0B0D14] text-white"
                  />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={optimizationLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {optimizationLoading ? 'Finding best allocation...' : 'Find Best Bed (Optimize)'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={previewLoading}
                  onClick={handleSimulatePreview}
                  className="flex items-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  {previewLoading ? 'Simulating...' : 'Run Preview'}
                </Button>
              </div>
            </div>
          </form>

          {/* Phase 30: Conflict Detection & Constraint Assessment */}
          {(serverConflicts || preview?.conflictResult || (preview?.conflicts && preview.conflicts.length > 0)) && (
            <ConflictPanel
              title="Hostel Allocation Constraints & Conflict Assessment"
              conflictResult={preview?.conflictResult}
              conflicts={serverConflicts || preview?.conflicts}
              valid={!hasBlockingConflicts}
            />
          )}

          {/* Section: Mode === OPTIMIZE */}
          {mode === 'OPTIMIZE' && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              {optimizationLoading && (
                <div className="p-8 rounded-xl bg-[#121622] border border-slate-200 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white">Finding best allocation...</p>
                  <p className="text-xs text-gray-400">
                    Evaluating hostel occupancy balancing, bed availability & student preferences
                  </p>
                </div>
              )}

              {!optimizationLoading && optimizationResult && optimizationResult.recommendations.length === 0 && (
                <div className="p-6 rounded-xl bg-[#121622] border border-slate-200 text-center space-y-2">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">No valid allocation candidates found.</p>
                  <p className="text-xs text-gray-400">
                    {optimizationResult.message || 'All candidate beds violated hard eligibility or room constraints.'}
                  </p>
                </div>
              )}

              {!optimizationLoading && optimizationResult && optimizationResult.recommendations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-bold">
                        Optimization Results:
                      </span>
                      <Badge variant="success">
                        {optimizationResult.recommendations.length} suitable {optimizationResult.recommendations.length === 1 ? 'allocation' : 'allocations'} found
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      Evaluated {optimizationResult.totalCandidatesEvaluated} candidate beds
                    </span>
                  </div>

                  {/* Comparison Table */}
                  <OptimizationComparisonTable
                    recommendations={optimizationResult.recommendations}
                    selectedCandidateId={selectedCandidate?.bedId || null}
                    onSelect={handleSelectRecommendation}
                    domain="HOSTEL"
                  />

                  {/* Detailed Recommendation Cards */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-teal-400" />
                      Ranked Bed Recommendations & Explainable Breakdown
                    </h4>
                    {optimizationResult.recommendations.map((rec) => (
                      <OptimizationRecommendationCard
                        key={rec.candidateId}
                        recommendation={rec}
                        isSelected={selectedCandidate?.bedId === rec.candidateId}
                        onSelect={handleSelectRecommendation}
                        domain="HOSTEL"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Simulation Results (When in AUTO or MANUAL) */}
          {mode !== 'OPTIMIZE' && preview && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">Allocation Engine Evaluation</h4>
                  <Badge variant={preview.eligible ? 'success' : 'danger'}>
                    {preview.eligible ? 'Eligible for Allocation' : 'Conflicts Detected'}
                  </Badge>
                </div>
                <span className="text-xs text-gray-400">
                  {preview.candidateCount} eligible beds found
                </span>
              </div>

              {/* Engine Recommended Bed */}
              {preview.recommendedBed && (
                <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                        Top Deterministic Recommendation
                      </span>
                    </div>
                    <Badge variant="teal">Bed #{preview.recommendedBed.bedNumber}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Hostel:</span>
                      <p className="font-semibold text-white">{preview.recommendedBed.hostelName}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Block & Floor:</span>
                      <p className="font-semibold text-white">
                        {preview.recommendedBed.blockName} (Floor {preview.recommendedBed.floorNumber})
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Room:</span>
                      <p className="font-semibold text-white">Room {preview.recommendedBed.roomNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="inline-block mt-0.5 text-emerald-400 font-medium">
                        ✓ Ready for Allocation
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">
                    Available Candidate Beds
                  </span>
                  <span className="text-xs text-gray-500">
                    {preview.eligibleCandidates?.length || 0} candidate options
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {preview.eligibleCandidates?.map((candidate: HostelCandidateDto) => {
                    const isSelected = selectedCandidate?.bedId === candidate.bedId;
                    return (
                      <div
                        key={candidate.bedId}
                        onClick={() => setSelectedCandidate(candidate)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500 ring-1 ring-teal-500/30'
                            : 'bg-[#0B0D14] border-slate-200 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-white">Bed #{candidate.bedNumber}</span>
                          <Badge variant={candidate.available ? 'success' : 'danger'}>
                            {candidate.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-300 font-medium truncate">
                          {candidate.hostelName} • {candidate.blockName}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Room {candidate.roomNumber} (Floor {candidate.floorNumber})
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-[#121622]">
          <Button variant="ghost" onClick={onClose} disabled={actionLoading}>
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {selectedCandidate && (
              <span className="text-xs text-teal-400 font-medium hidden sm:inline">
                Selected: Bed #{selectedCandidate.bedNumber} ({selectedCandidate.hostelName})
              </span>
            )}

            {mode === 'AUTO' ? (
              <Button
                variant="primary"
                onClick={handleAutoAllocate}
                disabled={actionLoading || previewLoading || hasBlockingConflicts || !requestIdInput.trim()}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                {actionLoading ? 'Allocating...' : 'Auto-Allocate Best Bed'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleManualAllocate}
                disabled={actionLoading || previewLoading || hasBlockingConflicts || !selectedCandidate}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                {actionLoading ? 'Committing Allocation...' : 'Use Recommendation & Allocate'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
