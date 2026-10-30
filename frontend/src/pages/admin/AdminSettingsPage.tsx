import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Settings, Sliders, Clock, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminSettingsPage: React.FC = () => {
  const [platformName, setPlatformName] = useState('AHRAO Institutional Enterprise');
  const [academicTerm, setAcademicTerm] = useState('2026-2027');
  const [curfewTime, setCurfewTime] = useState('21:30');
  const [maxHours, setMaxHours] = useState('4');
  const [capacityWeight, setCapacityWeight] = useState(30);
  const [deptWeight, setDeptWeight] = useState(25);
  const [facilityWeight, setFacilityWeight] = useState(25);
  const [utilizationWeight, setUtilizationWeight] = useState(20);
  const [saved, setSaved] = useState(false);

  const totalWeight = capacityWeight + deptWeight + facilityWeight + utilizationWeight;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setCapacityWeight(30);
    setDeptWeight(25);
    setFacilityWeight(25);
    setUtilizationWeight(20);
  };

  return (
    <PageContainer>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#F4F0E6] text-[#202020] border border-[#D8C9A8]">
                System Administration
              </span>
              <span className="text-xs text-[#77736A] font-mono">• Configuration & Policies</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#202020] mt-1.5 sm:text-3xl tracking-tight">
              Global System Settings & Allocation Rules
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] mt-1 font-normal">
              Configure institutional calendar, curfew restrictions, and multi-factor heuristic allocation weights.
            </p>
          </div>
          {saved && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EEF6F1] border border-[#C1DFCD] text-[#3F7655] text-xs font-semibold animate-pulse shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#3F7655]" /> Settings Saved to Database
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Institutional Parameters */}
          <div className="bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 rounded-2xl p-6 space-y-4 shadow-glass">
            <div className="flex items-center gap-2.5 text-[#202020] font-serif font-bold text-base border-b border-[#E8E0D0]/80 pb-3">
              <Settings className="w-5 h-5 text-[#B8A16A]" />
              <span>Campus Operational Parameters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#202020] mb-1.5">
                  Platform Organization Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full bg-white/80 backdrop-blur-xs border border-[#D8C9A8]/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 focus:bg-white shadow-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#202020] mb-1.5">
                  Active Academic Term
                </label>
                <input
                  type="text"
                  value={academicTerm}
                  onChange={(e) => setAcademicTerm(e.target.value)}
                  className="w-full bg-white/80 backdrop-blur-xs border border-[#D8C9A8]/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 focus:bg-white shadow-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#202020] mb-1.5">
                  Hostel Curfew Cutoff Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 w-4 h-4 text-[#77736A]" />
                  <input
                    type="time"
                    value={curfewTime}
                    onChange={(e) => setCurfewTime(e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-xs border border-[#D8C9A8]/70 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 focus:bg-white shadow-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#202020] mb-1.5">
                  Max Consecutive Booking Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={maxHours}
                  onChange={(e) => setMaxHours(e.target.value)}
                  className="w-full bg-white/80 backdrop-blur-xs border border-[#D8C9A8]/70 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#202020] font-medium focus:outline-none focus:border-[#B8A16A] focus:ring-2 focus:ring-[#B8A16A]/20 focus:bg-white shadow-xs transition-all"
                />
              </div>
            </div>
          </div>

          {/* Heuristic Allocation Engine Weights */}
          <div className="bg-white/80 backdrop-blur-md border border-[#D8C9A8]/70 rounded-2xl p-6 space-y-5 shadow-glass">
            <div className="flex items-center justify-between border-b border-[#E8E0D0]/80 pb-3">
              <div className="flex items-center gap-2.5 text-[#202020] font-serif font-bold text-base">
                <Sliders className="w-5 h-5 text-[#B8A16A]" />
                <span>Heuristic Allocation Scoring Weights (Phase 31 Engine)</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                    totalWeight === 100
                      ? 'bg-[#EEF6F1] text-[#3F7655] border border-[#C1DFCD]'
                      : 'bg-[#FDF0F0] text-[#B44747] border border-[#ECC6C6]'
                  }`}
                >
                  Total: {totalWeight}%
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#77736A] hover:text-[#202020] font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-[#F4F0E6]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                </button>
              </div>
            </div>

            <p className="text-xs text-[#555555] font-normal leading-relaxed">
              These weights calibrate the multi-factor candidate scoring algorithm when automatically resolving classroom,
              laboratory, and residential allocations.
            </p>

            <div className="space-y-4 pt-1">
              {/* Capacity Weight */}
              <div>
                <div className="flex justify-between text-xs text-[#202020] font-bold mb-1">
                  <span>1. Capacity Fit Score (Seat Waste Minimization)</span>
                  <span className="font-mono text-[#3F7655] font-bold">{capacityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={capacityWeight}
                  onChange={(e) => setCapacityWeight(Number(e.target.value))}
                  className="w-full accent-[#B8A16A] cursor-pointer"
                />
              </div>

              {/* Department Priority */}
              <div>
                <div className="flex justify-between text-xs text-[#202020] font-bold mb-1">
                  <span>2. Department Priority (Home Department Resource Match)</span>
                  <span className="font-mono text-[#B8A16A] font-bold">{deptWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={deptWeight}
                  onChange={(e) => setDeptWeight(Number(e.target.value))}
                  className="w-full accent-[#B8A16A] cursor-pointer"
                />
              </div>

              {/* Facility Match */}
              <div>
                <div className="flex justify-between text-xs text-[#202020] font-bold mb-1">
                  <span>3. Facility & Equipment Match (Smart Board, Hardware Pods)</span>
                  <span className="font-mono text-[#657C91] font-bold">{facilityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={facilityWeight}
                  onChange={(e) => setFacilityWeight(Number(e.target.value))}
                  className="w-full accent-[#B8A16A] cursor-pointer"
                />
              </div>

              {/* Utilization Balance */}
              <div>
                <div className="flex justify-between text-xs text-[#202020] font-bold mb-1">
                  <span>4. Utilization Balance (Even Campus Load Distribution)</span>
                  <span className="font-mono text-[#A87928] font-bold">{utilizationWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={utilizationWeight}
                  onChange={(e) => setUtilizationWeight(Number(e.target.value))}
                  className="w-full accent-[#B8A16A] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
