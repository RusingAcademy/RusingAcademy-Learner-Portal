import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Clock, Users } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface AnalyticsData {
  approvalStats: {
    total: number;
    approved: number;
    rejected: number;
    underReview: number;
    submitted: number;
    approvalRate: number;
  };
  reviewTime: {
    averageHours: number;
    totalReviewed: number;
  };
  languages: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    month: string;
    submitted: number;
    approved: number;
    rejected: number;
    total: number;
  }>;
  experience: Record<
    string,
    {
      count: number;
      label: string;
    }
  >;
}

interface ApplicationAnalyticsDashboardProps {
  data?: AnalyticsData;
  loading?: boolean;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
}

const COLORS = ["#0ea5a5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function ApplicationAnalyticsDashboard({
  data,
  loading = false,
  onDateRangeChange,
}: ApplicationAnalyticsDashboardProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleDateRangeChange = () => {
    if (startDate && endDate && onDateRangeChange) {
      onDateRangeChange(new Date(startDate), new Date(endDate));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">{isEn ? "Loading analytics..." : "Chargement des analyses..."}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{isEn ? "No data available" : "Aucune donnée disponible"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isEn ? "Filter by Date Range" : "Filtrer par plage de dates"}
          </h3>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEn ? "Start Date" : "Date de début"}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEn ? "End Date" : "Date de fin"}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateRangeChange}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {isEn ? "Apply" : "Appliquer"}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{isEn ? "Total Applications" : "Total des candidatures"}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.approvalStats.total}</p>
            </div>
            <Users className="text-teal-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{isEn ? "Approval Rate" : "Taux d'approbation"}</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{data.approvalStats.approvalRate}%</p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{isEn ? "Avg Review Time" : "Temps d'examen moyen"}</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{data.reviewTime.averageHours}h</p>
            </div>
            <Clock className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{isEn ? "Under Review" : "En cours d'examen"}</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{data.approvalStats.underReview}</p>
            </div>
            <div className="text-amber-600 font-bold text-2xl">⏳</div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEn ? "Application Status Distribution" : "Distribution du statut des candidatures"}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: isEn ? "Approved" : "Approuvées", value: data.approvalStats.approved },
                  { name: isEn ? "Rejected" : "Rejetées", value: data.approvalStats.rejected },
                  { name: isEn ? "Under Review" : "En cours", value: data.approvalStats.underReview },
                  { name: isEn ? "Submitted" : "Soumises", value: data.approvalStats.submitted },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isEn ? "Teaching Language Distribution" : "Distribution des langues d'enseignement"}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.languages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="language" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5a5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEn ? "Monthly Application Trends" : "Tendances mensuelles des candidatures"}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="submitted" stroke="#f59e0b" name={isEn ? "Submitted" : "Soumises"} />
            <Line type="monotone" dataKey="approved" stroke="#10b981" name={isEn ? "Approved" : "Approuvées"} />
            <Line type="monotone" dataKey="rejected" stroke="#ef4444" name={isEn ? "Rejected" : "Rejetées"} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Experience Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEn ? "Teaching Experience Distribution" : "Distribution de l'expérience d'enseignement"}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={Object.entries(data.experience).map(([key, value]) => ({
              name: value.label,
              count: value.count,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
