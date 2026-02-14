import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  Users,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartmentCompliance {
  id: string;
  name: string;
  nameFr?: string;
  totalEmployees: number;
  compliant: number;
  inProgress: number;
  nonCompliant: number;
  targetDate?: Date;
}

interface TeamComplianceWidgetProps {
  departments: DepartmentCompliance[];
  organizationTarget?: number; // percentage
  language?: "en" | "fr";
  className?: string;
  onDepartmentClick?: (departmentId: string) => void;
}

export function TeamComplianceWidget({ 
  departments, 
  organizationTarget = 85,
  language = "en", 
  className,
  onDepartmentClick
}: TeamComplianceWidgetProps) {
  const labels = {
    en: {
      title: "SLE Compliance by Department",
      subtitle: "Track organizational language requirements",
      orgTarget: "Organization Target",
      compliant: "Compliant",
      inProgress: "In Progress",
      nonCompliant: "Non-Compliant",
      employees: "employees",
      overallCompliance: "Overall Compliance",
      noDepartments: "No departments configured",
    },
    fr: {
      title: "Conformité ELS par Département",
      subtitle: "Suivez les exigences linguistiques organisationnelles",
      orgTarget: "Objectif Organisationnel",
      compliant: "Conforme",
      inProgress: "En Cours",
      nonCompliant: "Non-Conforme",
      employees: "employés",
      overallCompliance: "Conformité Globale",
      noDepartments: "Aucun département configuré",
    },
  };

  const l = labels[language];

  // Calculate overall stats
  const totalEmployees = departments.reduce((sum, d) => sum + d.totalEmployees, 0);
  const totalCompliant = departments.reduce((sum, d) => sum + d.compliant, 0);
  const totalInProgress = departments.reduce((sum, d) => sum + d.inProgress, 0);
  const totalNonCompliant = departments.reduce((sum, d) => sum + d.nonCompliant, 0);
  const overallComplianceRate = totalEmployees > 0 
    ? Math.round((totalCompliant / totalEmployees) * 100) 
    : 0;

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (rate >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getComplianceBarColor = (rate: number) => {
    if (rate >= 80) return "[&>div]:bg-emerald-500";
    if (rate >= 60) return "[&>div]:bg-amber-500";
    return "[&>div]:bg-red-500";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 border-b border-violet-200/50 dark:border-violet-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20 dark:bg-violet-500/30">
              <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900 dark:text-white">{l.title}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">{l.subtitle}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-violet-600 border-violet-300 dark:text-violet-400 dark:border-violet-700">
            <Target className="h-3 w-3 mr-1" />
            {l.orgTarget}: {organizationTarget}%
          </Badge>
        </div>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
            <p className={cn("text-2xl font-bold", getComplianceColor(overallComplianceRate))}>
              {overallComplianceRate}%
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{l.overallCompliance}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalCompliant}</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{l.compliant}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{totalInProgress}</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{l.inProgress}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{totalNonCompliant}</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{l.nonCompliant}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {departments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>{l.noDepartments}</p>
          </div>
        ) : (
          departments.map((dept) => {
            const complianceRate = dept.totalEmployees > 0 
              ? Math.round((dept.compliant / dept.totalEmployees) * 100)
              : 0;
            const meetsTarget = complianceRate >= organizationTarget;
            
            return (
              <div
                key={dept.id}
                onClick={() => onDepartmentClick?.(dept.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  meetsTarget
                    ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                    : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700",
                  onDepartmentClick && "cursor-pointer hover:border-violet-300 dark:hover:border-violet-700"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {language === "fr" && dept.nameFr ? dept.nameFr : dept.name}
                    </h4>
                    {meetsTarget && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {dept.totalEmployees} {l.employees}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-2">
                  <Progress 
                    value={complianceRate} 
                    className={cn("flex-1 h-3", getComplianceBarColor(complianceRate))}
                  />
                  <span className={cn("text-sm font-bold w-12 text-right", getComplianceColor(complianceRate))}>
                    {complianceRate}%
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {dept.compliant}
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    {dept.inProgress}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <XCircle className="h-3 w-3" />
                    {dept.nonCompliant}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default TeamComplianceWidget;
