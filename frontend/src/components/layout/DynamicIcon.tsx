import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Briefcase,
  ShieldCheck,
  KeyRound,
  Building2,
  Layers,
  Hotel,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  CheckSquare,
  BookOpen,
  CalendarRange,
  Clock,
  BarChart2,
  User,
  Activity,
  Send,
  FileQuestion,
  AlertCircle,
  Building,
  Grid,
  BedDouble,
  Wifi,
  AlertTriangle,
  Wrench,
  BrainCircuit,
  Sparkles,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Briefcase,
  ShieldCheck,
  KeyRound,
  Building2,
  Layers,
  Hotel,
  BarChart3,
  FileText,
  Settings,
  TrendingUp,
  CheckSquare,
  BookOpen,
  CalendarRange,
  Clock,
  BarChart2,
  User,
  Activity,
  Send,
  FileQuestion,
  AlertCircle,
  Building,
  Grid,
  BedDouble,
  Wifi,
  AlertTriangle,
  Wrench,
  BrainCircuit,
  Sparkles,
};

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
};
