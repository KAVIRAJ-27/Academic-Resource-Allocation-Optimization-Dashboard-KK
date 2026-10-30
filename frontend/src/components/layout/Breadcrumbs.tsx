import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className = '',
}) => {
  const location = useLocation();

  // If explicit items not provided, derive automatically from current pathname
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathnames = location.pathname.split('/').filter(Boolean);
    return pathnames.map((segment, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      // Clean display name: e.g. "user-directory" -> "User Directory"
      const label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      const isLast = index === pathnames.length - 1;
      return {
        label,
        href: isLast ? undefined : href,
      };
    });
  })();

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-[#77736A] select-none ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1 list-none p-0 m-0">
        {showHome && (
          <li className="flex items-center">
            <Link
              to="/"
              className="inline-flex items-center text-[#77736A] hover:text-[#B8A16A] transition-colors p-1 rounded hover:bg-[#F4F0E6]"
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5" />
            </Link>
            {breadcrumbItems.length > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[#D8C9A8] mx-0.5 shrink-0" aria-hidden="true" />
            )}
          </li>
        )}

        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="inline-flex items-center gap-1.5 text-[#555555] font-medium hover:text-[#B8A16A] transition-colors py-0.5 px-1.5 rounded hover:bg-[#F4F0E6] max-w-[160px] sm:max-w-xs truncate"
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 text-[#202020] font-semibold py-0.5 px-1.5 max-w-[200px] sm:max-w-sm truncate"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-[#B8A16A]" />}
                  <span className="truncate">{item.label}</span>
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-[#D8C9A8] mx-0.5 shrink-0" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
