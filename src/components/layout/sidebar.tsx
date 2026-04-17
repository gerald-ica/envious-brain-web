"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sun,
  Compass,
  Flame,
  Heart,
  Orbit,
  Hash,
  Hexagon,
  Waves,
  Sunrise,
  ArrowRight,
  CircleDot,
  Settings,
  Sparkles,
  MessageCircle,
  BookOpen,
  Palette,
  Ghost,
  CloudSun,
  Star,
  Target,
  Crown,
  ArrowUpDown,
  CirclePlus,
  Scroll,
  Users,
  Code,
  BarChart3,
  Shield,
  Layout,
  Key,
  Webhook,
  Box,
  Globe,
  Zap,
  Brain,
  Activity,
  Blend,
  Gem,
  PenTool,
  Wrench,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";

// ---- Navigation structure -------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  Icon: LucideIcon;
}

interface NavGroup {
  label: string;
  Icon: LucideIcon;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const navigation: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },

  {
    label: "Charts",
    Icon: Sun,
    items: [
      { label: "Western", href: "/dashboard/charts/western", Icon: Sun },
      { label: "Vedic", href: "/dashboard/charts/vedic", Icon: Compass },
      { label: "BaZi", href: "/dashboard/charts/bazi", Icon: Flame },
      { label: "Synastry", href: "/dashboard/charts/synastry", Icon: Heart },
      { label: "Transits", href: "/dashboard/charts/transits", Icon: Orbit },
      { label: "Numerology", href: "/dashboard/charts/numerology", Icon: Hash },
      { label: "Human Design", href: "/dashboard/charts/human-design", Icon: Hexagon },
      { label: "Harmonics", href: "/dashboard/charts/harmonics", Icon: Waves },
      { label: "Solar Return", href: "/dashboard/charts/solar-return", Icon: Sunrise },
      { label: "Progressions", href: "/dashboard/charts/progressions", Icon: ArrowRight },
      { label: "Draconic", href: "/dashboard/charts/draconic", Icon: CircleDot },
    ],
  },

  {
    label: "Techniques",
    Icon: Wrench,
    items: [
      { label: "Hellenistic", href: "/dashboard/techniques/hellenistic", Icon: Scroll },
      { label: "Fixed Stars", href: "/dashboard/techniques/fixed-stars", Icon: Star },
      { label: "Arabic Parts", href: "/dashboard/techniques/arabic-parts", Icon: Target },
      { label: "Sabian Symbols", href: "/dashboard/techniques/sabian-symbols", Icon: CircleDot },
      { label: "Dignities", href: "/dashboard/techniques/dignities", Icon: Crown },
      { label: "Declinations", href: "/dashboard/techniques/declinations", Icon: ArrowUpDown },
      { label: "Midpoints", href: "/dashboard/techniques/midpoints", Icon: CirclePlus },
    ],
  },

  {
    label: "Personality",
    Icon: Brain,
    items: [
      { label: "MBTI", href: "/dashboard/personality/mbti", Icon: Hexagon },
      { label: "Enneagram", href: "/dashboard/personality/enneagram", Icon: Gem },
      { label: "Archetypes", href: "/dashboard/personality/archetypes", Icon: Users },
      { label: "Biorhythm", href: "/dashboard/personality/biorhythm", Icon: Activity },
      { label: "Synthesis", href: "/dashboard/personality/synthesis", Icon: Blend },
    ],
  },

  {
    label: "Oracle",
    Icon: Sparkles,
    items: [
      { label: "AI Chat", href: "/dashboard/oracle", Icon: MessageCircle },
    ],
  },

  {
    label: "Explore",
    Icon: Globe,
    items: [
      { label: "I Ching", href: "/dashboard/explore/iching", Icon: BookOpen },
      { label: "Tarot", href: "/dashboard/explore/tarot", Icon: PenTool },
      { label: "Feng Shui", href: "/dashboard/explore/fengshui", Icon: Layout },
      { label: "Nine Star Ki", href: "/dashboard/explore/nine-star-ki", Icon: Zap },
      { label: "Space Weather", href: "/dashboard/explore/space-weather", Icon: CloudSun },
      { label: "Color Psych", href: "/dashboard/explore/color-psych", Icon: Palette },
      { label: "Spirit Animal", href: "/dashboard/explore/spirit-animal", Icon: Ghost },
    ],
  },

  {
    label: "Developer",
    Icon: Code,
    items: [
      { label: "API Keys", href: "/dashboard/developer/keys", Icon: Key },
      { label: "Usage", href: "/dashboard/developer/usage", Icon: BarChart3 },
      { label: "Docs", href: "/dashboard/developer/docs", Icon: BookOpen },
      { label: "Sandbox", href: "/dashboard/developer/sandbox", Icon: Box },
      { label: "Webhooks", href: "/dashboard/developer/webhooks", Icon: Webhook },
    ],
  },

  {
    label: "Admin",
    Icon: Shield,
    items: [
      { label: "White-Label", href: "/dashboard/admin/whitelabel", Icon: Layout },
      { label: "Analytics", href: "/dashboard/admin/analytics", Icon: BarChart3 },
      { label: "Audit", href: "/dashboard/admin/audit", Icon: Shield },
      { label: "Config", href: "/dashboard/admin/config", Icon: Settings },
    ],
  },

  {
    label: "Widgets",
    Icon: Layout,
    items: [
      { label: "Gallery", href: "/dashboard/widgets/gallery", Icon: Layout },
      { label: "Builder", href: "/dashboard/widgets/builder", Icon: Wrench },
    ],
  },

  { label: "Settings", href: "/dashboard/settings", Icon: Settings },
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
    <motion.div whileHover={{ x: collapsed ? 0 : 2 }} transition={{ duration: 0.15 }}>
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          active
            ? "border-l-2 border-accent-blue bg-accent-blue/10 text-accent-blue font-medium"
            : "border-l-2 border-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary"
        } ${collapsed ? "justify-center px-2" : ""}`}
        title={collapsed ? item.label : undefined}
      >
        <item.Icon size={20} className="shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </motion.div>
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
      <motion.button
        whileHover={{ x: collapsed ? 0 : 2 }}
        transition={{ duration: 0.15 }}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "text-accent-blue"
            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
        } ${collapsed ? "justify-center px-2" : ""}`}
        title={collapsed ? group.label : undefined}
      >
        <group.Icon size={20} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{group.label}</span>
            <motion.span
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-text-muted"
            >
              <ChevronRight size={14} />
            </motion.span>
          </>
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {open && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} collapsed={false} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`flex flex-col border-r border-border bg-surface transition-all duration-200 ${
          collapsed ? "md:w-16" : "md:w-60"
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
              <Sparkles size={20} className="text-accent-blue" />
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
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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
            <p className="text-xs text-text-muted text-center">v0.1.0</p>
          )}
        </div>
      </aside>
    </>
  );
}
