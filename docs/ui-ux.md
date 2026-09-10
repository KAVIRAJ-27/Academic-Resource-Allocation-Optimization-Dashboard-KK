# AHRAO Phase 4 — Common UI/UX Design System & Dashboard Framework

## 1. Overview
Phase 4 establishes the common, production-grade visual design system, reusable component library, responsive layout shell, and dashboard framework across all six AHRAO institutional roles:
- **Admin** (`ROLE_ADMIN`)
- **Principal** (`ROLE_PRINCIPAL`)
- **Head of Department** (`ROLE_HOD`)
- **Faculty** (`ROLE_FACULTY`)
- **Student** (`ROLE_STUDENT`)
- **Warden** (`ROLE_WARDEN`)

All components adhere to a modern dark SaaS enterprise aesthetic without relying on third-party UI widget suites or hardcoded inline styles.

---

## 2. Design Tokens (`src/theme/tokens.ts`)

### 2.1 Surfaces & Canvas
| Token | Hex / Value | Purpose |
|---|---|---|
| `background.base` | `#080A0F` | Global dark application canvas |
| `background.surface` | `#11141C` | Primary cards, panels, and sidebars |
| `background.secondary` | `#171A23` | Elevated card surfaces, inputs, search |
| `background.tertiary` | `#141822` | Nested containers and table header rows |
| `background.hover` | `#222838` | Interactive hover state |
| `border.default` | `#1E2330` | Default subtle card and divider border |
| `border.hover` | `#2E3547` | Interactive element hover border |
| `border.focus` | `#0D9488` | Active focus indicator (Teal) |

### 2.2 Brand Accents & Role Emphasis
| Role | Accent Color | Glow Aura | Badge Variant |
|---|---|---|---|
| `ADMIN` | `#0D9488` (Teal) | `rgba(13, 148, 136, 0.15)` | `teal` |
| `PRINCIPAL` | `#3B82F6` (Blue) | `rgba(59, 130, 246, 0.15)` | `blue` |
| `HOD` | `#8B5CF6` (Purple) | `rgba(139, 92, 246, 0.15)` | `purple` |
| `FACULTY` | `#6366F1` (Indigo) | `rgba(99, 102, 241, 0.15)` | `purple` |
| `STUDENT` | `#14B8A6` (Cyan-Teal) | `rgba(20, 184, 166, 0.15)` | `teal` |
| `WARDEN` | `#F97316` (Orange) | `rgba(249, 115, 22, 0.15)` | `orange` |

### 2.3 Typography Scale
- **Display**: `text-3xl font-extrabold tracking-tight`
- **Page Title**: `text-2xl font-bold tracking-tight`
- **Section Title**: `text-sm font-bold text-gray-200 uppercase tracking-wider font-mono`
- **Card Title**: `text-sm font-semibold tracking-normal`
- **Body**: `text-xs sm:text-sm font-normal text-gray-300 leading-relaxed`
- **Secondary**: `text-xs text-gray-400`
- **Caption**: `text-[11px] text-gray-500 font-mono`
- **Label**: `text-xs font-semibold text-gray-300 uppercase tracking-wider`

---

## 3. Global Component Library (`src/components/ui/`)

