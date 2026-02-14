/**
 * PageShell — Adaptive page wrapper
 *
 * When rendered standalone (e.g. /coach), wraps children in the standard
 * min-h-screen + Header + Footer layout.
 *
 * When rendered inside AppLayout (detected via AppLayoutContext),
 * strips the Header, Footer, and outer wrapper — returning only the
 * content area so it integrates seamlessly with the sidebar layout.
 *
 * Usage: Replace the outer <div className="min-h-screen..."> + <Header/> + <Footer/>
 * in any page with <PageShell>…content…</PageShell>.
 */
import { useAppLayout } from "@/contexts/AppLayoutContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PageShellProps {
  children: React.ReactNode;
  /** Additional className for the standalone wrapper */
  className?: string;
  /** Whether to show the decorative background (some dashboards have this) */
  decorativeBackground?: boolean;
}

export default function PageShell({
  children,
  className = "bg-background",
  decorativeBackground = false,
}: PageShellProps) {
  const { isInsideAppLayout } = useAppLayout();

  // Inside AppLayout → render content only, no Header/Footer/wrapper
  if (isInsideAppLayout) {
    return <>{children}</>;
  }

  // Standalone → full page with Header + Footer
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header />
      {decorativeBackground && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-200/30 dark:bg-slate-800/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/4 w-80 h-80 bg-slate-200/20 dark:bg-slate-800/10 rounded-full blur-3xl" />
        </div>
      )}
      <main id="main-content" className="flex-1 relative">
        {children}
      </main>
      <Footer />
    </div>
  );
}
