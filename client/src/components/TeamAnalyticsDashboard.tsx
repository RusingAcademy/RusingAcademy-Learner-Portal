import React, { useState, useEffect } from "react";
import { Users, TrendingUp, BarChart3, Award } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface TeamMetrics {
  teamId: number;
  teamName: string;
  memberCount: number;
  totalApplicationsReviewed: number;
  totalApproved: number;
  teamApprovalRate: number;
  averageReviewTimeHours: number;
  performanceScore: number;
}

interface DepartmentMetrics {
  department: string;
  teamCount: number;
  totalMembers: number;
  totalApplicationsReviewed: number;
  departmentApprovalRate: number;
  averageReviewTimeHours: number;
}

interface TeamAnalyticsDashboardProps {
  teams?: TeamMetrics[];
  departments?: DepartmentMetrics[];
  loading?: boolean;
}

export function TeamAnalyticsDashboard({ teams = [], departments = [], loading = false }: TeamAnalyticsDashboardProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [selectedTeam, setSelectedTeam] = useState<TeamMetrics | null>(null);
  const [sortBy, setSortBy] = useState<"performance" | "volume" | "speed">("performance");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600 text-sm">{isEn ? "Loading analytics..." : "Chargement des analyses..."}</p>
        </div>
      </div>
    );
  }

  const sortedTeams = [...teams].sort((a, b) => {
    if (sortBy === "performance") return b.performanceScore - a.performanceScore;
    if (sortBy === "volume") return b.totalApplicationsReviewed - a.totalApplicationsReviewed;
    if (sortBy === "speed") return parseFloat(a.averageReviewTimeHours.toString()) - parseFloat(b.averageReviewTimeHours.toString());
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Department Overview */}
      {departments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users size={24} className="text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              {isEn ? "Department Overview" : "Aperçu des départements"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.department} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{dept.department}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isEn ? "Teams" : "Équipes"}:</span>
                    <span className="font-semibold text-gray-900">{dept.teamCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isEn ? "Members" : "Membres"}:</span>
                    <span className="font-semibold text-gray-900">{dept.totalMembers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isEn ? "Applications" : "Candidatures"}:</span>
                    <span className="font-semibold text-gray-900">{dept.totalApplicationsReviewed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isEn ? "Approval Rate" : "Taux d'approbation"}:</span>
                    <span className="font-semibold text-blue-600">{dept.departmentApprovalRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isEn ? "Avg Review Time" : "Temps moyen"}:</span>
                    <span className="font-semibold text-gray-900">{dept.averageReviewTimeHours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Benchmarking */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={24} className="text-green-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              {isEn ? "Team Benchmarking" : "Comparaison des équipes"}
            </h3>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="performance">{isEn ? "Performance Score" : "Score de performance"}</option>
            <option value="volume">{isEn ? "Volume" : "Volume"}</option>
            <option value="speed">{isEn ? "Speed" : "Vitesse"}</option>
          </select>
        </div>

        <div className="space-y-4">
          {sortedTeams.map((team, index) => (
            <div
              key={team.teamId}
              onClick={() => setSelectedTeam(team)}
              className="cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{team.teamName}</h4>
                    <p className="text-xs text-gray-600">{team.memberCount} {isEn ? "members" : "membres"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">{team.performanceScore}</div>
                  <p className="text-xs text-gray-600">{isEn ? "Score" : "Score"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-600">{isEn ? "Applications" : "Candidatures"}</p>
                  <p className="text-lg font-semibold text-gray-900">{team.totalApplicationsReviewed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{isEn ? "Approval Rate" : "Taux d'approbation"}</p>
                  <p className="text-lg font-semibold text-green-600">{team.teamApprovalRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{isEn ? "Avg Review Time" : "Temps moyen"}</p>
                  <p className="text-lg font-semibold text-blue-600">{team.averageReviewTimeHours}h</p>
                </div>
              </div>

              {/* Performance bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${team.performanceScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.teamName}</h2>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{isEn ? "Team Members" : "Membres de l'équipe"}</p>
                <p className="text-3xl font-bold text-blue-600">{selectedTeam.memberCount}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{isEn ? "Performance Score" : "Score de performance"}</p>
                <p className="text-3xl font-bold text-green-600">{selectedTeam.performanceScore}</p>
              </div>
              <div className="bg-[#E7F2F2] rounded-lg p-4">
                <p className="text-sm text-gray-600">{isEn ? "Applications Reviewed" : "Candidatures examinées"}</p>
                <p className="text-3xl font-bold text-[#0F3D3E]">{selectedTeam.totalApplicationsReviewed}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">{isEn ? "Approval Rate" : "Taux d'approbation"}</p>
                <p className="text-3xl font-bold text-orange-600">{selectedTeam.teamApprovalRate}%</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">{isEn ? "Performance Metrics" : "Métriques de performance"}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{isEn ? "Average Review Time" : "Temps moyen d'examen"}:</span>
                  <span className="font-semibold text-gray-900">{selectedTeam.averageReviewTimeHours} {isEn ? "hours" : "heures"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{isEn ? "Total Approved" : "Total approuvé"}:</span>
                  <span className="font-semibold text-green-600">{selectedTeam.totalApproved}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTeam(null)}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
            >
              {isEn ? "Close" : "Fermer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
