import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Clock, Calendar, MapPin, Users, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

interface StudentScheduleSlot {
  time: string;
  courseCode: string;
  courseName: string;
  room: string;
  faculty: string;
  type: 'LECTURE' | 'LAB';
}

const SCHEDULE: Record<string, StudentScheduleSlot[]> = {
  Monday: [
    { time: '09:00 - 10:00', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', room: 'CR-301', faculty: 'Dr. Rajesh Sharma', type: 'LECTURE' },
    { time: '10:00 - 11:00', courseCode: 'CS302', courseName: 'Database Management Systems', room: 'CR-301', faculty: 'Prof. Elena Rostova', type: 'LECTURE' },
    { time: '11:15 - 12:15', courseCode: 'CS304', courseName: 'Computer Networks', room: 'CR-302', faculty: 'Prof. John Backus', type: 'LECTURE' },
    { time: '14:00 - 16:30', courseCode: 'CS301-L', courseName: 'Algorithms Laboratory (Batch A)', room: 'LAB-CSE-01', faculty: 'Dr. Rajesh Sharma', type: 'LAB' },
  ],
  Tuesday: [
    { time: '09:00 - 10:00', courseCode: 'CS303', courseName: 'Operating Systems', room: 'CR-301', faculty: 'Dr. Alan Turing', type: 'LECTURE' },
    { time: '10:00 - 11:00', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', room: 'CR-301', faculty: 'Dr. Rajesh Sharma', type: 'LECTURE' },
    { time: '11:15 - 12:15', courseCode: 'CS305', courseName: 'Cloud Computing & Distributed Systems', room: 'CR-302', faculty: 'Dr. Barbara Liskov', type: 'LECTURE' },
    { time: '13:00 - 15:00', courseCode: 'CS302-L', courseName: 'DBMS Laboratory (Batch A)', room: 'LAB-CSE-02', faculty: 'Prof. Elena Rostova', type: 'LAB' },
  ],
  Wednesday: [
    { time: '09:00 - 10:00', courseCode: 'CS304', courseName: 'Computer Networks', room: 'CR-301', faculty: 'Prof. John Backus', type: 'LECTURE' },
    { time: '10:00 - 11:00', courseCode: 'CS302', courseName: 'Database Management Systems', room: 'CR-301', faculty: 'Prof. Elena Rostova', type: 'LECTURE' },
    { time: '11:15 - 12:15', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', room: 'CR-302', faculty: 'Dr. Rajesh Sharma', type: 'LECTURE' },
    { time: '15:15 - 16:30', courseCode: 'CS-SEM', courseName: 'Technical Seminar & Paper Presentation', room: 'SH-CSE-01', faculty: 'Dr. Rajesh Sharma', type: 'LECTURE' },
  ],
  Thursday: [
    { time: '09:00 - 10:00', courseCode: 'CS302', courseName: 'Database Management Systems', room: 'CR-301', faculty: 'Prof. Elena Rostova', type: 'LECTURE' },
    { time: '10:00 - 11:00', courseCode: 'CS305', courseName: 'Cloud Computing & Distributed Systems', room: 'CR-301', faculty: 'Dr. Barbara Liskov', type: 'LECTURE' },
    { time: '11:15 - 12:15', courseCode: 'CS303', courseName: 'Operating Systems', room: 'CR-302', faculty: 'Dr. Alan Turing', type: 'LECTURE' },
    { time: '13:00 - 15:00', courseCode: 'CS304-L', courseName: 'Computer Networks Laboratory', room: 'LAB-CSE-01', faculty: 'Prof. John Backus', type: 'LAB' },
  ],
  Friday: [
    { time: '09:00 - 10:00', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', room: 'CR-301', faculty: 'Dr. Rajesh Sharma', type: 'LECTURE' },
    { time: '10:00 - 11:00', courseCode: 'CS303', courseName: 'Operating Systems', room: 'CR-301', faculty: 'Dr. Alan Turing', type: 'LECTURE' },
    { time: '11:15 - 12:15', courseCode: 'CS302', courseName: 'Database Management Systems', room: 'CR-302', faculty: 'Prof. Elena Rostova', type: 'LECTURE' },
    { time: '15:15 - 16:30', courseCode: 'MENTOR', courseName: 'Faculty Mentorship & Project Review', room: 'CR-301', faculty: 'CSE Department Faculty', type: 'LECTURE' },
  ],
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const StudentTimetablePage: React.FC = () => {
  const [activeDay, setActiveDay] = useState('Monday');

  const todaySlots = SCHEDULE[activeDay] || [];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Student Portal
              </span>
              <span className="text-xs text-gray-400">• Class Schedule • Batch 2023-27</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">My Class Timetable & Locations</h1>
            <p className="text-sm text-gray-400">
              Daily course schedule with classroom room numbers, computing labs, and designated instructors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4" /> Real-time Venue Updates Active
            </span>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeDay === day
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                    : 'bg-slate-50 text-gray-400 hover:text-white border border-[#262B3A]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-gray-400">
            {todaySlots.length} Scheduled Sessions on {activeDay}
          </span>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-3">
          {todaySlots.map((slot, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-500/40 transition-all"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-mono font-bold text-sm shrink-0">
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-teal-400 text-xs px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                      {slot.courseCode}
                    </span>
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> {slot.time}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-semibold ${
                        slot.type === 'LAB'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                          : 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {slot.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{slot.courseName}</h3>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1 text-gray-300">
                      <Users className="w-3.5 h-3.5 text-teal-400" /> {slot.faculty}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-white font-mono font-bold text-sm">
                    <MapPin className="w-4 h-4 text-rose-400" /> {slot.room}
                  </div>
                  <div className="text-[11px] text-gray-400">Academic Wing</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};
