import { ComponentType } from 'react';
import { UserRole } from '../constants/roles';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  category?: 'Academic' | 'Hostel' | 'General';
}

export interface SidebarConfig {
  role: UserRole;
  title: string;
  items: NavItem[];
}
