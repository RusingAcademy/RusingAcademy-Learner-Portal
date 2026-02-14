/**
 * RusingÂcademy Learning Portal - My Profile Page
 * Design: Form-based profile page matching original
 * Sections: Info, Name, Login, Other, Security Questions, Learner, Contact Cards, Contact, Address
 */
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Link } from "wouter";

export default function MyProfile() {
  const [contactCardsOpen, setContactCardsOpen] = useState(true);
  const [contactOpen, setContactOpen] = useState(true);
  const [addressOpen, setAddressOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="max-w-[900px]">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-[#008090] transition-colors">
            <span className="material-icons text-[20px]">navigate_before</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>My Profile</h1>
        </div>

        {/* Info Banner */}
        <div className="bg-[rgba(0,128,144,0.08)] rounded-t-md px-6 py-3">
          <h2 className="text-base font-medium text-gray-800">Info</h2>
        </div>

        <div className="bg-white rounded-b-md border border-gray-200 border-t-0 p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left - Form Fields */}
            <div className="flex-1 space-y-6">
              {/* Name Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">Name</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">First Name</label>
                    <input
                      type="text"
                      value="Steven"
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Last Name</label>
                    <input
                      type="text"
                      value="Barholere"
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Login Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">Login</h3>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Username</label>
                  <input
                    type="text"
                    value="steven.barholere@rusingacademy.ca"
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-gray-50"
                  />
                </div>
                <button className="text-xs text-[#008090] hover:underline mt-2">
                  Change Password
                </button>
              </div>

              {/* Other Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">Other</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Associated Groups</label>
                    <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-white">
                      <option>-</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Employer</label>
                    <input
                      type="text"
                      value="RusingÂcademy Inc."
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Security Questions */}
              <div>
                <h3 className="text-sm font-medium text-gray-800 mb-3">Security Questions</h3>
                <div className="space-y-3">
                  {[
                    "What was your mother's maiden name?",
                    "What was your favorite book?",
                    "What was your primary teacher's name?"
                  ].map((q, i) => (
                    <div key={i}>
                      <label className="text-xs text-gray-500 mb-1 block">Security Question {i + 1} *</label>
                      <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 bg-white mb-1">
                        <option>{q}</option>
                      </select>
                      <label className="text-xs text-gray-500 mb-1 block">Answer {i + 1} *</label>
                      <input
                        type="password"
                        value="••••••••••••••••"
                        readOnly
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                      />
                    </div>
                  ))}
                  <button className="text-xs text-[#008090] hover:underline">
                    Reset Security Questions
                  </button>
                </div>
              </div>
            </div>

            {/* Right - Profile Picture + Learner Info */}
            <div className="w-full lg:w-[220px] space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                  <span className="material-icons text-gray-400 text-5xl">person</span>
                </div>
                <button className="text-xs text-[#008090] hover:underline mb-1">
                  Change Profile Picture
                </button>
                <button className="text-xs text-[#008090] hover:underline">
                  Notification Settings
                </button>
              </div>

              {/* Learner Info */}
              <div className="bg-gray-50 rounded-md p-4 space-y-3">
                <h4 className="text-xs font-medium text-gray-500">Learner</h4>
                <div>
                  <p className="text-[10px] text-gray-400">Learner Status</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600">On Hold</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Methodology</p>
                  <p className="text-xs text-gray-700">Individual - Part Time</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Language</p>
                  <p className="text-xs text-gray-700">English</p>
                </div>
                <button className="text-xs text-[#008090] hover:underline w-full text-center py-1 border border-[#008090]/20 rounded">
                  See Proficiency Levels
                </button>
              </div>
            </div>
          </div>

          {/* Contact Cards Accordion */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={() => setContactCardsOpen(!contactCardsOpen)}
              className="flex items-center justify-between w-full py-2"
            >
              <h3 className="text-sm font-medium text-gray-800">Contact Cards</h3>
              <span className="material-icons text-gray-400 text-[20px]">
                {contactCardsOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {contactCardsOpen && (
              <div className="mt-2 space-y-3">
                <div className="bg-gray-50 rounded-md p-3 text-xs">
                  <p className="font-medium text-gray-700 mb-1">RusingÂcademy Canada:</p>
                  <p className="text-[#008090]">Support Form | 514-989-1669</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3 text-xs">
                  <p className="font-medium text-gray-700 mb-1">Account Manager</p>
                  <p className="text-gray-600">Steven Lim (AMG)</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3 text-xs">
                  <p className="font-medium text-gray-700 mb-1">Pedagogical Coordinator</p>
                  <p className="text-gray-600">Moesha Paulotte</p>
                </div>
                <div className="bg-gray-50 rounded-md p-3 text-xs">
                  <p className="font-medium text-gray-700 mb-1">Coordinator</p>
                  <p className="text-gray-600">Hiba Jurdi</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Accordion */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={() => setContactOpen(!contactOpen)}
              className="flex items-center justify-between w-full py-2"
            >
              <h3 className="text-sm font-medium text-gray-800">Contact</h3>
              <span className="material-icons text-gray-400 text-[20px]">
                {contactOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {contactOpen && (
              <div className="mt-2 space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Work Email</label>
                  <input
                    type="email"
                    value="steven.barholere@rusingacademy.ca"
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Alternative Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-800" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="noAutoMsg" className="rounded border-gray-300" />
                  <label htmlFor="noAutoMsg" className="text-xs text-gray-600">Do not send me automated messages.</label>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                  <div className="flex gap-2">
                    <select className="border border-gray-300 rounded px-2 py-2 text-sm text-gray-600 bg-white w-24">
                      <option>Work</option>
                      <option>Home</option>
                      <option>Mobile</option>
                    </select>
                    <input
                      type="text"
                      value="6136147620"
                      readOnly
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Address Accordion */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={() => setAddressOpen(!addressOpen)}
              className="flex items-center justify-between w-full py-2"
            >
              <h3 className="text-sm font-medium text-gray-800">Address</h3>
              <span className="material-icons text-gray-400 text-[20px]">
                {addressOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {addressOpen && (
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Home</span>
                  <button className="text-xs text-[#008090] hover:underline">Edit</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Work</span>
                  <button className="text-xs text-[#008090] hover:underline">Edit</button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button className="bg-[#008090] text-white text-sm font-medium py-2 px-8 rounded hover:bg-[#006d7a] transition-colors">
              Save
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
