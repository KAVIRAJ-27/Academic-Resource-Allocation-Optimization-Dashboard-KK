import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout';
import { BookOpen, Monitor, Users, CheckCircle2, Search, ArrowRight, Shield, Clock } from 'lucide-react';

interface StudentResourceItem {
  id: number;
  code: string;
  name: string;
  category: string;
  capacity: number;
  location: string;
  facilities: string[];
  openHours: string;
  status: 'AVAILABLE' | 'HIGH_DEMAND' | 'RESERVED';
}

const STUDENT_RESOURCES: StudentResourceItem[] = [
  { id: 1, code: 'LIB-DESK-01', name: 'Digital Library Quiet Study Pods', category: 'Study Desk', capacity: 40, location: 'Central Library, 2nd Floor', facilities: ['Power Sockets', 'Wi-Fi 6', 'Reading Lamp', 'AC'], openHours: '08:00 - 22:00', status: 'AVAILABLE' },
  { id: 2, code: 'COMP-CTR-01', name: 'Central Computing Terminal Cluster', category: 'Computing Lab', capacity: 120, location: 'Information Hub, 1st Floor', facilities: ['Linux & Windows Dual Boot', 'Dev Tools', 'Network Access'], openHours: '08:30 - 20:30', status: 'AVAILABLE' },
  { id: 3, code: 'GDR-01', name: 'Collaborative Group Discussion Room 1', category: 'Group Study', capacity: 10, location: 'Central Library, Ground Floor', facilities: ['Smart Whiteboard', 'HDMI TV Cast', 'Conference Table'], openHours: '09:00 - 18:00', status: 'HIGH_DEMAND' },
  { id: 4, code: 'PROJ-POD-02', name: 'Student Project & Hardware Prototyping Pod', category: 'Project Lab', capacity: 15, location: 'Turing Block, Ground Floor', facilities: ['Oscilloscopes', 'Soldering Stations', 'Arduino / RPi Kits'], openHours: '09:00 - 19:00', status: 'AVAILABLE' },
  { id: 5, code: 'LANG-LAB-01', name: 'Multimedia Language & Communication Lab', category: 'Media Lab', capacity: 35, location: 'Humanities Wing, 2nd Floor', facilities: ['Noise-Canceling Headsets', 'Recording Software'], openHours: '09:00 - 17:00', status: 'AVAILABLE' },
];

export const StudentResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = STUDENT_RESOURCES.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Student Learning Resources
              </span>
              <span className="text-xs text-gray-400">• Campus Self-Study Assets</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Campus Academic & Study Resources</h1>
            <p className="text-sm text-gray-400">
              Browse study pods, computer center terminals, and collaboration rooms open for student reservation.
            </p>
          </div>

          <button
            onClick={() => navigate('/student/requests/new')}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-500/20"
          >
            Submit Resource Request
          </button>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search library desks, computing labs, project pods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-[#262B3A] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Resources Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-teal-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-teal-400">{r.code}</span>
                  {r.status === 'AVAILABLE' ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Open Access
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      High Demand
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-1">{r.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{r.location}</p>

                <div className="flex items-center gap-3 text-xs text-gray-300 font-mono mb-3">
                  <span className="flex items-center gap-1 text-teal-400">
                    <Users className="w-3.5 h-3.5" /> {r.capacity} Capacity
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {r.openHours}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <span className="text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider block">
                    Available Facilities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {r.facilities.map((f, i) => (
                      <span key={i} className="text-[11px] bg-slate-50 text-gray-300 px-2 py-0.5 rounded-md border border-slate-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-gray-500">{r.category}</span>
                <button
                  onClick={() => navigate('/student/requests/new')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all"
                >
                  Request Slot <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
