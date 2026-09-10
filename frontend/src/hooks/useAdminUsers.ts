import { useState, useEffect, useCallback, useRef } from 'react';
import { adminUserApi, CreateUserData, UpdateUserData } from '../services/api/adminUserApi';
import { UserSummary } from '../types/auth';

export interface UseAdminUsersReturn {
  users: UserSummary[];
  loading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  roleFilter: string;
  statusFilter: string;
  setSearch: (search: string) => void;
  setRoleFilter: (role: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  createUser: (data: CreateUserData) => Promise<UserSummary>;
  updateUser: (id: number, data: UpdateUserData) => Promise<UserSummary>;
  updateStatus: (id: number, status: string) => Promise<UserSummary>;
  updateRoles: (id: number, roles: string[]) => Promise<UserSummary>;
  resetPassword: (id: number, newPassword: string) => Promise<void>;
}

export const useAdminUsers = (initialPageSize = 20): UseAdminUsersReturn => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (0-based)
  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters state
  const [search, setSearchState] = useState('');
  const [roleFilter, setRoleFilterState] = useState('ALL');
  const [statusFilter, setStatusFilterState] = useState('ALL');

  // Debounce ref for search
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(
    async (pageToFetch = page, searchToUse = search, roleToUse = roleFilter, statusToUse = statusFilter) => {
      setLoading(true);
      setError(null);
      try {
        const params: {
          search?: string;
          role?: string;
          status?: string;
          page: number;
          size: number;
        } = {
          page: pageToFetch,
          size,
        };

        if (searchToUse.trim()) {
          params.search = searchToUse.trim();
        }
        if (roleToUse !== 'ALL') {
          params.role = roleToUse;
        }
        if (statusToUse !== 'ALL') {
          params.status = statusToUse;
        }

        const res = await adminUserApi.getUsers(params);
        if (res.data) {
          setUsers(res.data.content || []);
          setPageState(res.data.page);
          setTotalElements(res.data.totalElements);
          setTotalPages(res.data.totalPages);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch users from server';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [page, size, search, roleFilter, statusFilter]
  );

  // Initial fetch and dependency trigger
  useEffect(() => {
    fetchUsers(page, search, roleFilter, statusFilter);
  }, [page, roleFilter, statusFilter]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setPageState(0);
      fetchUsers(0, newSearch, roleFilter, statusFilter);
    }, 350);
  };

  const setRoleFilter = (newRole: string) => {
    setRoleFilterState(newRole);
    setPageState(0);
  };

  const setStatusFilter = (newStatus: string) => {
    setStatusFilterState(newStatus);
    setPageState(0);
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  const refresh = () => {
    fetchUsers(page, search, roleFilter, statusFilter);
  };

  const createUser = async (data: CreateUserData): Promise<UserSummary> => {
    const res = await adminUserApi.createUser(data);
    refresh();
    return res.data;
  };

  const updateUser = async (id: number, data: UpdateUserData): Promise<UserSummary> => {
    const res = await adminUserApi.updateUser(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    return res.data;
  };

  const updateStatus = async (id: number, status: string): Promise<UserSummary> => {
    const res = await adminUserApi.updateUserStatus(id, status);
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    return res.data;
  };

  const updateRoles = async (id: number, roles: string[]): Promise<UserSummary> => {
    const res = await adminUserApi.updateUserRoles(id, roles);
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    return res.data;
  };

  const resetPassword = async (id: number, newPassword: string): Promise<void> => {
    await adminUserApi.resetUserPassword(id, newPassword);
  };

  return {
    users,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    roleFilter,
    statusFilter,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setPage,
    refresh,
    createUser,
    updateUser,
    updateStatus,
    updateRoles,
    resetPassword,
  };
};
