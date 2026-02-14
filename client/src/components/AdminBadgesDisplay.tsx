import React, { useState } from "react";
import { Award, Zap, Target, TrendingUp, Lock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface Badge {
  id: number;
  badgeName: string;
  badgeIcon: string;
  badgeColor: string;
  badgeTier: "bronze" | "silver" | "gold" | "platinum";
  achievedAt: string;
  value?: number;
}

interface Milestone {
  id: number;
  badgeName: string;
  badgeIcon: string;
  currentValue: string;
  targetValue: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: string;
}

interface AdminBadgesDisplayProps {
  achievements?: Badge[];
  milestones?: Milestone[];
  loading?: boolean;
}

export function AdminBadgesDisplay({ achievements = [], milestones = [], loading = false }: AdminBadgesDisplayProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const tierColors = {
    bronze: { bg: "#cd7f32", light: "#f5e6d3" },
    silver: { bg: "#c0c0c0", light: "#f0f0f0" },
    gold: { bg: "#fbbf24", light: "#fef3c7" },
    platinum: { bg: "#e5e7eb", light: "#f9fafb" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600 text-sm">{isEn ? "Loading badges..." : "Chargement des badges..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Achievements Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award size={24} className="text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-900">
            {isEn ? "Achievements" : "Réalisations"}
          </h3>
          <span className="ml-auto text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            {achievements.length}
          </span>
        </div>

        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <Award size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">{isEn ? "No badges earned yet. Keep up the great work!" : "Pas encore de badges gagnés. Continuez le bon travail !"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="cursor-pointer transform transition-transform hover:scale-105"
              >
                <div
                  className="rounded-lg p-4 text-center"
                  style={{ backgroundColor: tierColors[badge.badgeTier].light }}
                >
                  <div className="text-4xl mb-2">{badge.badgeIcon}</div>
                  <p className="text-sm font-semibold text-gray-900">{badge.badgeName}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(badge.achievedAt).toLocaleDateString(isEn ? "en-US" : "fr-FR")}
                  </p>
                  <div
                    className="inline-block mt-2 px-2 py-1 rounded text-xs font-bold text-white"
                    style={{ backgroundColor: tierColors[badge.badgeTier].bg }}
                  >
                    {badge.badgeTier.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones Section */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <Target size={24} className="text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900">
              {isEn ? "Progress Milestones" : "Jalons de progression"}
            </h3>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{milestone.badgeIcon}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{milestone.badgeName}</p>
                      <p className="text-sm text-gray-600">
                        {Math.round(parseFloat(milestone.currentValue || "0"))} / {milestone.targetValue}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-600">{milestone.progressPercentage}%</p>
                    {milestone.isCompleted && (
                      <p className="text-xs text-green-600 font-semibold">{isEn ? "Completed" : "Complété"}</p>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-teal-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${milestone.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedBadge.badgeIcon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBadge.badgeName}</h2>
              <div
                className="inline-block px-4 py-2 rounded-full text-white font-bold mb-4"
                style={{ backgroundColor: tierColors[selectedBadge.badgeTier].bg }}
              >
                {selectedBadge.badgeTier.toUpperCase()}
              </div>
              <p className="text-gray-600 mb-6">
                {isEn ? "Earned on" : "Gagné le"} {new Date(selectedBadge.achievedAt).toLocaleDateString(isEn ? "en-US" : "fr-FR")}
              </p>
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                {isEn ? "Close" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Enhanced leaderboard with badges
 */
export function EnhancedLeaderboard({
  leaderboardData = [],
  adminAchievements = {},
}: {
  leaderboardData: any[];
  adminAchievements: Record<number, Badge[]>;
}) {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">{isEn ? "Admin Leaderboard" : "Classement des administrateurs"}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">{isEn ? "Rank" : "Classement"}</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">{isEn ? "Admin" : "Administrateur"}</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">{isEn ? "Reviews" : "Examens"}</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">{isEn ? "Badges" : "Badges"}</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">{isEn ? "Top Badge" : "Meilleur badge"}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((admin, index) => {
              const badges = adminAchievements[admin.adminId] || [];
              const topBadge = badges[0];

              return (
                <tr key={admin.adminId} className="border-b border-gray-100 hover:bg-white">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {index < 3 && <span className="text-lg">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>}
                      <span className="font-semibold text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-gray-900">{admin.adminName}</td>
                  <td className="py-4 px-4 text-center text-gray-700">{admin.totalReviewed}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {badges.length}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {topBadge ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{topBadge.badgeIcon}</span>
                        <span className="text-sm text-gray-700">{topBadge.badgeName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">{isEn ? "No badges yet" : "Pas encore de badges"}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
