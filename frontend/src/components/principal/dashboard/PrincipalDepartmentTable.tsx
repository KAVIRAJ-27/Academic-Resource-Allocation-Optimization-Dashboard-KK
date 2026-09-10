import React, { useState, useMemo } from 'react';
import { PrincipalDepartmentOverviewDto } from '../../../types/principal';
import { Badge, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../ui';
import { Layers, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface PrincipalDepartmentTableProps {
  departments: PrincipalDepartmentOverviewDto[];
}

type SortField = 'departmentName' | 'studentCount' | 'facultyCount' | 'programCount' | 'subjectCount' | 'pendingRequestCount' | 'activeAllocationCount';
type SortOrder = 'asc' | 'desc';

export const PrincipalDepartmentTable: React.FC<PrincipalDepartmentTableProps> = ({ departments }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('departmentName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = departments.filter((dept) => {
      const matchesSearch =
        dept.departmentName.toLowerCase().includes(search.toLowerCase()) ||
        dept.departmentCode.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });

    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [departments, search, sortField, sortOrder]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600 ml-1 inline" />
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle>Academic Department Overview & Comparison</CardTitle>
            </div>
            <CardDescription>
              Institution-wide comparative metrics across academic departments based on live database records.
            </CardDescription>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                  onClick={() => handleSort('departmentName')}
                >
                  Department {renderSortIcon('departmentName')}
                </th>
                <th className="px-4 py-3">Status</th>
                <th
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                  onClick={() => handleSort('studentCount')}
                >
                  Students {renderSortIcon('studentCount')}
                </th>
                <th
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                  onClick={() => handleSort('facultyCount')}
                >
                  Faculty {renderSortIcon('facultyCount')}
                </th>
                <th
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                  onClick={() => handleSort('programCount')}
                >
                  Programs {renderSortIcon('programCount')}
                </th>
                <th
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                  onClick={() => handleSort('subjectCount')}
                >
                  Subjects {renderSortIcon('subjectCount')}
                </th>
                <th
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                  onClick={() => handleSort('pendingRequestCount')}
                >
                  Pending Reqs {renderSortIcon('pendingRequestCount')}
                </th>
                <th
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none"
                  onClick={() => handleSort('activeAllocationCount')}
                >
                  Active Alloc {renderSortIcon('activeAllocationCount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    No departments found.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((dept) => (
                  <tr
                    key={dept.departmentId}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {dept.departmentName}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{dept.departmentCode}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={dept.status === 'ACTIVE' ? 'success' : 'neutral'}
                        size="sm"
                        dot
                      >
                        {dept.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                      {dept.studentCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                      {dept.facultyCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                      {dept.programCount}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                      {dept.subjectCount}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {dept.pendingRequestCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                          {dept.pendingRequestCount}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {dept.activeAllocationCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {dept.activeAllocationCount}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
