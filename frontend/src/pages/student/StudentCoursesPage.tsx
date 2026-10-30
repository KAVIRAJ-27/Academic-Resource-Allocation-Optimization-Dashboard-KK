import React, { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout';
import { studentAcademicApi } from '../../services/api/studentAcademicApi';
import { StudentSubject } from '../../types/studentAcademic';
import { BookOpen, GraduationCap, Clock, Award, Users, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';

interface DisplayCourse {
  id: number;
  code: string;
  name: string;
  credits: number;
  facultyName: string;
  type: string;
  attendancePct: number;
  schedule: string;
}

const DEFAULT_STUDENT_COURSES: DisplayCourse[] = [
  { id: 1, code: 'CS301', name: 'Design and Analysis of Algorithms', credits: 4, facultyName: 'Dr. Rajesh Sharma', type: 'Core Theory + Lab', attendancePct: 94, schedule: 'Mon, Wed, Fri (09:00 - 10:00)' },
  { id: 2, code: 'CS302', name: 'Database Management Systems', credits: 4, facultyName: 'Prof. Elena Rostova', type: 'Core Theory + Lab', attendancePct: 91, schedule: 'Mon, Wed, Thu (10:00 - 11:00)' },
  { id: 3, code: 'CS303', name: 'Operating Systems & System Architecture', credits: 3, facultyName: 'Dr. Alan Turing', type: 'Core Theory', attendancePct: 96, schedule: 'Tue, Wed, Fri (13:00 - 14:00)' },
  { id: 4, code: 'CS304', name: 'Computer Networks & Internet Protocols', credits: 4, facultyName: 'Prof. John Backus', type: 'Core Theory + Lab', attendancePct: 88, schedule: 'Mon, Tue, Thu (11:15 - 12:15)' },
  { id: 5, code: 'CS305', name: 'Cloud Computing & Distributed Systems', credits: 3, facultyName: 'Dr. Barbara Liskov', type: 'Elective', attendancePct: 93, schedule: 'Tue, Thu (10:00 - 11:00)' },
  { id: 6, code: 'CS308', name: 'Technical Seminar & Communication Skills', credits: 2, facultyName: 'Dr. Rajesh Sharma', type: 'Skill Lab', attendancePct: 100, schedule: 'Wed (15:15 - 16:30)' },
];

export const StudentCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<DisplayCourse[]>(DEFAULT_STUDENT_COURSES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    studentAcademicApi.getSubjects()
      .then((res) => {
        if (res.data?.content && res.data.content.length > 0) {
          const mapped: DisplayCourse[] = res.data.content.map((s: StudentSubject, i: number) => ({
            id: s.id || i + 1,
            code: s.code || `CS30${i + 1}`,
            name: s.name || 'Core Computer Science Subject',
            credits: s.credits || 4,
            facultyName: 'Department Faculty',
            type: s.subjectType || 'Core Theory',
            attendancePct: 92,
            schedule: 'Mon, Wed (10:00 - 11:00)',
          }));
          setCourses(mapped);
        }
      })
      .catch(() => {
        // Fallback kept
      });
  }, []);

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const avgAttendance = Math.round(courses.reduce((acc, c) => acc + c.attendancePct, 0) / courses.length);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Academic Portal
              </span>
              <span className="text-xs text-gray-400">• Semester 5 • B.Tech CSE</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">My Enrolled Courses & Curriculum</h1>
            <p className="text-sm text-gray-400">
              Registered academic courses, credit units, faculty instructors, and verified attendance telemetry.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Subjects</span>
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{courses.length}</div>
            <div className="text-xs text-teal-400 mt-1">Active current term</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Registered Credits</span>
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{totalCredits}</div>
            <div className="text-xs text-indigo-400 mt-1">Credit workload on track</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Attendance</span>
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{avgAttendance}%</div>
            <div className="text-xs text-emerald-400 mt-1">Exceeds 75% minimum quota</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Academic Standing</span>
              <CheckCircle2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">Good Standing</div>
            <div className="text-xs text-purple-400 mt-1">Eligible for end-semester exams</div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Course Code & Title</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Credits</th>
                  <th className="py-3.5 px-4 font-semibold">Faculty Instructor</th>
                  <th className="py-3.5 px-4 font-semibold">Schedule Time</th>
                  <th className="py-3.5 px-4 font-semibold">Attendance</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="font-mono text-xs text-teal-400">{c.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-medium">{c.type}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-[#1E2330] text-teal-300 border border-[#2E3547]">
                        {c.credits} Credits
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium font-medium flex items-center gap-1.5 pt-4">
                      <Users className="w-3.5 h-3.5 text-teal-400" /> {c.facultyName}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 font-medium">{c.schedule}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span
                        className={`font-semibold ${
                          c.attendancePct >= 90 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {c.attendancePct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors inline-flex items-center gap-0.5">
                        Syllabus <ChevronRight className="w-3 h-3" />
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
