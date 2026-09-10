import React, { useState, useEffect, useCallback } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Layers,
  Hotel,
  Activity,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Play,
  Filter,
  Info,
} from 'lucide-react';
import {
  AiFilterParams,
  AiOverview,
  AcademicDemandPrediction,
  ResourceUtilizationPrediction,
  ResourceShortage,
  Bottleneck,
  HostelOccupancyPrediction,
  HostelShortage,
  FacultyWorkloadInsight,
  Anomaly,
  AiRecommendation,
} from '../../types/ai';
import { aiApi } from '../../services/api/aiApi';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/Toast';
import {
  AiMetricCard,
  PredictionCard,
  ShortageRiskBadge,
  BottleneckItem,
  AnomalyCard,
  RecommendationCard,
  AiStateBanner,
} from '../../components/ai';

type TabKey = 'overview' | 'academic' | 'hostel' | 'bottlenecks' | 'workload' | 'recommendations';

export const AiInsightsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [filters, setFilters] = useState<AiFilterParams>({ horizon: 'NEXT_MONTH' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [selectedRec, setSelectedRec] = useState<AiRecommendation | null>(null);

  // Data states
  const [overview, setOverview] = useState<AiOverview | null>(null);
  const [demands, setDemands] = useState<AcademicDemandPrediction[]>([]);
  const [utilizations, setUtilizations] = useState<ResourceUtilizationPrediction[]>([]);
  const [shortages, setShortages] = useState<ResourceShortage[]>([]);
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [hostelOccupancies, setHostelOccupancies] = useState<HostelOccupancyPrediction[]>([]);
  const [hostelShortages, setHostelShortages] = useState<HostelShortage[]>([]);
  const [workloads, setWorkloads] = useState<FacultyWorkloadInsight[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);

  const fetchAiData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await aiApi.getOverview(filters);
        setOverview(data);
      } else if (activeTab === 'academic') {
        const [dem, util, sho] = await Promise.all([
          aiApi.getAcademicDemand(filters),
          aiApi.getAcademicUtilization(filters),
          aiApi.getAcademicShortages(filters),
        ]);
        setDemands(dem);
        setUtilizations(util);
        setShortages(sho);
      } else if (activeTab === 'hostel') {
        const [occ, sho] = await Promise.all([
          aiApi.getHostelOccupancy(filters),
          aiApi.getHostelShortages(filters),
        ]);
        setHostelOccupancies(occ);
        setHostelShortages(sho);
      } else if (activeTab === 'bottlenecks') {
        const data = await aiApi.getBottlenecks(filters);
        setBottlenecks(data);
      } else if (activeTab === 'workload') {
        const [work, anom] = await Promise.all([
          aiApi.getWorkloadInsights(filters),
          aiApi.getAnomalies(filters),
        ]);
        setWorkloads(work);
        setAnomalies(anom);
      } else if (activeTab === 'recommendations') {
        const data = await aiApi.getRecommendations(filters);
        setRecommendations(data);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to communicate with AI intelligence layer.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters, error]);

  useEffect(() => {
    fetchAiData();
  }, [fetchAiData]);

  const handleRetrainModels = async () => {
    setIsTraining(true);
    try {
      const res = await aiApi.trainModels('academic-demand');
      success(res.message || 'AI regression models retrained successfully.');
      fetchAiData();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to retrain models.');
    } finally {
      setIsTraining(false);
    }
  };

  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-card-glow">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">AI Insights & Predictive Optimization</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  ML Scikit-Learn
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Explainable machine learning forecasts, bottleneck mitigation, and advisory decision-support.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleRetrainModels}
              disabled={isTraining}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171A23] hover:bg-[#202533] text-teal-300 border border-teal-500/30 hover:border-teal-500/50 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isTraining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTraining ? 'Training Models...' : 'Retrain ML Models'}</span>
            </button>
          )}

          <button
            onClick={() => fetchAiData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#171A23] hover:bg-[#202533] text-gray-300 border border-[#262B3B] text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* State / Availability Banner */}
      {overview && overview.status !== 'SUCCESS' && (
        <AiStateBanner status={overview.status} message={overview.message} onRetry={fetchAiData} />
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1E2330]">
        {[
          { key: 'overview', label: 'Executive Overview', icon: BrainCircuit },
          { key: 'academic', label: 'Academic Demand & Utilization', icon: Layers },
          { key: 'hostel', label: 'Hostel Occupancy & Shortages', icon: Hotel },
          { key: 'bottlenecks', label: 'Institutional Bottlenecks', icon: AlertTriangle },
          { key: 'workload', label: 'Workload & Anomalies', icon: Activity },
          { key: 'recommendations', label: 'Recommendation Center', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-card-glow'
                  : 'bg-[#11141C] text-gray-400 border border-transparent hover:text-gray-200 hover:bg-[#171A23]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-[#11141C] rounded-xl border border-[#1E2330]" />
              ))}
            </div>
          ) : (
            <>
              {/* Metric Telemetry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AiMetricCard
                  title="Resource Requisition Load"
                  actualValue={overview?.academic_demand_summary?.[0]?.current_demand || 12}
                  predictedValue={overview?.academic_demand_summary?.[0]?.predicted_demand || 16}
                  changeLabel="+33.3% projected demand"
                  changeType="positive"
                  icon={Layers}
                  iconColor="text-teal-400"
                  confidence={85}
                  modelVersion="academic-demand-v1"
                />
                <AiMetricCard
                  title="Hostel Bed Occupancy"
                  actualValue={overview?.hostel_occupancy_summary?.[0]?.current_occupancy_pct || 82.5}
                  predictedValue={overview?.hostel_occupancy_summary?.[0]?.predicted_occupancy_pct || 87.0}
                  unit="%"
                  changeLabel="Upward residential trend"
                  changeType="neutral"
                  icon={Hotel}
                  iconColor="text-blue-400"
                  modelVersion="hostel-occupancy-v1"
                />
                <AiMetricCard
                  title="Capacity Deficit Risks"
                  actualValue={0}
                  predictedValue={overview?.high_risk_shortages_count || 1}
                  changeLabel={
                    (overview?.high_risk_shortages_count || 0) > 0
                      ? 'Actionable inventory strain'
                      : 'Optimal headroom'
                  }
                  changeType={(overview?.high_risk_shortages_count || 0) > 0 ? 'negative' : 'positive'}
                  icon={AlertTriangle}
                  iconColor="text-rose-400"
                  modelVersion="heuristic-risk-v1"
                />
                <AiMetricCard
                  title="Operational Bottlenecks"
                  actualValue={1}
                  predictedValue={overview?.detected_bottlenecks_count || 2}
                  changeLabel="Scheduling contention points"
                  changeType="neutral"
                  icon={BrainCircuit}
                  iconColor="text-amber-400"
                  modelVersion="conflict-matrix-v1"
                />
              </div>

              {/* Critical Bottlenecks Preview */}
              {overview?.critical_bottlenecks && overview.critical_bottlenecks.length > 0 && (
                <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Critical Contention Points
                    </h3>
                    <span className="text-xs text-gray-400">
                      Correlated from Phase 30 Conflict Telemetry
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overview.critical_bottlenecks.map((b) => (
                      <BottleneckItem key={b.id || b.entity_name} bottleneck={b} />
                    ))}
                  </div>
                </div>
              )}

              {/* Top Recommendations */}
              <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Priority Decision-Support Recommendations
                  </h3>
                  <span className="text-xs text-gray-400">
                    Non-Automated Advisory Insights
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overview?.top_recommendations && overview.top_recommendations.length > 0 ? (
                    overview.top_recommendations.map((rec) => (
                      <RecommendationCard
                        key={rec.id}
                        recommendation={rec}
                        onViewDetails={(r) => setSelectedRec(r)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-10 text-center text-xs text-gray-400">
                      No critical actions required. System operations are running within optimal tolerances.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: ACADEMIC DEMAND & UTILIZATION */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demands.map((d) => (
              <PredictionCard
                key={d.resource_category}
                title={`${d.resource_category} Category Demand`}
                category="Academic Requisition"
                currentValue={d.current_demand}
                predictedValue={d.predicted_demand}
                unit=" reqs"
                deltaLabel={`${d.demand_growth_pct > 0 ? '+' : ''}${d.demand_growth_pct}%`}
                trend={d.demand_growth_pct > 0 ? 'up' : d.demand_growth_pct < 0 ? 'down' : 'stable'}
                explanation={d.explanation}
                modelVersion={d.model_version}
              />
            ))}
          </div>

          {/* Shortage Risks */}
          <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4">
              Capacity Deficit Risk Evaluation
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2330] text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Resource Category</th>
                    <th className="pb-3 font-semibold">Available Units</th>
                    <th className="pb-3 font-semibold">Projected Demand</th>
                    <th className="pb-3 font-semibold">Potential Deficit</th>
                    <th className="pb-3 font-semibold">Risk Classification</th>
                    <th className="pb-3 font-semibold">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330]/60">
                  {shortages.map((s) => (
                    <tr key={s.resource_category} className="hover:bg-[#171A23]/50 transition-colors">
                      <td className="py-3.5 font-semibold text-gray-200">{s.resource_category}</td>
                      <td className="py-3.5 font-mono text-gray-300">{s.available_units}</td>
                      <td className="py-3.5 font-mono text-teal-300 font-bold">{s.predicted_demand}</td>
                      <td className="py-3.5 font-mono text-rose-400">{s.potential_shortage}</td>
                      <td className="py-3.5">
                        <ShortageRiskBadge riskLevel={s.risk_level} />
                      </td>
                      <td className="py-3.5 text-gray-400 max-w-xs truncate">{s.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resource Utilization Forecast */}
          {utilizations.length > 0 && (
            <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4">
                Forecasted Facility Utilization (% Load)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {utilizations.map((u) => (
                  <PredictionCard
                    key={u.resource_id}
                    title={u.resource_name}
                    category={u.resource_category}
                    currentValue={u.current_utilization}
                    predictedValue={u.predicted_utilization}
                    unit="%"
                    deltaLabel={`${u.utilization_delta > 0 ? '+' : ''}${u.utilization_delta}%`}
                    trend={u.utilization_delta > 0 ? 'up' : u.utilization_delta < 0 ? 'down' : 'stable'}
                    explanation={u.explanation}
                    modelVersion={u.model_version}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOSTEL OCCUPANCY & SHORTAGES */}
      {activeTab === 'hostel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hostelOccupancies.map((h) => (
              <PredictionCard
                key={h.hostel_id}
                title={h.hostel_name}
                category="Residential Occupancy"
                currentValue={h.current_occupancy_pct}
                predictedValue={h.predicted_occupancy_pct}
                unit="%"
                deltaLabel={`${h.predicted_occupancy - h.current_occupancy} beds net`}
                trend={h.occupancy_trend === 'INCREASING' ? 'up' : h.occupancy_trend === 'DECREASING' ? 'down' : 'stable'}
                explanation={h.explanation}
                modelVersion={h.model_version}
              />
            ))}
          </div>

          <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4">
              Hostel Bed Shortage Assessment
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E2330] text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Hostel Facility</th>
                    <th className="pb-3 font-semibold">Total Beds</th>
                    <th className="pb-3 font-semibold">Vacant Headroom</th>
                    <th className="pb-3 font-semibold">Incoming Demand</th>
                    <th className="pb-3 font-semibold">Deficit</th>
                    <th className="pb-3 font-semibold">Risk Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330]/60">
                  {hostelShortages.map((hs) => (
                    <tr key={hs.hostel_id} className="hover:bg-[#171A23]/50 transition-colors">
                      <td className="py-3.5 font-semibold text-gray-200">{hs.hostel_name}</td>
                      <td className="py-3.5 font-mono text-gray-300">{hs.total_active_beds}</td>
                      <td className="py-3.5 font-mono text-teal-300">{hs.available_beds}</td>
                      <td className="py-3.5 font-mono text-gray-300">{hs.predicted_demand}</td>
                      <td className="py-3.5 font-mono text-rose-400">{hs.expected_shortage}</td>
                      <td className="py-3.5">
                        <ShortageRiskBadge riskLevel={hs.risk_level} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INSTITUTIONAL BOTTLENECKS */}
      {activeTab === 'bottlenecks' && (
        <div className="space-y-4">
          {bottlenecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bottlenecks.map((b) => (
                <BottleneckItem key={b.id || b.entity_name} bottleneck={b} />
              ))}
            </div>
          ) : (
            <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-200">Zero Critical Bottlenecks</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                No repeated hard constraints or overused capacity thresholds detected in the current scope.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: WORKLOAD & ANOMALIES */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          {/* Workload Insights */}
          <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Faculty Workload Distribution & Variance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workloads.map((w) => (
                <div key={w.faculty_id} className="p-4 bg-[#0B0D14] rounded-xl border border-[#1E2330]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-200">{w.faculty_name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        w.workload_status === 'OVERLOADED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : w.workload_status === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {w.workload_status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    Assigned: <span className="font-mono text-teal-300 font-bold">{w.assigned_hours} hrs</span> / Max {w.max_hours} hrs
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed border-t border-[#1E2330] pt-2">{w.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Anomalies */}
          <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              Operational System Anomalies (Isolation Forest)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalies.map((a) => (
                <AnomalyCard key={a.id || a.entity_name} anomaly={a} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RECOMMENDATION CENTER */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  AI Recommendation Center
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Synthesized decision-support advisory feed based on predictive models, Phase 30 constraints, and Phase 31 optimization.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onViewDetails={(r) => setSelectedRec(r)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Details Modal */}
      {selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2330] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-gray-200">Recommendation Details</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400 px-2 py-0.5 rounded bg-[#171A23]">
                {selectedRec.priority} PRIORITY
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Target Entity</span>
                <p className="text-sm font-semibold text-teal-300">{selectedRec.entity_name}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Action Suggestion</span>
                <p className="text-xs text-gray-200 bg-[#0B0D14] p-3 rounded-lg border border-[#1E2330] leading-relaxed">
                  {selectedRec.recommendation}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Reasoning Factor</span>
                <p className="text-xs text-gray-400 leading-relaxed">{selectedRec.reason}</p>
              </div>

              {selectedRec.supporting_metrics && (
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Supporting Metrics</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(selectedRec.supporting_metrics).map(([k, v]) => (
                      <div key={k} className="bg-[#0B0D14] p-2 rounded border border-[#1E2330]">
                        <span className="text-gray-400 block text-[10px]">{k}</span>
                        <span className="text-teal-400 font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#1E2330] pt-4 flex justify-end">
              <button
                onClick={() => setSelectedRec(null)}
                className="px-4 py-2 rounded-xl bg-[#171A23] hover:bg-[#202533] text-gray-200 text-xs font-semibold border border-[#262B3B] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
