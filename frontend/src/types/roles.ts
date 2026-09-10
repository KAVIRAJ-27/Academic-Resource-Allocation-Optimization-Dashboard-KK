import { UserRole } from '../constants/roles';

export type { UserRole };

export interface RoleConfig {
  name: UserRole;
  label: string;
  description: string;
  defaultRoute: string;
}
