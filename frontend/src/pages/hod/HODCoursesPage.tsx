import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { BookOpen, GraduationCap, Users, Clock, Search, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

interface CourseItem {
  id: number;
  code: string;
  name: string;
  semester: number;
  credits: number;
  lectureHours: number;
  labHours: number;
  facultyName: string;
  enrolledStudents: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

const DEFAULT_COURSES: CourseItem[] = [
  { id: 1, code: 'CS301', name: 'Design and Analysis of Algorithms', semester: 5, credits: 4, lectureHours: 3, labHours: 2, facultyName: 'Dr. Rajesh Sharma', enrolledStudents: 124, status: 'ACTIVE' },
  { id: 2, code: 'CS302', name: 'Database Management Systems', semester: 5, credits: 4, lectureHours: 3, labHours: 2, facultyName: 'Prof. Elena Rostova', enrolledStudents: 124, status: 'ACTIVE' },
  { id: 3, code: 'CS303', name: 'Operating Systems & System Programming', semester: 5, credits: 3, lectureHours: 3, labHours: 0, facultyName: 'Dr. Alan Turing', enrolledStudents: 118, status: 'ACTIVE' },
  { id: 4, code: 'CS304', name: 'Computer Networks & Protocols', semester: 5, credits: 4, lectureHours: 3, labHours: 2, facultyName: 'Prof. John Backus', enrolledStudents: 122, status: 'ACTIVE' },
  { id: 5, code: 'CS305', name: 'Cloud Computing & Distributed Systems', semester: 5, credits: 3, lectureHours: 3, labHours: 0, facultyName: 'Dr. Barbara Liskov', enrolledStudents: 95, status: 'ACTIVE' },
  { id: 6, code: 'CS401', name: 'Machine Learning & Deep Neural Nets', semester: 7, credits: 4, lectureHours: 3, labHours: 2, facultyName: 'Prof. Geoffrey Hinton', enrolledStudents: 110, status: 'ACTIVE' },
  { id: 7, code: 'CS402', name: 'Information & Network Security', semester: 7, credits: 3, lectureHours: 3, labHours: 0, facultyName: 'Dr. Adi Shamir', enrolledStudents: 104, status: 'ACTIVE' },
  { id: 8, code: 'CS201', name: 'Data Structures & Problem Solving', semester: 3, credits: 4, lectureHours: 3, labHours: 2, facultyName: 'Prof. Donald Knuth', enrolledStudents: 130, status: 'ACTIVE' },
];

export const HODCoursesPage: React.FC = () => {
  const [courses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.facultyName.toLowerCase().includes(search.toLowerCase());
    const matchesSemester = semesterFilter === 'ALL' || c.semester.toString() === semesterFilter;
    return matchesSearch && matchesSemester;
  });

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledStudents, 0);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Department of CSE
              </span>
              <span className="text-xs text-gray-400">• Curriculum & Syllabi</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Department Course Catalog</h1>
            <p className="text-sm text-gray-400">
              Manage undergraduate and postgraduate course tracks, credits, and faculty allocations.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Courses</span>
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{courses.length}</div>
            <div className="text-xs text-teal-400 mt-1">Across 8 academic semesters</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Credit Weight</span>
              <GraduationCap className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{totalCredits}</div>
            <div className="text-xs text-indigo-400 mt-1">Accreditation compliant</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Course Enrollments</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{totalStudents}</div>
            <div className="text-xs text-purple-400 mt-1">Active registered learners</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Faculty Coverage</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">100%</div>
            <div className="text-xs text-emerald-400 mt-1">All courses assigned</div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course code, name, or faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-[#262B3A] rounded-xl pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="bg-slate-50 border border-[#262B3A] rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Semesters</option>
              <option value="3">Semester 3</option>
              <option value="5">Semester 5</option>
              <option value="7">Semester 7</option>
            </select>
          </div>
        </div>

        {/* Course Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Course Code & Name</th>
                  <th className="py-3.5 px-4 font-semibold">Semester</th>
                  <th className="py-3.5 px-4 font-semibold">Credits</th>
                  <th className="py-3.5 px-4 font-semibold">Hours (L / P)</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Faculty</th>
                  <th className="py-3.5 px-4 font-semibold">Students</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="font-mono text-xs text-teal-400">{c.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 font-medium">Sem {c.semester}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-[#1E2330] text-teal-300 border border-[#2E3547]">
                        {c.credits} Credits
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-medium">
                      {c.lectureHours}h Lec / {c.labHours}h Lab
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium font-medium">{c.facultyName}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400">{c.enrolledStudents} enrolled</td>
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
