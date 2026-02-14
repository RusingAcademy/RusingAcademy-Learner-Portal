/**
 * AdminControlLayout — Layout wrapper for Admin Control System pages
 */
import AdminControlSidebar from "./AdminControlSidebar";

interface Props { children: React.ReactNode; }

export default function AdminControlLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminControlSidebar />
      <main className="flex-1 ml-[240px] p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
