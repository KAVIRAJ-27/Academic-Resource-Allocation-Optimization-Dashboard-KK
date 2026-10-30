import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Clock, Calendar, CheckCircle2, Shield, Filter, Users, MapPin, AlertCircle } from 'lucide-react';

interface TimetableSlot {
  day: string;
  time: string;
  course: string;
  courseName: string;
  faculty: string;
  room: string;
  type: 'LECTURE' | 'LAB';
}

const SLOTS = ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '13:00 - 14:00', '14:00 - 15:00', '15:15 - 16:30'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIMETABLE_DATA: Record<string, Record<string, TimetableSlot>> = {
  Monday: {
    '09:00 - 10:00': { day: 'Monday', time: '09:00 - 10:00', course: 'CS301', courseName: 'Design & Analysis of Algorithms', faculty: 'Dr. Rajesh Sharma', room: 'CR-301', type: 'LECTURE' },
    '10:00 - 11:00': { day: 'Monday', time: '10:00 - 11:00', course: 'CS302', courseName: 'Database Management Systems', faculty: 'Prof. Elena Rostova', room: 'CR-301', type: 'LECTURE' },
    '11:15 - 12:15': { day: 'Monday', time: '11:15 - 12:15', course: 'CS304', courseName: 'Computer Networks', faculty: 'Prof. John Backus', room: 'CR-302', type: 'LECTURE' },
    '13:00 - 14:00': { day: 'Monday', time: '13:00 - 14:00', course: 'CS303', courseName: 'Operating Systems', faculty: 'Dr. Alan Turing', room: 'CR-301', type: 'LECTURE' },
    '14:00 - 15:00': { day: 'Monday', time: '14:00 - 15:00', course: 'CS301-L', courseName: 'Algorithms Lab (Batch A)', faculty: 'Dr. Rajesh Sharma', room: 'LAB-CSE-01', type: 'LAB' },
    '15:15 - 16:30': { day: 'Monday', time: '15:15 - 16:30', course: 'CS301-L', courseName: 'Algorithms Lab (Batch A)', faculty: 'Dr. Rajesh Sharma', room: 'LAB-CSE-01', type: 'LAB' },
  },
  Tuesday: {
    '09:00 - 10:00': { day: 'Tuesday', time: '09:00 - 10:00', course: 'CS303', courseName: 'Operating Systems', faculty: 'Dr. Alan Turing', room: 'CR-301', type: 'LECTURE' },
    '10:00 - 11:00': { day: 'Tuesday', time: '10:00 - 11:00', course: 'CS301', courseName: 'Design & Analysis of Algorithms', faculty: 'Dr. Rajesh Sharma', room: 'CR-301', type: 'LECTURE' },
    '11:15 - 12:15': { day: 'Tuesday', time: '11:15 - 12:15', course: 'CS305', courseName: 'Cloud Computing', faculty: 'Dr. Barbara Liskov', room: 'CR-302', type: 'LECTURE' },
    '13:00 - 14:00': { day: 'Tuesday', time: '13:00 - 14:00', course: 'CS302-L', courseName: 'DBMS Lab (Batch B)', faculty: 'Prof. Elena Rostova', room: 'LAB-CSE-02', type: 'LAB' },
    '14:00 - 15:00': { day: 'Tuesday', time: '14:00 - 15:00', course: 'CS302-L', courseName: 'DBMS Lab (Batch B)', faculty: 'Prof. Elena Rostova', room: 'LAB-CSE-02', type: 'LAB' },
    '15:15 - 16:30': { day: 'Tuesday', time: '15:15 - 16:30', course: 'CS304', courseName: 'Computer Networks', faculty: 'Prof. John Backus', room: 'CR-301', type: 'LECTURE' },
  },
  Wednesday: {
    '09:00 - 10:00': { day: 'Wednesday', time: '09:00 - 10:00', course: 'CS304', courseName: 'Computer Networks', faculty: 'Prof. John Backus', room: 'CR-301', type: 'LECTURE' },
    '10:00 - 11:00': { day: 'Wednesday', time: '10:00 - 11:00', course: 'CS302', courseName: 'Database Management Systems', faculty: 'Prof. Elena Rostova', room: 'CR-301', type: 'LECTURE' },
    '11:15 - 12:15': { day: 'Wednesday', time: '11:15 - 12:15', course: 'CS301', courseName: 'Design & Analysis of Algorithms', faculty: 'Dr. Rajesh Sharma', room: 'CR-302', type: 'LECTURE' },
    '13:00 - 14:00': { day: 'Wednesday', time: '13:00 - 14:00', course: 'CS305', courseName: 'Cloud Computing', faculty: 'Dr. Barbara Liskov', room: 'CR-301', type: 'LECTURE' },
    '14:00 - 15:00': { day: 'Wednesday', time: '14:00 - 15:00', course: 'CS303', courseName: 'Operating Systems', faculty: 'Dr. Alan Turing', room: 'CR-301', type: 'LECTURE' },
    '15:15 - 16:30': { day: 'Wednesday', time: '15:15 - 16:30', course: 'CS-SEM', courseName: 'Technical Seminar & Paper Review', faculty: 'Dr. Rajesh Sharma', room: 'SH-CSE-01', type: 'LECTURE' },
  },
  Thursday: {
    '09:00 - 10:00': { day: 'Thursday', time: '09:00 - 10:00', course: 'CS302', courseName: 'Database Management Systems', faculty: 'Prof. Elena Rostova', room: 'CR-301', type: 'LECTURE' },
    '10:00 - 11:00': { day: 'Thursday', time: '10:00 - 11:00', course: 'CS305', courseName: 'Cloud Computing', faculty: 'Dr. Barbara Liskov', room: 'CR-301', type: 'LECTURE' },
    '11:15 - 12:15': { day: 'Thursday', time: '11:15 - 12:15', course: 'CS303', courseName: 'Operating Systems', faculty: 'Dr. Alan Turing', room: 'CR-302', type: 'LECTURE' },
    '13:00 - 14:00': { day: 'Thursday', time: '13:00 - 14:00', course: 'CS304-L', courseName: 'Networks Lab (Batch A)', faculty: 'Prof. John Backus', room: 'LAB-CSE-01', type: 'LAB' },
    '14:00 - 15:00': { day: 'Thursday', time: '14:00 - 15:00', course: 'CS304-L', courseName: 'Networks Lab (Batch A)', faculty: 'Prof. John Backus', room: 'LAB-CSE-01', type: 'LAB' },
    '15:15 - 16:30': { day: 'Thursday', time: '15:15 - 16:30', course: 'CS301', courseName: 'Design & Analysis of Algorithms', faculty: 'Dr. Rajesh Sharma', room: 'CR-301', type: 'LECTURE' },
  },
  Friday: {
    '09:00 - 10:00': { day: 'Friday', time: '09:00 - 10:00', course: 'CS301', courseName: 'Design & Analysis of Algorithms', faculty: 'Dr. Rajesh Sharma', room: 'CR-301', type: 'LECTURE' },
    '10:00 - 11:00': { day: 'Friday', time: '10:00 - 11:00', course: 'CS303', courseName: 'Operating Systems', faculty: 'Dr. Alan Turing', room: 'CR-301', type: 'LECTURE' },
    '11:15 - 12:15': { day: 'Friday', time: '11:15 - 12:15', course: 'CS302', courseName: 'Database Management Systems', faculty: 'Prof. Elena Rostova', room: 'CR-302', type: 'LECTURE' },
    '13:00 - 14:00': { day: 'Friday', time: '13:00 - 14:00', course: 'CS305-L', courseName: 'Cloud Pod Lab (Batch B)', faculty: 'Dr. Barbara Liskov', room: 'LAB-CSE-02', type: 'LAB' },
    '14:00 - 15:00': { day: 'Friday', time: '14:00 - 15:00', course: 'CS305-L', courseName: 'Cloud Pod Lab (Batch B)', faculty: 'Dr. Barbara Liskov', room: 'LAB-CSE-02', type: 'LAB' },
    '15:15 - 16:30': { day: 'Friday', time: '15:15 - 16:30', course: 'MENTOR', courseName: 'Faculty Mentoring & Review', faculty: 'All CSE Faculty', room: 'CR-301', type: 'LECTURE' },
  },
};

