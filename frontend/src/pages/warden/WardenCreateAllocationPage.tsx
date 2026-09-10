import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
} from '../../components/layout';
import {
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
  Building,
  User,
  BedDouble,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertTriangle,
  Search,
  RefreshCw,
  Clock,
  ShieldAlert,
  Sparkles,
  Layers,
  GraduationCap,
  DoorClosed,
  AlertCircle,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { useWardenStudentSearch } from '../../hooks/useWardenStudentSearch';
import { useWardenAllocationMutations } from '../../hooks/useWardenAllocationMutations';
import { wardenApi } from '../../services/api/wardenApi';
import {
  WardenHostelOption,
  WardenStudentSearch,
  WardenBedSummary,
} from '../../types/wardenAllocation';

type Step = 1 | 2 | 3 | 4;

export const WardenCreateAllocationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Selected Hostel
  const { hostels, loading: hostelsLoading } = useWardenHostels();
  const [selectedHostel, setSelectedHostel] = useState<WardenHostelOption | null>(null);

  // Step 2: Selected Student
  const {
    students,
    totalElements: studentTotal,
    loading: studentsLoading,
    searchTerm,
    onSearchChange,
    error: studentError,
  } = useWardenStudentSearch();
  const [selectedStudent, setSelectedStudent] = useState<WardenStudentSearch | null>(null);

  // Step 3: Selected Bed
  const [beds, setBeds] = useState<WardenBedSummary[]>([]);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [bedError, setBedError] = useState<string | null>(null);
  const [selectedBed, setSelectedBed] = useState<WardenBedSummary | null>(null);
  const [bedSearch, setBedSearch] = useState('');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('ALL');

  // Step 4: Schedule Dates
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');
  const [academicYearId, setAcademicYearId] = useState<number | undefined>(undefined);

  // Mutations hook
  const {
    createAllocation,
    submitting,
    error: submitError,
    clearError: clearSubmitError,
  } = useWardenAllocationMutations();

  // Auto-select hostel if only 1 exists
  useEffect(() => {
    if (hostels.length === 1 && !selectedHostel) {
      setSelectedHostel(hostels[0]);
    }
  }, [hostels, selectedHostel]);

  // Load available beds when Step 3 is reached or hostel changes
  useEffect(() => {
    if (currentStep === 3 && selectedHostel) {
      const fetchAvailableBeds = async () => {
        try {
          setBedsLoading(true);
          setBedError(null);
          const res = await wardenApi.getBeds({
            hostelId: selectedHostel.id,
            status: 'AVAILABLE',
            size: 100,
          });
          if (res.success && res.data) {
            setBeds(res.data.content);
          }
        } catch (err: any) {
          setBedError(err?.response?.data?.message || 'Failed to load available beds');
        } finally {
          setBedsLoading(false);
        }
      };
      fetchAvailableBeds();
    }
  }, [currentStep, selectedHostel]);

  // Distinct block names for filter in Step 3
  const availableBlocks = useMemo(() => {
    const set = new Set<string>();
    beds.forEach((b) => {
      if (b.blockName) set.add(b.blockName);
    });
    return Array.from(set).sort();
  }, [beds]);

  // Filtered beds
  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      const matchesBlock = selectedBlockFilter === 'ALL' || b.blockName === selectedBlockFilter;
      const term = bedSearch.trim().toLowerCase();
      const matchesSearch =
        !term ||
        b.bedNumber.toLowerCase().includes(term) ||
        b.roomNumber.toLowerCase().includes(term) ||
        b.blockName.toLowerCase().includes(term);
      return matchesBlock && matchesSearch;
    });
  }, [beds, selectedBlockFilter, bedSearch]);

  // Submission handler
  const handleSubmit = async () => {
    if (!selectedStudent || !selectedBed || !startDate) return;

    clearSubmitError();
    try {
      const result = await createAllocation({
        studentId: selectedStudent.id,
        bedId: selectedBed.id,
        academicYearId,
        startDate,
        endDate: endDate.trim() ? endDate : null,
      });

      if (result) {
        navigate(`/warden/allocations/${result.id}?created=true`);
      }
    } catch (e) {
      // Error handled by hook and displayed in UI
    }
  };

  const stepsList = [
    { num: 1, title: 'Hostel Scope', subtitle: 'Select authorized hostel' },
    { num: 2, title: 'Student Lookup', subtitle: 'Find eligible student' },
    { num: 3, title: 'Bed Matrix', subtitle: 'Pick vacant bed' },
    { num: 4, title: 'Schedule & Commit', subtitle: 'Lock and allocate' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="New Hostel Bed Allocation"
        description="Assign an active, enrolled student to a verified vacant bed in your authorized hostel scope. Real-time concurrency write locks safeguard against double allocation."
        badge={<Badge variant="orange" dot>INTAKE WIZARD</Badge>}
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/warden/allocations')}
          >
            Back to Allocations
          </Button>
        }
      />

      {/* Stepper Bar */}
      <div className="mb-8">
        <div className="bg-[#0D1017] border border-[#1E2330] rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stepsList.map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  disabled={!isDone && !isCurrent}
                  onClick={() => {
                    if (isDone) setCurrentStep(step.num as Step);
                  }}
                  className={`text-left p-3 rounded-xl transition-all border ${
                    isCurrent
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                      : isDone
                      ? 'bg-[#171A23] border-[#1E2330] text-emerald-400 hover:border-gray-600 cursor-pointer'
                      : 'bg-transparent border-transparent text-gray-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                        isCurrent
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                          : isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#1E2330] text-gray-400'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                    </div>
                    <div>
                      <div className="text-xs font-semibold tracking-wide">
                        {step.title}
                      </div>
                      <div className="text-[10px] text-gray-400 hidden sm:block truncate">
                        {step.subtitle}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Items Ribbon (if Step > 1) */}
      {currentStep > 1 && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedHostel && (
            <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-orange-400" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Hostel Scope</div>
                  <div className="text-xs font-semibold text-gray-200">{selectedHostel.name}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] text-gray-400 hover:text-orange-400 px-2 py-0.5 h-auto"
                onClick={() => setCurrentStep(1)}
              >
                Change
              </Button>
            </div>
          )}

          {selectedStudent && currentStep > 2 && (
            <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Candidate Student</div>
                  <div className="text-xs font-semibold text-gray-200">{selectedStudent.name}</div>
                  <div className="text-[10px] font-mono text-orange-400">{selectedStudent.registerNumber}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] text-gray-400 hover:text-blue-400 px-2 py-0.5 h-auto"
                onClick={() => setCurrentStep(2)}
              >
                Change
              </Button>
            </div>
          )}

          {selectedBed && currentStep > 3 && (
            <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BedDouble className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-[10px] uppercase font-mono text-gray-400">Selected Bed Space</div>
                  <div className="text-xs font-semibold text-gray-200">
                    Room {selectedBed.roomNumber} • Bed {selectedBed.bedNumber}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    {selectedBed.blockName} • Floor {selectedBed.floorNumber}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] text-gray-400 hover:text-teal-400 px-2 py-0.5 h-auto"
                onClick={() => setCurrentStep(3)}
              >
                Change
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: HOSTEL SCOPE SELECTION */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <Card className="bg-[#0D1017] border-[#1E2330]">
          <CardHeader>
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <Building className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Step 1 of 4</span>
            </div>
            <CardTitle>Select Authorized Hostel</CardTitle>
            <CardDescription>
              Choose the hostel facility where the student will be assigned. Only hostels explicitly assigned to your warden account are accessible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hostelsLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                Verifying warden jurisdiction and loading authorized hostels...
              </div>
            ) : hostels.length === 0 ? (
              <EmptyState
                title="No authorized hostels assigned"
                description="Your warden account is not assigned to any hostel buildings in the system. Please contact the administrator."
                icon={Building}
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hostels.map((hostel) => {
                    const isSelected = selectedHostel?.id === hostel.id;
                    const occPct =
                      hostel.totalBeds > 0
                        ? Math.round((hostel.occupiedBeds / hostel.totalBeds) * 100)
                        : 0;

                    return (
                      <div
                        key={hostel.id}
                        onClick={() => setSelectedHostel(hostel)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10'
                            : 'bg-[#11141C] border-[#1E2330] hover:border-gray-600 hover:bg-[#151923]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-1">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#171A23] border border-[#1E2330] flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-100">{hostel.name}</h4>
                            <span className="text-[11px] font-mono text-orange-400">
                              {hostel.code} • {hostel.type}
                            </span>
                          </div>
                        </div>

                        {/* Occupancy Stats */}
                        <div className="space-y-2 mt-4 pt-3 border-t border-[#1E2330]">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-gray-400">Available Beds</span>
                            <span className="text-emerald-400 font-bold">
                              {hostel.availableBeds} / {hostel.totalBeds}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500 rounded-full"
                              style={{ width: `${occPct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                            <span>{hostel.totalRooms} Rooms</span>
                            <span>{occPct}% Occupancy</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    disabled={!selectedHostel || selectedHostel.availableBeds <= 0}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => setCurrentStep(2)}
                  >
                    Proceed to Student Lookup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: STUDENT LOOKUP */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <Card className="bg-[#0D1017] border-[#1E2330]">
          <CardHeader>
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <User className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Step 2 of 4</span>
            </div>
            <CardTitle>Search & Select Student</CardTitle>
            <CardDescription>
              Search by student name, register number, or roll number. Students with existing active hostel allocations are highlighted and cannot be assigned concurrently.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, register no (e.g. REG2024...), roll no..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full bg-[#11141C] border border-[#1E2330] rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              {studentsLoading && (
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {studentError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {studentError}
              </div>
            )}

            {/* Students List */}
            {studentsLoading && students.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                Searching student directory...
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center bg-[#11141C] border border-[#1E2330] rounded-xl">
                <GraduationCap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-300">
                  {searchTerm.trim()
                    ? `No students matching "${searchTerm}"`
                    : 'Type a name or register number above to search'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Only enrolled and active students are eligible for hostel residency.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((student) => {
                  const isSelected = selectedStudent?.id === student.id;
                  const hasActive = student.hasActiveAllocation;

                  return (
                    <div
                      key={student.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10'
                          : hasActive
                          ? 'bg-[#11141C]/80 border-[#2A1E24]'
                          : 'bg-[#11141C] border-[#1E2330] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-[#171A23] border border-[#1E2330] text-gray-300'
                            }`}
                          >
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-100 text-sm">
                              {student.name}
                            </div>
                            <div className="text-xs font-mono text-orange-400">
                              {student.registerNumber}
                              {student.rollNumber ? ` • ${student.rollNumber}` : ''}
                            </div>
                          </div>
                        </div>

                        {hasActive ? (
                          <Badge variant="danger" size="sm">
                            OCCUPIED
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            ELIGIBLE
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 space-y-0.5 mt-2 pt-2 border-t border-[#1E2330]">
                        <div>
                          {student.departmentName || 'General'}{' '}
                          {student.programName ? `(${student.programName})` : ''}
                        </div>
                        <div className="text-[11px] font-mono text-gray-500">
                          Semester {student.currentSemester} • Batch {student.admissionYear}
                        </div>
                      </div>

                      {/* Active Allocation Warning */}
                      {hasActive && student.activeAllocation && (
                        <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-[11px] text-rose-300">
                          <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            Active Residency Detected
                          </div>
                          <div className="text-gray-400">
                            {student.activeAllocation.hostelName} • Room {student.activeAllocation.roomNumber} • Bed {student.activeAllocation.bedNumber}
                          </div>
                          <div className="text-[10px] text-rose-400/80 mt-1">
                            Must release current bed before assigning a new allocation.
                          </div>
                        </div>
                      )}

                      {/* Selection Button */}
                      <div className="mt-3 pt-2 flex justify-end">
                        {hasActive ? (
                          <Button variant="outline" size="sm" disabled className="text-xs opacity-50">
                            Cannot Allocate
                          </Button>
                        ) : isSelected ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                          >
                            Selected
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs hover:border-blue-500 hover:text-blue-400"
                            onClick={() => setSelectedStudent(student)}
                          >
                            Select Student
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex justify-between pt-4 border-t border-[#1E2330]">
              <Button
                variant="outline"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(1)}
              >
                Back to Hostel Scope
              </Button>
              <Button
                variant="primary"
                disabled={!selectedStudent || selectedStudent.hasActiveAllocation}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setCurrentStep(3)}
              >
                Proceed to Bed Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: BED MATRIX SELECTION */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <Card className="bg-[#0D1017] border-[#1E2330]">
          <CardHeader>
            <div className="flex items-center gap-2 text-teal-400 mb-1">
              <BedDouble className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Step 3 of 4</span>
            </div>
            <CardTitle>Pick Available Bed in {selectedHostel?.name}</CardTitle>
            <CardDescription>
              Select an available bed space. Concurrency write locks prevent two wardens from allocating the same bed simultaneously.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                <span className="text-xs text-gray-400 font-mono">Block:</span>
                <button
                  type="button"
                  onClick={() => setSelectedBlockFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                    selectedBlockFilter === 'ALL'
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                      : 'bg-[#11141C] text-gray-400 border border-[#1E2330] hover:text-gray-200'
                  }`}
                >
                  All Blocks
                </button>
                {availableBlocks.map((block) => (
                  <button
                    key={block}
                    type="button"
                    onClick={() => setSelectedBlockFilter(block)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                      selectedBlockFilter === block
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                        : 'bg-[#11141C] text-gray-400 border border-[#1E2330] hover:text-gray-200'
                    }`}
                  >
                    {block}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter bed or room no..."
                  value={bedSearch}
                  onChange={(e) => setBedSearch(e.target.value)}
                  className="w-full bg-[#11141C] border border-[#1E2330] rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {bedError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {bedError}
              </div>
            )}

            {/* Beds Grid */}
            {bedsLoading ? (
              <div className="p-12 text-center text-xs text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
                Loading vacant bed registry for {selectedHostel?.name}...
              </div>
            ) : filteredBeds.length === 0 ? (
              <EmptyState
                title="No vacant beds match filter"
                description={
                  beds.length === 0
                    ? `No available beds found in ${selectedHostel?.name}. All rooms may currently be at maximum capacity.`
                    : 'No beds match your block or room search query.'
                }
                icon={BedDouble}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredBeds.map((bed) => {
                  const isSelected = selectedBed?.id === bed.id;

                  return (
                    <div
                      key={bed.id}
                      onClick={() => setSelectedBed(bed)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500'
                          : 'bg-[#11141C] border-[#1E2330] hover:border-gray-600 hover:bg-[#151923]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-teal-500 text-black rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble
                          className={`w-4 h-4 ${
                            isSelected ? 'text-teal-400' : 'text-gray-400'
                          }`}
                        />
                        <span className="font-mono font-bold text-sm text-gray-100">
                          {bed.bedNumber}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="text-gray-300 font-semibold">
                          Room {bed.roomNumber}
                        </div>
                        <div className="text-gray-400 truncate">
                          {bed.blockName}
                        </div>
                        <div className="text-gray-500">
                          Floor {bed.floorNumber}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#1E2330] flex items-center justify-between">
                        <Badge variant="success" size="sm">
                          AVAILABLE
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex justify-between pt-4 border-t border-[#1E2330]">
              <Button
                variant="outline"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(2)}
              >
                Back to Student Selection
              </Button>
              <Button
                variant="primary"
                disabled={!selectedBed}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setCurrentStep(4)}
              >
                Proceed to Schedule & Commit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SCHEDULE & COMMIT */}
      {/* ========================================================================= */}
      {currentStep === 4 && selectedStudent && selectedBed && selectedHostel && (
        <Card className="bg-[#0D1017] border-[#1E2330]">
          <CardHeader>
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wider">Step 4 of 4</span>
            </div>
            <CardTitle>Review & Confirm Allocation</CardTitle>
            <CardDescription>
              Verify residency placement and configure active term dates. Confirming this step executes an atomic transactional write with row-level pessimistic locking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Summary */}
              <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
                  <User className="w-4 h-4 text-blue-400" />
                  Resident Candidate Details
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-bold text-gray-100">{selectedStudent.name}</div>
                    <div className="text-xs font-mono text-orange-400">
                      Reg No: {selectedStudent.registerNumber}
                      {selectedStudent.rollNumber ? ` • Roll: ${selectedStudent.rollNumber}` : ''}
                    </div>
                  </div>
                  <div className="text-xs text-gray-300 pt-2 border-t border-[#1E2330] space-y-1">
                    <div>
                      <span className="text-gray-500">Department:</span> {selectedStudent.departmentName || 'General'}
                    </div>
                    <div>
                      <span className="text-gray-500">Program:</span> {selectedStudent.programName || 'Standard'}
                    </div>
                    <div>
                      <span className="text-gray-500">Semester / Batch:</span> Sem {selectedStudent.currentSemester} • Batch {selectedStudent.admissionYear}
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span> {selectedStudent.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bed & Facility Summary */}
              <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
                  <BedDouble className="w-4 h-4 text-teal-400" />
                  Allocated Bed Space
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-bold text-gray-100">{selectedHostel.name}</div>
                    <div className="text-xs font-mono text-orange-400">{selectedHostel.code} • {selectedHostel.type}</div>
                  </div>
                  <div className="text-xs text-gray-300 pt-2 border-t border-[#1E2330] space-y-1 font-mono">
                    <div>
                      <span className="text-gray-500">Block:</span> {selectedBed.blockName} ({selectedBed.blockCode})
                    </div>
                    <div>
                      <span className="text-gray-500">Floor:</span> Floor {selectedBed.floorNumber} ({selectedBed.floorName})
                    </div>
                    <div>
                      <span className="text-gray-500">Room Number:</span> Room {selectedBed.roomNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">Bed Tag:</span> <span className="text-teal-400 font-bold">{selectedBed.bedNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Form */}
            <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-orange-400" />
                Residency Duration
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Start Date <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-[#0D1017] border border-[#1E2330] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Residency intake date. Effective immediately upon confirmation.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Expected Checkout / End Date <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full bg-[#0D1017] border border-[#1E2330] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Leave blank for open-ended or standard semester tenure.
                  </span>
                </div>
              </div>
            </div>

            {/* Concurrency Guard Notice */}
            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-300 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-0.5">Pessimistic Write Concurrency Protection</div>
                <div className="text-orange-400/80 leading-relaxed">
                  Upon clicking Confirm, the backend locks Bed <strong>{selectedBed.bedNumber}</strong> exclusively (using database-level write locks) while validating student eligibility and hostel room limits. If another warden or intake process claims this space concurrently, the transaction rolls back safely with HTTP 409 Conflict.
                </div>
              </div>
            </div>

            {/* Submit Error Banner */}
            {submitError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Allocation Transaction Failed</div>
                  <div className="text-rose-400/90 leading-relaxed">{submitError}</div>
                  <div className="text-[11px] text-gray-400 pt-1">
                    Please select a different available bed or verify student eligibility.
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-[#1E2330]">
              <Button
                variant="outline"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep(3)}
                disabled={submitting}
              >
                Back to Bed Selection
              </Button>

              <Button
                variant="primary"
                size="md"
                disabled={submitting || !startDate}
                onClick={handleSubmit}
                leftIcon={
                  submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
              >
                {submitting ? 'Acquiring Lock & Committing...' : 'Confirm & Allocate Bed'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
};
