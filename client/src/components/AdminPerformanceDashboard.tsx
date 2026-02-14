import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { Trophy, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface AdminMetrics {
  adminId: number;
  adminName: string;
  totalReviewed: number;
  totalApproved: number;
  totalRejected: number;
  averageReviewTimeHours: number;
  approvalRate: number;
  rejectionRate: number;
}

interface AdminPerformanceDashboardProps {
  leaderboardData?: AdminMetrics[];
  selectedAdminDetails?: any;
  loading?: boolean;
  onSelectAdmin?: (adminId: number) => void;
}

export function AdminPerformanceDashboard({
  leaderboardData = [],
  selectedAdminDetails,
  loading = false,
  onSelectAdmin,
}: AdminPerformanceDashboardProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [sortBy, setSortBy] = useState<"speed" | "approvalRate" | "totalReviewed">("totalReviewed");
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">{isEn ? "Loading performance data..." : "Chargement des données de performance..."}</p>
        </div>
      </div>
    );
  }

  const sortedData = [...leaderboardData].sort((a, b) => {
    if (sortBy === "speed") {
      return a.averageReviewTimeHours - b.averageReviewTimeHours;
    } else if (sortBy === "approvalRate") {
      return b.approvalRate - a.approvalRate;
    } else {
      return b.totalReviewed - a.totalReviewed;
    }
  });

  return (
    <div className="space-y-8">
      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy size={24} className="text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              {isEn ? "Admin Leaderboard" : "Classement des administrateurs"}
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("totalReviewed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === "totalReviewed"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {isEn ? "Most Reviewed" : "Plus examinées"}
            </button>
            <button
              onClick={() => setSortBy("speed")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === "speed"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {isEn ? "Fastest" : "Plus rapides"}
            </button>
            <button
              onClick={() => setSortBy("approvalRate")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === "approvalRate"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {isEn ? "Highest Approval" : "Approbation la plus élevée"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">{isEn ? "Rank" : "Classement"}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">{isEn ? "Admin" : "Administrateur"}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">{isEn ? "Reviewed" : "Examinées"}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">{isEn ? "Approved" : "Approuvées"}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">{isEn ? "Rejected" : "Rejetées"}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">{isEn ? "Avg Time" : "Temps moyen"}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">{isEn ? "Approval Rate" : "Taux d'approbation"}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((admin, index) => (
                <tr
                  key={admin.adminId}
                  onClick={() => {
                    setSelectedAdminId(admin.adminId);
                    onSelectAdmin?.(admin.adminId);
                  }}
                  className="border-b border-gray-100 hover:bg-white cursor-pointer transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <span className="text-lg font-bold">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                      )}
                      <span className="font-semibold text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-900">{admin.adminName}</td>
                  <td className="py-4 px-4 text-center text-gray-700">{admin.totalReviewed}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {admin.totalApproved}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {admin.totalRejected}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-700">{admin.averageReviewTimeHours}h</td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-teal-600">{admin.approvalRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Admin Details */}
      {selectedAdminDetails && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {isEn ? "Performance Details" : "Détails de performance"} - {selectedAdminDetails.adminName}
          </h3>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{isEn ? "Total Reviewed" : "Total examinées"}</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {selectedAdminDetails.averages?.totalReviewed || 0}
                  </p>
                </div>
                <CheckCircle className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{isEn ? "Approval Rate" : "Taux d'approbation"}</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {selectedAdminDetails.averages?.approvalRate || 0}%
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={32} />
              </div>
            </div>

            <div className="bg-[#E7F2F2] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{isEn ? "Avg Review Time" : "Temps d'examen moyen"}</p>
                  <p className="text-3xl font-bold text-[#0F3D3E] mt-2">
                    {selectedAdminDetails.averages?.averageReviewTimeHours || 0}h
                  </p>
                </div>
                <Clock className="text-[#0F3D3E]" size={32} />
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{isEn ? "Consistency" : "Cohérence"}</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {selectedAdminDetails.monthsData?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{isEn ? "months" : "mois"}</p>
                </div>
                <AlertCircle className="text-amber-600" size={32} />
              </div>
            </div>
          </div>

          {/* Trends Chart */}
          {selectedAdminDetails.monthsData && selectedAdminDetails.monthsData.length > 0 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {isEn ? "Review Volume Trend" : "Tendance du volume d'examen"}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedAdminDetails.monthsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalReviewed"
                      stroke="#0ea5a5"
                      name={isEn ? "Total Reviewed" : "Total examinées"}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalApproved"
                      stroke="#10b981"
                      name={isEn ? "Approved" : "Approuvées"}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalRejected"
                      stroke="#ef4444"
                      name={isEn ? "Rejected" : "Rejetées"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {isEn ? "Approval Rate Trend" : "Tendance du taux d'approbation"}
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedAdminDetails.monthsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="approvalRate"
                      stroke="#10b981"
                      name={isEn ? "Approval Rate %" : "Taux d'approbation %"}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejectionRate"
                      stroke="#ef4444"
                      name={isEn ? "Rejection Rate %" : "Taux de rejet %"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