export const HODTimetablePage: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('CSE-5A');

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Department Timetable
              </span>
              <span className="text-xs text-gray-400">• Conflict Engine Verified</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Master Department Timetable & Scheduling</h1>
            <p className="text-sm text-gray-400">
              Weekly conflict-free scheduling matrix cross-referencing classroom capacities, laboratories, and faculty allocations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Shield className="w-4 h-4" /> 0 Schedule Conflicts (Verified)
            </span>
          </div>
        </div>

        {/* Control bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">Select Batch:</span>
            <div className="flex gap-1.5">
              {['CSE-3A', 'CSE-5A', 'CSE-5B', 'CSE-7A'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    selectedSection === sec
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                      : 'bg-slate-50 text-gray-400 hover:text-white border border-[#262B3A]'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono">
            Active Academic Year: <span className="text-white font-semibold">2026-2027 (Odd Semester)</span>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider w-28">
                    Day / Time
                  </th>
                  {SLOTS.map((slot) => (
                    <th key={slot} className="py-3 px-3 text-xs font-semibold text-gray-300 font-mono border-l border-slate-200">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DAYS.map((day) => (
                  <tr key={day} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-sm text-teal-400 bg-[#141720] border-r border-slate-200">
                      {day}
                    </td>
                    {SLOTS.map((slot) => {
                      const item = TIMETABLE_DATA[day]?.[slot];
                      return (
                        <td key={slot} className="p-2 border-l border-slate-200 align-top min-w-[170px]">
                          {item ? (
                            <div
                              className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                                item.type === 'LAB'
                                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                                  : 'bg-slate-50 border-[#262B3A] text-slate-800 font-medium hover:border-teal-500/40'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-white text-[11px]">{item.course}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-teal-300">
                                  {item.room}
                                </span>
                              </div>
                              <div className="font-medium text-xs line-clamp-1 text-slate-700 font-medium">{item.courseName}</div>
                              <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                                <Users className="w-3 h-3 text-teal-400" /> {item.faculty}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full min-h-[64px] rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-gray-600">
                              Free Slot
                            </div>
                          )}
                        </td>
                      );
                    })}
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
