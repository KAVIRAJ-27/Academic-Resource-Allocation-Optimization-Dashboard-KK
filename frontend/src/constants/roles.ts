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
    badge: 'bg-[#F4F0E6] text-[#202020] border-[#D8C9A8]',
    border: 'border-[#D8C9A8]',
    text: 'text-[#202020]',
  },
  [ROLES.PRINCIPAL]: {
    badge: 'bg-[#F8F6F0] text-[#202020] border-[#D8C9A8]',
    border: 'border-[#D8C9A8]',
    text: 'text-[#202020]',
  },
  [ROLES.HOD]: {
    badge: 'bg-[#EFF4F8] text-[#657C91] border-[#C6D5E2]',
    border: 'border-[#C6D5E2]',
    text: 'text-[#657C91]',
  },
  [ROLES.FACULTY]: {
    badge: 'bg-[#F4F0E6] text-[#202020] border-[#D8C9A8]',
    border: 'border-[#D8C9A8]',
    text: 'text-[#202020]',
  },
  [ROLES.STUDENT]: {
    badge: 'bg-[#EEF6F1] text-[#3F7655] border-[#C1DFCD]',
    border: 'border-[#C1DFCD]',
    text: 'text-[#3F7655]',
  },
  [ROLES.WARDEN]: {
    badge: 'bg-[#FAF4E8] text-[#A87928] border-[#EED9B2]',
    border: 'border-[#EED9B2]',
    text: 'text-[#A87928]',
  },
};
