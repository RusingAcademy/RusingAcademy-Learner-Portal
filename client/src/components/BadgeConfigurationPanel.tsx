import React, { useState } from "react";
import { Settings, Plus, Edit2, Trash2, Save } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface BadgeCriteria {
  id: number;
  badgeName: string;
  criteriaType: string;
  minValue?: number;
  maxValue?: number;
  targetValue?: number;
  customFormula?: string;
  isActive: boolean;
}

interface Template {
  id: number;
  name: string;
  templateType: string;
  description?: string;
  isPublic: boolean;
}

interface BadgeConfigurationPanelProps {
  badges?: BadgeCriteria[];
  templates?: Template[];
  loading?: boolean;
  onSave?: (config: any) => void;
}

export function BadgeConfigurationPanel({
  badges = [],
  templates = [],
  loading = false,
  onSave,
}: BadgeConfigurationPanelProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [activeTab, setActiveTab] = useState<"criteria" | "templates">("criteria");
  const [editingCriteria, setEditingCriteria] = useState<BadgeCriteria | null>(null);
  const [newCriteria, setNewCriteria] = useState<Partial<BadgeCriteria>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const criteriaTypes = [
    { value: "average_review_time", label: isEn ? "Average Review Time" : "Temps moyen d'examen" },
    { value: "approval_rate", label: isEn ? "Approval Rate" : "Taux d'approbation" },
    { value: "rejection_rate", label: isEn ? "Rejection Rate" : "Taux de rejet" },
    { value: "total_reviewed", label: isEn ? "Total Reviewed" : "Total examiné" },
    { value: "consistency_score", label: isEn ? "Consistency Score" : "Score de cohérence" },
    { value: "quality_score", label: isEn ? "Quality Score" : "Score de qualité" },
  ];

  const templateTypes = [
    { value: "performance_focused", label: isEn ? "Performance Focused" : "Axé sur la performance" },
    { value: "consistency_focused", label: isEn ? "Consistency Focused" : "Axé sur la cohérence" },
    { value: "quality_focused", label: isEn ? "Quality Focused" : "Axé sur la qualité" },
    { value: "balanced", label: isEn ? "Balanced" : "Équilibré" },
    { value: "custom", label: isEn ? "Custom" : "Personnalisé" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600 text-sm">{isEn ? "Loading configuration..." : "Chargement de la configuration..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-2">
          <Settings size={24} className="text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {isEn ? "Badge Configuration" : "Configuration des badges"}
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab("criteria")}
          className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
            activeTab === "criteria"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {isEn ? "Criteria" : "Critères"}
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
            activeTab === "templates"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {isEn ? "Templates" : "Modèles"}
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "criteria" && (
          <div className="space-y-6">
            {/* Existing Criteria */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isEn ? "Active Criteria" : "Critères actifs"}
              </h3>
              <div className="space-y-3">
                {badges.length === 0 ? (
                  <p className="text-gray-600">{isEn ? "No criteria configured yet" : "Aucun critère configuré"}</p>
                ) : (
                  badges.map((badge) => (
                    <div key={badge.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{badge.badgeName}</p>
                        <p className="text-sm text-gray-600">
                          {criteriaTypes.find((t) => t.value === badge.criteriaType)?.label}
                        </p>
                        <div className="mt-2 flex gap-4 text-xs text-gray-600">
                          {badge.minValue !== undefined && <span>Min: {badge.minValue}</span>}
                          {badge.maxValue !== undefined && <span>Max: {badge.maxValue}</span>}
                          {badge.targetValue !== undefined && <span>Target: {badge.targetValue}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCriteria(badge)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add New Criteria */}
            <div className="bg-teal-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus size={20} className="text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEn ? "Add New Criteria" : "Ajouter un nouveau critère"}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isEn ? "Criteria Type" : "Type de critère"}
                  </label>
                  <select
                    value={newCriteria.criteriaType || ""}
                    onChange={(e) => setNewCriteria({ ...newCriteria, criteriaType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">{isEn ? "Select type" : "Sélectionner le type"}</option>
                    {criteriaTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isEn ? "Min Value" : "Valeur min"}
                    </label>
                    <input
                      type="number"
                      value={newCriteria.minValue || ""}
                      onChange={(e) => setNewCriteria({ ...newCriteria, minValue: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isEn ? "Max Value" : "Valeur max"}
                    </label>
                    <input
                      type="number"
                      value={newCriteria.maxValue || ""}
                      onChange={(e) => setNewCriteria({ ...newCriteria, maxValue: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isEn ? "Target Value" : "Valeur cible"}
                    </label>
                    <input
                      type="number"
                      value={newCriteria.targetValue || ""}
                      onChange={(e) => setNewCriteria({ ...newCriteria, targetValue: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSave?.(newCriteria);
                    setNewCriteria({});
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                >
                  <Save size={18} />
                  {isEn ? "Save Criteria" : "Enregistrer le critère"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    {template.isPublic && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {isEn ? "Public" : "Public"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {templateTypes.find((t) => t.value === template.templateType)?.label}
                  </p>
                </div>
              ))}
            </div>

            {selectedTemplate && (
              <div className="bg-teal-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isEn ? "Apply Template" : "Appliquer le modèle"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isEn
                    ? "This will apply the selected template to all badges"
                    : "Cela appliquera le modèle sélectionné à tous les badges"}
                </p>
                <button
                  onClick={() => {
                    onSave?.({ templateId: selectedTemplate.id });
                    setSelectedTemplate(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                >
                  <Save size={18} />
                  {isEn ? "Apply Template" : "Appliquer le modèle"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
