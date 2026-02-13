/**
 * RusingÂcademy Learning Portal - My Settings Page
 * Design: System Preferences with language and timezone dropdowns
 */
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "wouter";

export default function MySettings() {
  return (
    <DashboardLayout>
      <div className="max-w-[900px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#0c1929]" style={{ fontFamily: "'Playfair Display', serif" }}>My Settings</h1>
        </div>

        {/* System Preferences Banner */}
        <div className="bg-[rgba(0,128,144,0.08)] rounded-t-md px-6 py-3">
          <h2 className="text-base font-medium text-gray-800">System Preferences</h2>
        </div>

        <div className="bg-white rounded-b-md border border-gray-200 border-t-0 p-6">
          <div className="space-y-5 max-w-md">
            {/* System Language */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-sm text-gray-600">System Language</label>
                <span className="material-icons text-[14px] text-gray-400">help_outline</span>
              </div>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white">
                <option>English</option>
                <option>Français</option>
              </select>
            </div>

            {/* Translation Language */}
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-sm text-gray-600">Translation Language</label>
                <span className="material-icons text-[14px] text-gray-400">help_outline</span>
              </div>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white">
                <option>Français</option>
                <option>English</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Timezone</label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white">
                <option>(UTC-05:00) Eastern Time (US & Canada)</option>
                <option>(UTC-06:00) Central Time (US & Canada)</option>
                <option>(UTC-07:00) Mountain Time (US & Canada)</option>
                <option>(UTC-08:00) Pacific Time (US & Canada)</option>
                <option>(UTC-04:00) Atlantic Time (Canada)</option>
                <option>(UTC-03:30) Newfoundland</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button className="bg-[#008090] text-white text-sm font-medium py-2 px-8 rounded hover:bg-[#006d7a] transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
