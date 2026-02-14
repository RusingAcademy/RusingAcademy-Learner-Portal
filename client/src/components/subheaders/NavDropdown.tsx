import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { type NavItem, getIconComponent } from "@/hooks/useNavigation";

/**
 * NavDropdown — Reusable dropdown sub-menu for sub-header navigation items.
 * 
 * Renders a parent nav link with a dropdown arrow. On hover (desktop) or click (mobile),
 * shows a dropdown panel with child items. Preserves the Golden reference visual design
 * by accepting style props from the parent sub-header.
 * 
 * Used by: RusingAcademySubHeader, LingueefySubHeader, BarholexSubHeader
 */

interface NavDropdownProps {
  item: NavItem;
  language: string;
  isActive: (href: string) => boolean;
  isScrolled: boolean;
  /** Brand-specific CSS variable for active color */
  activeColor: string;
  /** Brand-specific CSS variable for active background */
  activeBg?: string;
}

export function NavDropdown({ item, language, isActive, isScrolled, activeColor, activeBg }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const active = isActive(item.href);
  const IconComp = getIconComponent(item.icon);
  const label = language === "fr" ? item.labelFr : item.labelEn;
  const hasChildren = item.children && item.children.length > 0;

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  if (!hasChildren) {
    // No children — render a simple link (same as before)
    return (
      <Link
        href={item.href}
        className="relative flex items-center gap-2 px-3 py-2 font-medium transition-all duration-300 rounded-lg"
        style={{
          color: active ? activeColor : "var(--text)",
          fontSize: isScrolled ? "13px" : "14px",
        }}
        aria-current={active ? "page" : undefined}
      >
        {IconComp && <IconComp className="h-4 w-4" />}
        {label}
        {active && (
          <span
            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: activeColor }}
          />
        )}
      </Link>
    );
  }

  // Has children — render dropdown
  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={() => {
        clearTimeout(timeoutRef.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        timeoutRef.current = setTimeout(() => setOpen(false), 200);
      }}
    >
      {/* Parent link — clickable to navigate, hover to open dropdown */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 px-3 py-2 font-medium transition-all duration-300 rounded-lg cursor-pointer"
        style={{
          color: active || open ? activeColor : "var(--text)",
          fontSize: isScrolled ? "13px" : "14px",
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {IconComp && <IconComp className="h-4 w-4" />}
        {label}
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
        {active && (
          <span
            className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-300"
            style={{ backgroundColor: activeColor }}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[220px] rounded-xl border shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-200"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--sand)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          }}
          role="menu"
        >
          {/* Optional: parent item as first link */}
          {item.href && item.href !== "#" && (
            <>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors rounded-lg mx-1"
                style={{
                  color: isActive(item.href) ? activeColor : "var(--text)",
                }}
                role="menuitem"
              >
                {IconComp && <IconComp className="h-4 w-4" />}
                {language === "fr" ? `Voir tout: ${item.labelFr}` : `View all: ${item.labelEn}`}
              </Link>
              <div className="mx-3 my-1 border-t" style={{ borderColor: "var(--sand)" }} />
            </>
          )}

          {/* Child items */}
          {item.children!.map((child) => {
            const childActive = isActive(child.href);
            const ChildIcon = getIconComponent(child.icon);
            const childLabel = language === "fr" ? child.labelFr : child.labelEn;

            return (
              <Link
                key={child.id}
                href={child.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-all rounded-lg mx-1"
                style={{
                  color: childActive ? activeColor : "var(--text)",
                  backgroundColor: childActive ? (activeBg || "rgba(0,0,0,0.04)") : "transparent",
                }}
                role="menuitem"
              >
                {ChildIcon && <ChildIcon className="h-4 w-4 opacity-70" />}
                {childLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * MobileNavDropdown — Accordion-style dropdown for mobile sub-header navigation.
 */
interface MobileNavDropdownProps {
  item: NavItem;
  language: string;
  isActive: (href: string) => boolean;
  activeColor: string;
  activeBg?: string;
  onNavigate: () => void;
}

export function MobileNavDropdown({ item, language, isActive, activeColor, activeBg, onNavigate }: MobileNavDropdownProps) {
  const [expanded, setExpanded] = useState(false);
  const active = isActive(item.href);
  const IconComp = getIconComponent(item.icon);
  const label = language === "fr" ? item.labelFr : item.labelEn;
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2"
        style={{
          backgroundColor: active ? (activeBg || "var(--brand-cta-soft)") : "transparent",
          borderColor: active ? activeColor : "transparent",
          color: active ? activeColor : "var(--text)",
        }}
      >
        {IconComp && <IconComp className="h-4 w-4" />}
        {label}
      </Link>
    );
  }

  return (
    <div>
      {/* Parent row with expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all border-l-2"
        style={{
          backgroundColor: active ? (activeBg || "var(--brand-cta-soft)") : "transparent",
          borderColor: active ? activeColor : "transparent",
          color: active ? activeColor : "var(--text)",
        }}
      >
        <span className="flex items-center gap-3">
          {IconComp && <IconComp className="h-4 w-4" />}
          {label}
        </span>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Children — accordion */}
      {expanded && (
        <div className="ml-6 mt-1 space-y-0.5 border-l-2" style={{ borderColor: "var(--sand)" }}>
          {/* Optional: parent as first child link */}
          {item.href && item.href !== "#" && (
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={{
                color: isActive(item.href) ? activeColor : "var(--muted)",
              }}
            >
              {language === "fr" ? `Tout voir` : `View all`}
            </Link>
          )}
          {item.children!.map((child) => {
            const childActive = isActive(child.href);
            const ChildIcon = getIconComponent(child.icon);
            const childLabel = language === "fr" ? child.labelFr : child.labelEn;

            return (
              <Link
                key={child.id}
                href={child.href}
                onClick={onNavigate}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
                style={{
                  color: childActive ? activeColor : "var(--text)",
                  backgroundColor: childActive ? (activeBg || "rgba(0,0,0,0.04)") : "transparent",
                }}
              >
                {ChildIcon && <ChildIcon className="h-4 w-4 opacity-70" />}
                {childLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
