"use client";

import { useState } from "react";
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
      { label: "Western", href: "/charts/western", icon: "\u2600" },
      { label: "Vedic", href: "/charts/vedic", icon: "\u0950" },
      { label: "BaZi", href: "/charts/bazi", icon: "\u7528" },
      { label: "Synastry", href: "/charts/synastry", icon: "\u2661" },
      { label: "Transits", href: "/charts/transits", icon: "\u21BB" },
      { label: "Numerology", href: "/charts/numerology", icon: "#" },
      { label: "Human Design", href: "/charts/human-design", icon: "\u25CE" },
      { label: "Harmonics", href: "/charts/harmonics", icon: "\u223F" },
    ],
  },

  {
    label: "Personality",
    icon: "\u2606", // ☆
    items: [
      { label: "MBTI", href: "/personality/mbti", icon: "\u2B21" },
      { label: "Enneagram", href: "/personality/enneagram", icon: "\u25B3" },
      { label: "Archetypes", href: "/personality/archetypes", icon: "\u2640" },
      { label: "Biorhythm", href: "/personality/biorhythm", icon: "\u223C" },
      { label: "Synthesis", href: "/personality/synthesis", icon: "\u2726" },
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
      { label: "I Ching", href: "/explore/i-ching", icon: "\u2630" },
      { label: "Tarot", href: "/explore/tarot", icon: "\u2660" },
      { label: "Feng Shui", href: "/explore/feng-shui", icon: "\u98CE" },
      { label: "Nine Star Ki", href: "/explore/nine-star-ki", icon: "\u2729" },
      { label: "Space Weather", href: "/explore/space-weather", icon: "\u26C5" },
      { label: "Color Psych", href: "/explore/color-psych", icon: "\u25C9" },
      { label: "Spirit Animal", href: "/explore/spirit-animal", icon: "\u2766" },
    ],
  },

  {
    label: "Developer",
    icon: "\u27E8\u27E9", // ⟨⟩
    items: [
      { label: "API Keys", href: "/developer/api-keys", icon: "\u26BF" },
      { label: "Usage", href: "/developer/usage", icon: "\u2261" },
      { label: "Docs", href: "/developer/docs", icon: "\u2637" },
      { label: "Sandbox", href: "/developer/sandbox", icon: "\u25B6" },
      { label: "Webhooks", href: "/developer/webhooks", icon: "\u21C4" },
    ],
  },

  {
    label: "Admin",
    icon: "\u2699", // ⚙
    items: [
      { label: "White-Label", href: "/admin/white-label", icon: "\u269B" },
      { label: "Analytics", href: "/admin/analytics", icon: "\u2593" },
      { label: "Audit", href: "/admin/audit", icon: "\u2611" },
      { label: "Config", href: "/admin/config", icon: "\u2638" },
    ],
  },

  {
    label: "Widgets",
    icon: "\u25A3", // ▣
    items: [
      { label: "Gallery", href: "/widgets/gallery", icon: "\u25A6" },
      { label: "Builder", href: "/widgets/builder", icon: "\u2692" },
    ],
  },

  { label: "Settings", href: "/settings", icon: "\u2699" },
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

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-border bg-surface transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
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
  );
}