| Component | Features / Variants | Location |
|---|---|---|
| `Button` | Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`, `link`. Sizes: `xs`, `sm`, `md`, `lg`. Supports `leftIcon`, `rightIcon`, `loading`. | `src/components/ui/Button.tsx` |
| `Input` | Icon slots (left/right), error states, helper text, required markers, accessibility labels. | `src/components/ui/Input.tsx` |
| `Textarea` | Auto-adjusting dark input with label, validation states, and counter support. | `src/components/ui/Textarea.tsx` |
| `Select` | Dark theme styled select box with custom SVG chevron and error handling. | `src/components/ui/Select.tsx` |
| `Checkbox` | Custom styled checkbox with high-contrast checkmark and keyboard focus ring. | `src/components/ui/Checkbox.tsx` |
| `Radio` | Accessible radio button with active indicator dot. | `src/components/ui/Radio.tsx` |
| `Switch` | Accessible toggle switch with smooth translation transitions. | `src/components/ui/Switch.tsx` |
| `Badge` | Variants: `teal`, `purple`, `blue`, `orange`, `neutral`, `success`, `warning`, `danger`, `info`. Automated status mapper for 11 standard institutional statuses. | `src/components/ui/Badge.tsx` |
| `Card` | Compound pattern: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. | `src/components/ui/Card.tsx` |
| `StatCard` | Metric display with `--` placeholder, trend indicator, icon badge, and action slot. | `src/components/ui/StatCard.tsx` |
| `ChartCard` | Recharts responsive container with loading spinner and empty state placeholder. | `src/components/ui/ChartCard.tsx` |
| `ActionCard` | Module entry card with icon, description, badge, and hover transition. | `src/components/ui/ActionCard.tsx` |
| `Modal` | Accessible dialog with backdrop blur, Escape listener, and header/footer slots. | `src/components/ui/Modal.tsx` |
| `ConfirmDialog` | Semantic confirmation modal for primary/danger actions with loading protection. | `src/components/ui/ConfirmDialog.tsx` |
| `Tooltip` | Hover tooltips with directional positioning (`top`, `bottom`, `left`, `right`). | `src/components/ui/Tooltip.tsx` |
| `Dropdown` | Click-outside dismissible menu with trigger slot and keyboard accessible items. | `src/components/ui/Dropdown.tsx` |
| `Tabs` | Variants: `underline` and `pills`. Supports badge counts and disabled states. | `src/components/ui/Tabs.tsx` |
| `Pagination` | Responsive page navigator with page number generation, Prev/Next, and disabled states. | `src/components/ui/Pagination.tsx` |
| `Avatar` | Profile avatar with initials fallback and status badge (`online`, `offline`, `busy`). | `src/components/ui/Avatar.tsx` |
| `Spinner` | Inline and full-page loading indicators with customizable sizes and colors. | `src/components/ui/Spinner.tsx` |
| `Skeleton` | Skeleton card, table, and text components with pulse animations. | `src/components/ui/Skeleton.tsx` |
| `Alert` | Semantic alerts (`success`, `warning`, `danger`, `info`) with dismiss button. | `src/components/ui/Alert.tsx` |
| `Toast` | Global context provider (`ToastProvider`) and `useToast()` hook with auto-dismiss. | `src/components/ui/Toast.tsx` |
| `Progress` | Progress bar supporting multiple semantic color variants. | `src/components/ui/Progress.tsx` |
| `Divider` | Horizontal/vertical line with optional center label. | `src/components/ui/Divider.tsx` |
| `SearchFilter` | Composite toolbar: `SearchInput`, `FilterButton`, `FilterDropdown`, `DateRangePickerPlaceholder`, `ResetFiltersButton`. | `src/components/ui/SearchFilter.tsx` |
| `DataTable` | Reusable generic table with column definitions, sorting, loading skeletons, empty state, error retry, and pagination. | `src/components/tables/DataTable.tsx` |

---

## 4. Application Layout Primitives (`src/components/layout/`)

### 4.1 Layout Shell Architecture
```
+-------------------------------------------------------------------------------+
| Topbar (Header): Hamburger | Context Title | Search Bar | Role Badge | Profile|
+-------------------+-----------------------------------------------------------+
| Sidebar (Desktop) | Scrollable Main Canvas (<main>)                           |
| - Logo & Version  |   +-----------------------------------------------------+ |
| - Role Banner     |   | PageContainer                                       | |
| - Active Navlinks |   |   - Breadcrumbs                                     | |
| - MySQL Status    |   |   - PageHeader (Title, Description, Actions)        | |
| - SDG 4 Telemetry |   |   - ContentSection / DashboardGrid                  | |
|                   |   |     - StatCards (4 cols, '--')                      | |
|                   |   |     - ChartCards (2 cols, empty placeholders)       | |
|                   |   |     - Quick Actions + Recent Activity (split 2:1)   | |
|                   |   +-----------------------------------------------------+ |
+-------------------+-----------------------------------------------------------+
```

### 4.2 Shared Primitives
- **`DashboardShell`**: Unified container handling role themes, desktop sidebar, mobile drawer, sticky header, and content routing via `<Outlet />`.
- **`PageHeader`**: Standardized header with automatic or explicit breadcrumbs, title, description, badge, and primary/secondary action button slots.
- **`Breadcrumbs`**: Accessible route breadcrumb automatically derived from router pathnames or configured explicitly.
- **`PageContainer`**: Responsive container constraining max width (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`).
- **`ContentSection`**: Section wrapper with monospace title, subtitle, badge, and action slots.
- **`DashboardGrid`**: Responsive CSS grid supporting variants (`stats` [1/2/4 cols], `charts` [1/2 cols], `split` [3 cols with 2:1 span], `actions` [1/2/3/4 cols]).

---

## 5. Responsive Behavior

| Viewport | Width Range | Layout Behavior |
|---|---|---|
| **Desktop** | `>= 1024px` | Persistent 256px sidebar, multi-column grids (4 stats, 2 charts), visible search bar |
| **Tablet** | `768px - 1023px` | Collapsible sidebar drawer, 2-column stat cards, single-column charts, compact header |
| **Mobile** | `< 768px` | Slide-in drawer with overlay, hamburger menu button, 1-column stat cards and charts, stacked page headers |

---

## 6. Accessibility Foundation
- **Semantic Tags**: Semantic `<main>`, `<aside>`, `<header>`, `<section>`, `<nav>`, `<ol>`, `<li>`, `<button>`.
- **Visible Focus Rings**: `focus:outline-none focus:ring-2 focus:ring-teal-500/50` across all interactive elements.
- **ARIA Attributes**: `aria-label` on icon-only buttons, `aria-expanded` on dropdowns and drawers, `aria-current="page"` on breadcrumbs and active links.
- **Color Contrast**: Complies with WCAG AA on dark backgrounds (`#F3F4F6` and `#9CA3AF` against `#080A0F` / `#11141C`).
- **Keyboard Navigation**: Escape closes Modals, ConfirmDialogs, and Dropdowns; focus traps inside active dialogs.

---

## 7. Role Dashboard Framework Demonstration
Each of the 6 roles has a dedicated dashboard page adhering strictly to the no-fake-data policy:
1. **Admin**: `/admin/dashboard`
2. **Principal**: `/principal/dashboard`
3. **HOD**: `/hod/dashboard`
4. **Faculty**: `/faculty/dashboard`
5. **Student**: `/student/dashboard`
6. **Warden**: `/warden/dashboard`

All metric counters display `--` and all charts display informative empty states until business modules and data telemetry are connected in subsequent phases.
