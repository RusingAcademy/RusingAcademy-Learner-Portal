/**
 * LRDG Portal - Notifications Page
 * Design: Inbox-style list of notifications
 * Teal header, sortable table
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

const notifications = [
  {
    id: 1,
    title: "LRDG Language Training: How to access your learning materials / Formation linguistique LRDG: Comment accéder à votre matériel d'apprentissage",
    from: "system",
    date: "03/12/2024",
    time: "02:55 PM",
    read: true,
  },
  {
    id: 2,
    title: "LRDG Language Training: How to access your learning materials / Formation linguistique LRDG: Comment accéder à votre matériel d'apprentissage",
    from: "system",
    date: "03/01/2024",
    time: "08:54 AM",
    read: true,
  },
  {
    id: 3,
    title: "LRDG Language Training: Preliminary oral evaluation results / Formation linguistique LRDG: Résultats de votre évaluation orale préliminaire.",
    from: "system",
    date: "03/01/2024",
    time: "08:54 AM",
    read: true,
  },
];

export default function Notifications() {
  return (
    <DashboardLayout>
      <div className="max-w-[1200px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-medium text-gray-900">Notifications</h1>
          <span className="text-xs text-gray-400 ml-2">0 unread notifications</span>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#D4FBF7]">
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3 w-8">
                  <span className="material-icons text-[16px] text-gray-400">mail</span>
                </th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">
                  <div className="flex items-center gap-1">
                    Subject
                    <span className="material-icons text-[14px] text-gray-400">unfold_more</span>
                  </div>
                </th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">
                  <div className="flex items-center gap-1">
                    From
                    <span className="material-icons text-[14px] text-gray-400">unfold_more</span>
                  </div>
                </th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">
                  <div className="flex items-center gap-1">
                    Date
                    <span className="material-icons text-[14px] text-gray-400">unfold_more</span>
                  </div>
                </th>
                <th className="text-left text-xs font-medium text-gray-700 px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n, i) => (
                <tr
                  key={n.id}
                  className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-[#eef9f7] cursor-pointer`}
                >
                  <td className="px-4 py-3">
                    <span className="material-icons text-[16px] text-gray-300">
                      {n.read ? "drafts" : "mail"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 max-w-[400px]">
                    <p className="truncate">{n.title}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{n.from}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{n.date}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{n.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
