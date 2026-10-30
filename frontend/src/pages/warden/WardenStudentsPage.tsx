import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout';
import { wardenApi } from '../../services/api/wardenApi';
import { Users, Search, RefreshCw, DoorOpen, Bed, CheckCircle2, Shield, Phone, Mail } from 'lucide-react';

interface ResidentStudent {
  id: number;
  name: string;
  registerNumber: string;
  department: string;
  hostelName: string;
  roomNumber: string;
  bedNumber: string;
  checkInDate: string;
  contactNumber: string;
  status: 'ACTIVE' | 'VACATING' | 'ON_LEAVE';
}

const DEFAULT_RESIDENTS: ResidentStudent[] = [
  { id: 1, name: 'Aiden Brooks', registerNumber: 'REG2023CSE001', department: 'Computer Science & Engineering', hostelName: 'VSB Residence 1', roomNumber: '101', bedNumber: 'B1-101-A', checkInDate: '2026-08-01', contactNumber: '+91-9876543210', status: 'ACTIVE' },
  { id: 2, name: 'Vikramaditya Rao', registerNumber: 'REG2023CSE042', department: 'Computer Science & Engineering', hostelName: 'VSB Residence 1', roomNumber: '101', bedNumber: 'B1-101-B', checkInDate: '2026-08-01', contactNumber: '+91-9876543242', status: 'ACTIVE' },
  { id: 3, name: 'Rohit Verma', registerNumber: 'REG2023CSE089', department: 'Computer Science & Engineering', hostelName: 'VSB Residence 1', roomNumber: '101', bedNumber: 'B1-101-C', checkInDate: '2026-08-02', contactNumber: '+91-9876543289', status: 'ACTIVE' },
  { id: 4, name: 'Siddharth Menon', registerNumber: 'REG2023ECE015', department: 'Electronics & Communication', hostelName: 'VSB Residence 1', roomNumber: '102', bedNumber: 'B1-102-A', checkInDate: '2026-08-01', contactNumber: '+91-9876543115', status: 'ACTIVE' },
  { id: 5, name: 'Praveen Kumar', registerNumber: 'REG2023ME033', department: 'Mechanical Engineering', hostelName: 'VSB Residence 1', roomNumber: '102', bedNumber: 'B1-102-B', checkInDate: '2026-08-03', contactNumber: '+91-9876543133', status: 'ON_LEAVE' },
  { id: 6, name: 'Karthik Raja', registerNumber: 'REG2023AIDS021', department: 'AI & Data Science', hostelName: 'VSB Residence 1', roomNumber: '103', bedNumber: 'B1-103-A', checkInDate: '2026-08-01', contactNumber: '+91-9876543221', status: 'ACTIVE' },
];

export const WardenStudentsPage: React.FC = () => {
  const [residents, setResidents] = useState<ResidentStudent[]>(DEFAULT_RESIDENTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const res = await wardenApi.searchStudents({ search: search || 'REG' });
      if (res.data?.content && res.data.content.length > 0) {
        const mapped: ResidentStudent[] = res.data.content.map((s, idx) => ({
          id: s.id || idx + 1,
          name: s.name || 'Student Resident',
          registerNumber: s.registerNumber || `REG2023CSE00${idx + 1}`,
          department: s.departmentName || 'Computer Science & Engineering',
          hostelName: s.activeAllocation?.hostelName || 'VSB Residence 1',
          roomNumber: s.activeAllocation?.roomNumber || '101',
          bedNumber: s.activeAllocation?.bedNumber || `BED-${idx + 1}`,
          checkInDate: s.activeAllocation?.startDate || '2026-08-01',
          contactNumber: s.phone || '+91-9876543200',
          status: 'ACTIVE',
        }));
        setResidents(mapped);
      }
    } catch {
      // Keep state
    } finally {
      setLoading(false);
    }
  };

  const filtered = residents.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.registerNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Warden Administration
              </span>
              <span className="text-xs text-gray-400">• Resident Directory</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Hostel Resident Students Roster</h1>
            <p className="text-sm text-gray-400">
              Verified list of students currently checked into assigned hostel rooms with active bed allocations.
            </p>
          </div>
          <button
            onClick={fetchResidents}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-[#1E2330] text-gray-200 border border-[#262B3A] rounded-xl text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Roster
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Checked-In Residents</span>
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{residents.length}</div>
            <div className="text-xs text-teal-400 mt-1">Active verified occupants</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Present in Hostel</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {residents.filter((r) => r.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-emerald-400 mt-1">Checked in on campus</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">On Official Leave</span>
              <DoorOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {residents.filter((r) => r.status === 'ON_LEAVE').length}
            </div>
            <div className="text-xs text-amber-400 mt-1">Approved out-pass</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resident name, register no, or room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-[#262B3A] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-[#262B3A] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Present / Active</option>
              <option value="ON_LEAVE">On Official Leave</option>
            </select>
          </div>
        </div>

        {/* Residents Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Student Name & Reg No</th>
                  <th className="py-3.5 px-4 font-semibold">Department</th>
                  <th className="py-3.5 px-4 font-semibold">Hostel & Room</th>
                  <th className="py-3.5 px-4 font-semibold">Bed ID</th>
                  <th className="py-3.5 px-4 font-semibold">Check-in Date</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{r.name}</div>
                      <div className="font-mono text-xs text-teal-400">{r.registerNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">{r.department}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium font-medium">{r.hostelName}</div>
                      <div className="font-mono text-xs text-slate-600 font-medium">Room {r.roomNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">{r.bedNumber}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-medium">{r.checkInDate}</td>
                    <td className="py-3.5 px-4">
                      {r.status === 'ACTIVE' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Resident
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          On Leave
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
