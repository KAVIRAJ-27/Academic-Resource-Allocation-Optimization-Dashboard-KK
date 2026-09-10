export const ROLES = {
  ADMIN: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  HOD: 'HOD',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
  WARDEN: 'WARDEN',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [ROLES.ADMIN]: 'System Administrator',
  [ROLES.PRINCIPAL]: 'College Principal',
  [ROLES.HOD]: 'Head of Department (HOD)',
  [ROLES.FACULTY]: 'Academic Faculty',
  [ROLES.STUDENT]: 'Enrolled Student',
  [ROLES.WARDEN]: 'Hostel Warden',
};

export const ROLE_COLORS: Record<UserRole, { badge: string; border: string; text: string }> = {
  [ROLES.ADMIN]: {
    badge: 'bg-brand-purple/20 text-brand-purple-light border-brand-purple/40',
    border: 'border-brand-purple/40',
    text: 'text-brand-purple-light',
  },
  [ROLES.PRINCIPAL]: {
    badge: 'bg-brand-blue/20 text-brand-blue-light border-brand-blue/40',
    border: 'border-brand-blue/40',
    text: 'text-brand-blue-light',
  },
  [ROLES.HOD]: {
    badge: 'bg-brand-teal/20 text-brand-teal-light border-brand-teal/40',
    border: 'border-brand-teal/40',
    text: 'text-brand-teal-light',
  },
  [ROLES.FACULTY]: {
    badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    border: 'border-indigo-500/40',
    text: 'text-indigo-400',
  },
  [ROLES.STUDENT]: {
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
  },
  [ROLES.WARDEN]: {
    badge: 'bg-brand-orange/20 text-brand-orange-light border-brand-orange/40',
    border: 'border-brand-orange/40',
    text: 'text-brand-orange-light',
  },
};
