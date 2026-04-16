"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ---- Navigation structure -------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const navigation: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", icon: "\u2302" }, // ⌂

  {
    label: "Charts",
    icon: "\u2609", // ☉
    items: [
      { label: "Western", href: "/dashboard/charts/western", icon: "\u2600" },
      { label: "Vedic", href: "/dashboard/charts/vedic", icon: "\u0950" },
      { label: "BaZi", href: "/dashboard/charts/bazi", icon: "\u7528" },
      { label: "Synastry", href: "/dashboard/charts/synastry", icon: "\u2661" },
      { label: "Transits", href: "/dashboard/charts/transits", icon: "\u21BB" },
      { label: "Numerology", href: "/dashboard/charts/numerology", icon: "#" },
      { label: "Human Design", href: "/dashboard/charts/human-design", icon: "\u25CE" },
      { label: "Harmonics", href: "/dashboard/charts/harmonics", icon: "\u223F" },
      { label: "Solar Return", href: "/dashboard/charts/solar-return", icon: "\u2609" },
      { label: "Progressions", href: "/dashboard/charts/progressions", icon: "\u2192" },
      { label: "Draconic", href: "/dashboard/charts/draconic", icon: "\u260A" },
    ],
  },

  {
    label: "Techniques",
    icon: "\u2692", // ⚒
    items: [
      { label: "Hellenistic", href: "/dashboard/techniques/hellenistic", icon: "\u03A9" },
      { label: "Fixed Stars", href: "/dashboard/techniques/fixed-stars", icon: "\u2605" },
      { label: "Arabic Parts", href: "/dashboard/techniques/arabic-parts", icon: "\u263D" },
      { label: "Sabian Symbols", href: "/dashboard/techniques/sabian-symbols", icon: "\u25CE" },
      { label: "Dignities", href: "/dashboard/techniques/dignities", icon: "\u2654" },
      { label: "Declinations", href: "/dashboard/techniques/declinations", icon: "\u2195" },
      { label: "Midpoints", href: "/dashboard/techniques/midpoints", icon: "\u2295" },
    ],
  },

  {
    label: "Personality",
    icon: "\u2606", // ☆
    items: [
      { label: "MBTI", href: "/dashboard/personality/mbti", icon: "\u2B21" },
      { label: "Enneagram", href: "/dashboard/personality/enneagram", icon: "\u25B3" },
      { label: "Archetypes", href: "/dashboard/personality/archetypes", icon: "\u2640" },
      { label: "Biorhythm", href: "/dashboard/personality/biorhythm", icon: "\u223C" },
      { label: "Synthesis", href: "/dashboard/personality/synthesis", icon: "\u2726" },
    ],
  },

  {
    label: "Oracle",
    icon: "\u2735", // ✵
    items: [
      { label: "AI Chat", href: "/dashboard/oracle", icon: "\u2604" },
    ],
  },

  {
    label: "Explore",
    icon: "\u2638", // ☸
    items: [
      { label: "I Ching", href: "/dashboard/explore/iching", icon: "\u2630" },
      { label: "Tarot", href: "/dashboard/explore/tarot", icon: "\u2660" },
      { label: "Feng Shui", href: "/dashboard/explore/fengshui", icon: "\u98CE" },
      { label: "Nine Star Ki", href: "/dashboard/explore/nine-star-ki", icon: "\u2729" },
      { label: "Space Weather", href: "/dashboard/explore/space-weather", icon: "\u26C5" },
      { label: "Color Psych", href: "/dashboard/explore/color-psych", icon: "\u25C9" },
      { label: "Spirit Animal", href: "/dashboard/explore/spirit-animal", icon: "\u2766" },
    ],
  },

  {
    label: "Developer",
    icon: "\u27E8\u27E9", // ⟨⟩
    items: [
      { label: "API Keys", href: "/dashboard/developer/keys", icon: "\u26BF" },
      { label: "Usage", href: "/dashboard/developer/usage", icon: "\u2261" },
      { label: "Docs", href: "/dashboard/developer/docs", icon: "\u2637" },
      { label: "Sandbox", href: "/dashboard/developer/sandbox", icon: "\u25B6" },
      { label: "Webhooks", href: "/dashboard/developer/webhooks", icon: "\u21C4" },
    ],
  },

  {
    label: "Admin",
    icon: "\u2699", // ⚙
    items: [
      { label: "White-Label", href: "/dashboard/admin/whitelabel", icon: "\u269B" },
      { label: "Analytics", href: "/dashboard/admin/analytics", icon: "\u2593" },
      { label: "Audit", href: "/dashboard/admin/audit", icon: "\u2611" },
      { label: "Config", href: "/dashboard/admin/config", icon: "\u2638" },
    ],
  },

  {
    label: "Widgets",
    icon: "\u25A3", // ▣
    items: [
      { label: "Gallery", href: "/dashboard/widgets/gallery", icon: "\u25A6" },
      { label: "Builder", href: "/dashboard/widgets/builder", icon: "\u2692" },
    ],
  },

  { label: "Settings", href: "/dashboard/settings", icon: "\u2699" },
];

// ---- Components -----------------------------------------------------------

function NavLink({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-accent-blue/15 text-accent-blue font-medium"
          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <span className="w-5 text-center text-base shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function NavGroupSection({
  group,
  collapsed,
}: {
  group: NavGroup;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = group.items.some((item) => pathname.startsWith(item.href));
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "text-accent-blue"
            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
        } ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? group.label : undefined}
      >
        <span className="w-5 text-center text-base shrink-0">
          {group.icon}
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{group.label}</span>
            <span
              className={`text-xs transition-transform duration-200 ${
                open ? "rotate-90" : ""
              }`}
            >
              {"\u25B8"}
            </span>
          </>
        )}
      </button>

      {open && !collapsed && (
        <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} collapsed={false} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Sidebar --------------------------------------------------------------

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (mobileOpen && onClose) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`flex flex-col border-r border-border bg-surface transition-all duration-200 ${
          collapsed ? "md:w-16" : "md:w-64"
        } ${
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-64"
            : "hidden md:flex"
        }`}
      >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-accent-blue">
              {"\u2727"}
            </span>
            <span className="text-sm font-bold tracking-wide text-text-primary">
              ENVI-OUS BRAIN
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded-md p-1.5 text-text-muted hover:bg-white/5 hover:text-text-primary transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "\u27E9" : "\u27E8"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="flex flex-col gap-0.5">
          {navigation.map((entry) =>
            isGroup(entry) ? (
              <NavGroupSection
                key={entry.label}
                group={entry}
                collapsed={collapsed}
              />
            ) : (
              <NavLink
                key={entry.href}
                item={entry}
                collapsed={collapsed}
              />
            ),
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <p className="text-xs text-text-muted text-center">
            v0.1.0
          </p>
        )}
      </div>
    </aside>
    </>
  );
}
