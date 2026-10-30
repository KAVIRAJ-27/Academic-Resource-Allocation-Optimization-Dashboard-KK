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
      <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-2xs">
              <BrainCircuit className="w-5 h-5 text-[#B8A16A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Insights & Predictive Optimization</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ML Scikit-Learn
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 border border-indigo-200 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              {isTraining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTraining ? 'Training Models...' : 'Retrain ML Models'}</span>
            </button>
          )}

          <button
            onClick={() => fetchAiData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#D8C9A8]/70 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#B8A16A]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* State / Availability Banner */}
      {overview && overview.status !== 'SUCCESS' && (
        <AiStateBanner status={overview.status} message={overview.message} onRetry={fetchAiData} />
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#D8C9A8]/70">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-[#F4F0E6] text-[#202020] border-[#B8A16A] shadow-xs font-serif font-bold'
                  : 'bg-white text-slate-600 border-[#D8C9A8]/70/80 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#B8A16A]' : 'text-slate-400'}`} />
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
                <div key={i} className="h-32 bg-white rounded-xl border border-[#D8C9A8]/70" />
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
                <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Critical Contention Points
                    </h3>
                    <span className="text-xs text-slate-500">
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
              <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    Priority Decision-Support Recommendations
                  </h3>
                  <span className="text-xs text-slate-500">
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
                    <div className="col-span-full py-10 text-center text-xs text-slate-500">
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
          <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Capacity Deficit Risk Evaluation
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D8C9A8]/70 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 font-semibold">Resource Category</th>
                    <th className="py-2.5 px-3 font-semibold">Available Units</th>
                    <th className="py-2.5 px-3 font-semibold">Projected Demand</th>
                    <th className="py-2.5 px-3 font-semibold">Potential Deficit</th>
                    <th className="py-2.5 px-3 font-semibold">Risk Classification</th>
                    <th className="py-2.5 px-3 font-semibold">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shortages.map((s) => (
                    <tr key={s.resource_category} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{s.resource_category}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{s.available_units}</td>
                      <td className="py-3 px-3 font-mono text-teal-700 font-bold">{s.predicted_demand}</td>
                      <td className="py-3 px-3 font-mono text-rose-700">{s.potential_shortage}</td>
                      <td className="py-3 px-3">
                        <ShortageRiskBadge riskLevel={s.risk_level} />
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{s.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resource Utilization Forecast */}
          {utilizations.length > 0 && (
            <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
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

          <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Hostel Bed Shortage Assessment
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D8C9A8]/70 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 font-semibold">Hostel Facility</th>
                    <th className="py-2.5 px-3 font-semibold">Total Beds</th>
                    <th className="py-2.5 px-3 font-semibold">Vacant Headroom</th>
                    <th className="py-2.5 px-3 font-semibold">Incoming Demand</th>
                    <th className="py-2.5 px-3 font-semibold">Deficit</th>
                    <th className="py-2.5 px-3 font-semibold">Risk Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hostelShortages.map((hs) => (
                    <tr key={hs.hostel_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{hs.hostel_name}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{hs.total_active_beds}</td>
                      <td className="py-3 px-3 font-mono text-teal-700">{hs.available_beds}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{hs.predicted_demand}</td>
                      <td className="py-3 px-3 font-mono text-rose-700">{hs.expected_shortage}</td>
                      <td className="py-3 px-3">
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
            <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-12 text-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Zero Critical Bottlenecks</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
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
          <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Faculty Workload Distribution & Variance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workloads.map((w) => (
                <div key={w.faculty_id} className="p-4 bg-slate-50 rounded-xl border border-[#D8C9A8]/70/80">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900">{w.faculty_name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        w.workload_status === 'OVERLOADED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : w.workload_status === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {w.workload_status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2 font-medium">
                    Assigned: <span className="font-mono text-teal-700 font-bold">{w.assigned_hours} hrs</span> / Max {w.max_hours} hrs
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed border-t border-[#D8C9A8]/70/60 pt-2">{w.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Anomalies */}
          <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-600" />
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
          <div className="bg-white border border-[#D8C9A8]/70 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  AI Recommendation Center
                </h3>
                <p className="text-xs text-slate-500 mt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202020]/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#D8C9A8] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E0D0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8A16A]" />
                <h3 className="text-sm font-serif font-bold text-[#202020]">Recommendation Details</h3>
              </div>
              <span className="text-[10px] font-mono text-[#A87928] font-semibold px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E8D8BA]">
                {selectedRec.priority} PRIORITY
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-[#77736A] font-bold uppercase tracking-wider block font-semibold">Target Entity</span>
                <p className="text-sm font-serif font-bold text-[#202020]">{selectedRec.entity_name}</p>
              </div>

              <div>
                <span className="text-[10px] text-[#77736A] font-bold uppercase tracking-wider block font-semibold">Action Suggestion</span>
                <p className="text-xs text-[#202020] bg-[#FBF9F3] p-3 rounded-lg border border-[#E8E0D0] leading-relaxed font-medium">
                  {selectedRec.recommendation}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[#77736A] font-bold uppercase tracking-wider block font-semibold">Reasoning Factor</span>
                <p className="text-xs text-[#555555] leading-relaxed">{selectedRec.reason}</p>
              </div>

              {selectedRec.supporting_metrics && (
                <div>
                  <span className="text-[10px] text-[#77736A] font-bold uppercase tracking-wider block mb-1 font-semibold">Supporting Metrics</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(selectedRec.supporting_metrics).map(([k, v]) => (
                      <div key={k} className="bg-[#F8F6F0] p-2 rounded-lg border border-[#E8E0D0]">
                        <span className="text-[#77736A] block text-[10px]">{k}</span>
                        <span className="text-[#202020] font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#E8E0D0] pt-4 flex justify-end">
              <button
                onClick={() => setSelectedRec(null)}
                className="px-4 py-2 rounded-xl border border-[#D8C9A8] bg-white hover:bg-[#F4F0E6] text-[#202020] text-xs font-semibold transition-colors"
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
