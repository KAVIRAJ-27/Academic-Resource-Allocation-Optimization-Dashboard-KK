import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout';
import { Layers, Monitor, Users, CheckCircle2, AlertTriangle, Search, RefreshCw, Plus, Calendar } from 'lucide-react';
import { apiClient } from '../../services/api/apiClient';

interface DepartmentResource {
  id: number;
  code: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  features: string[];
  status: 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE';
}

const DEFAULT_RESOURCES: DepartmentResource[] = [
  { id: 101, code: 'LAB-CSE-01', name: 'Advanced Algorithms & AI Computing Lab', type: 'LABORATORY', capacity: 60, location: 'Turing Block, 2nd Floor', features: ['60 RTX 4080 Workstations', 'Gigabit LAN', 'Smart Screen'], status: 'AVAILABLE' },
  { id: 102, code: 'LAB-CSE-02', name: 'Cloud Computing & Networks Laboratory', type: 'LABORATORY', capacity: 60, location: 'Turing Block, 2nd Floor', features: ['Cisco Routers', 'Server Rack Access', 'Dual Displays'], status: 'ALLOCATED' },
  { id: 103, code: 'CR-CSE-301', name: 'Smart Lecture Hall 301', type: 'CLASSROOM', capacity: 75, location: 'Academic Block B, 3rd Floor', features: ['Interactive Projector', 'Acoustic Surround', 'Podium Mic'], status: 'AVAILABLE' },
  { id: 104, code: 'CR-CSE-302', name: 'Smart Lecture Hall 302', type: 'CLASSROOM', capacity: 75, location: 'Academic Block B, 3rd Floor', features: ['4K Projector', 'Lecture Capture System', 'Wi-Fi 6'], status: 'ALLOCATED' },
  { id: 105, code: 'SH-CSE-01', name: 'CSE Department Seminar & Defense Hall', type: 'SEMINAR_HALL', capacity: 150, location: 'Turing Block, Ground Floor', features: ['Dual Stage Projection', '150 Tiered Seats', 'Video Conferencing'], status: 'AVAILABLE' },
  { id: 106, code: 'LAB-CSE-03', name: 'Cybersecurity & Ethical Hacking Pod', type: 'LABORATORY', capacity: 40, location: 'Turing Block, 3rd Floor', features: ['Isolated Testbed VLAN', 'Hardware Security Modules'], status: 'MAINTENANCE' },
];

export const HODResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<DepartmentResource[]>(DEFAULT_RESOURCES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/academic/resources?size=50');
      if (res.data?.data?.content && res.data.data.content.length > 0) {
        const mapped = res.data.data.content.map((r: any, idx: number) => ({
          id: r.id || idx + 100,
          code: r.code || `RES-${idx}`,
          name: r.name || 'Academic Facility',
          type: r.categoryCode || r.type || 'CLASSROOM',
          capacity: r.capacity || 60,
          location: r.location || 'Academic Wing',
          features: ['Smart Display', 'High-Speed Wi-Fi'],
          status: r.status || 'AVAILABLE',
        }));
        setResources(mapped);
      }
    } catch {
      // Fallback kept
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const filtered = resources.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const availableCount = resources.filter((r) => r.status === 'AVAILABLE').length;
  const allocatedCount = resources.filter((r) => r.status === 'ALLOCATED').length;
  const maintenanceCount = resources.filter((r) => r.status === 'MAINTENANCE').length;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Department Assets
              </span>
              <span className="text-xs text-gray-400">• Infrastructure Management</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Department Labs & Learning Facilities</h1>
            <p className="text-sm text-gray-400">
              Departmental classrooms, hardware computing centers, and seminar room allocation statuses.
            </p>
          </div>
          <button
            onClick={fetchResources}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-[#1E2330] text-gray-200 border border-[#262B3A] rounded-xl text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Resources
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Department Resources</span>
              <Layers className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{resources.length}</div>
            <div className="text-xs text-teal-400 mt-1">Dedicated department venues</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Available Now</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{availableCount}</div>
            <div className="text-xs text-emerald-400 mt-1">Ready for scheduled classes</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Allocated in Timetable</span>
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{allocatedCount}</div>
            <div className="text-xs text-indigo-400 mt-1">Active class assignments</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Under Maintenance</span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{maintenanceCount}</div>
            <div className="text-xs text-amber-400 mt-1">Hardware / software servicing</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by facility name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-[#262B3A] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-[#262B3A] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Types</option>
              <option value="CLASSROOM">Classroom</option>
              <option value="LABORATORY">Laboratory</option>
              <option value="SEMINAR_HALL">Seminar Hall</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-[#262B3A] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Resources Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-teal-500/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-teal-400 font-semibold">{r.code}</span>
                  {r.status === 'AVAILABLE' ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Available
                    </span>
                  ) : r.status === 'ALLOCATED' ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Allocated
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Maintenance
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{r.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{r.location}</p>

                <div className="flex items-center gap-4 text-xs text-gray-300 font-mono mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-teal-400" /> {r.capacity} seats
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-50 text-gray-400 border border-slate-200">
                    {r.type}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">Features</span>
                  <div className="flex flex-wrap gap-1">
                    {r.features.map((f, i) => (
                      <span key={i} className="text-[11px] bg-slate-50 text-gray-300 px-2 py-0.5 rounded-md border border-slate-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[11px] text-gray-500">Department Scope</span>
                <button className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors">
                  View Schedule &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
