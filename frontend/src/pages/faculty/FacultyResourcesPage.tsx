import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout';
import { Layers, Monitor, Users, CheckCircle2, Search, ArrowRight, Shield, Sparkles } from 'lucide-react';

interface FacultyResourceCard {
  id: number;
  code: string;
  name: string;
  category: 'CLASSROOM' | 'LABORATORY' | 'SEMINAR_HALL';
  capacity: number;
  building: string;
  floor: string;
  equipment: string[];
  status: 'AVAILABLE' | 'OCCUPIED';
  nextAvailable: string;
}

const FACULTY_RESOURCES: FacultyResourceCard[] = [
  { id: 1, code: 'CR-301', name: 'Smart Lecture Hall 301', category: 'CLASSROOM', capacity: 75, building: 'Academic Block B', floor: '3rd Floor', equipment: ['4K Interactive Display', 'Lecture Capture System', 'Podium Mic'], status: 'AVAILABLE', nextAvailable: 'Immediate' },
  { id: 2, code: 'CR-302', name: 'Smart Lecture Hall 302', category: 'CLASSROOM', capacity: 75, building: 'Academic Block B', floor: '3rd Floor', equipment: ['Smart Projector', 'Acoustic Sound', 'Wi-Fi 6'], status: 'AVAILABLE', nextAvailable: 'Immediate' },
  { id: 3, code: 'LAB-CSE-01', name: 'AI & Data Science Computing Lab', category: 'LABORATORY', capacity: 60, building: 'Turing Block', floor: '2nd Floor', equipment: ['60 NVIDIA GPUs', 'Dual Displays', 'Gigabit Ethernet'], status: 'AVAILABLE', nextAvailable: 'Immediate' },
  { id: 4, code: 'LAB-CSE-02', name: 'Cloud & Network Systems Lab', category: 'LABORATORY', capacity: 60, building: 'Turing Block', floor: '2nd Floor', equipment: ['Cisco Hardware Racks', 'Virtualization Nodes'], status: 'AVAILABLE', nextAvailable: 'Immediate' },
  { id: 5, code: 'SH-01', name: 'Main Campus Auditorium & Seminar Hall', category: 'SEMINAR_HALL', capacity: 250, building: 'Central Block', floor: 'Ground Floor', equipment: ['Stage Audio Array', 'Dual 4K Laser Projectors', 'Wireless Mics'], status: 'AVAILABLE', nextAvailable: 'Immediate' },
  { id: 6, code: 'CR-204', name: 'Multimedia Classroom 204', category: 'CLASSROOM', capacity: 60, building: 'Academic Block A', floor: '2nd Floor', equipment: ['Digital Smart Board', 'Ceiling Speakers'], status: 'AVAILABLE', nextAvailable: 'Immediate' },
];

export const FacultyResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = FACULTY_RESOURCES.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Faculty Portal
              </span>
              <span className="text-xs text-gray-400">• Resource Booking</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Available Academic Resources & Venues</h1>
            <p className="text-sm text-gray-400">
              Browse institution classrooms, computing laboratories, and auditoriums to request booking slots.
            </p>
          </div>

          <button
            onClick={() => navigate('/faculty/resource-requests/new')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
          >
            <Sparkles className="w-4 h-4" /> New Booking Request
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by venue name, code, or block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-[#262B3A] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-[#262B3A] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Categories</option>
              <option value="CLASSROOM">Classroom</option>
              <option value="LABORATORY">Laboratory</option>
              <option value="SEMINAR_HALL">Seminar Hall</option>
            </select>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-teal-500/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-teal-400">{r.code}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Available Now
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-teal-300 transition-colors">
                  {r.name}
                </h3>
                <p className="text-xs text-gray-400 mb-3">{r.building} • {r.floor}</p>

                <div className="flex items-center gap-3 text-xs text-gray-300 font-mono mb-4">
                  <span className="flex items-center gap-1 text-teal-400 font-semibold">
                    <Users className="w-3.5 h-3.5" /> {r.capacity} Capacity
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-50 text-gray-400 border border-slate-200">
                    {r.category}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider block">
                    Installed Amenities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {r.equipment.map((eq, idx) => (
                      <span key={idx} className="text-[11px] bg-slate-50 text-gray-300 px-2 py-0.5 rounded-md border border-slate-200">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">Next: {r.nextAvailable}</span>
                <button
                  onClick={() => navigate('/faculty/resource-requests/new')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all"
                >
                  Book Slot <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
