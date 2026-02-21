/**
 * AdminCourses — CMS Course Builder for Admin Control System
 * Full CRUD for Programs, Paths, Modules, Lessons with real database
 */
import AdminControlLayout from "@/components/AdminControlLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import RichTextEditor, { RichContentRenderer } from "@/components/RichTextEditor";

const ACCENT = "#dc2626";

type View = "programs" | "paths" | "modules" | "lessons" | "lesson-editor";

interface BreadcrumbItem {
  label: string;
  view: View;
  id?: number;
}

export default function AdminCourses() {
  const { lang } = useLanguage();
  const [view, setView] = useState<View>("programs");
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingItem, setEditingItem] = useState<any>(null);

  // Queries
  const statsQuery = trpc.cms.stats.overview.useQuery();
  const programsQuery = trpc.cms.programs.list.useQuery();
  const pathsQuery = trpc.cms.paths.list.useQuery(
    { programId: selectedProgramId ?? undefined },
    { enabled: view === "paths" && !!selectedProgramId }
  );
  const modulesQuery = trpc.cms.modules.list.useQuery(
    { pathId: selectedPathId! },
    { enabled: view === "modules" && !!selectedPathId }
  );
  const lessonsQuery = trpc.cms.lessons.list.useQuery(
    { moduleId: selectedModuleId! },
    { enabled: view === "lessons" && !!selectedModuleId }
  );
  const fullLessonQuery = trpc.cms.lessons.getFull.useQuery(
    { id: selectedLessonId! },
    { enabled: view === "lesson-editor" && !!selectedLessonId }
  );

  // Mutations
  const utils = trpc.useUtils();
  const createProgram = trpc.cms.programs.create.useMutation({
    onSuccess: () => { utils.cms.programs.list.invalidate(); utils.cms.stats.overview.invalidate(); setShowDialog(false); },
  });
  const updateProgram = trpc.cms.programs.update.useMutation({
    onSuccess: () => { utils.cms.programs.list.invalidate(); setShowDialog(false); },
  });
  const deleteProgram = trpc.cms.programs.delete.useMutation({
    onSuccess: () => { utils.cms.programs.list.invalidate(); utils.cms.stats.overview.invalidate(); },
  });
  const createPath = trpc.cms.paths.create.useMutation({
    onSuccess: () => { utils.cms.paths.list.invalidate(); utils.cms.stats.overview.invalidate(); setShowDialog(false); },
  });
  const updatePath = trpc.cms.paths.update.useMutation({
    onSuccess: () => { utils.cms.paths.list.invalidate(); setShowDialog(false); },
  });
  const deletePath = trpc.cms.paths.delete.useMutation({
    onSuccess: () => { utils.cms.paths.list.invalidate(); utils.cms.stats.overview.invalidate(); },
  });
  const createModule = trpc.cms.modules.create.useMutation({
    onSuccess: () => { utils.cms.modules.list.invalidate(); utils.cms.stats.overview.invalidate(); setShowDialog(false); },
  });
  const updateModule = trpc.cms.modules.update.useMutation({
    onSuccess: () => { utils.cms.modules.list.invalidate(); setShowDialog(false); },
  });
  const deleteModule = trpc.cms.modules.delete.useMutation({
    onSuccess: () => { utils.cms.modules.list.invalidate(); utils.cms.stats.overview.invalidate(); },
  });
  const createLesson = trpc.cms.lessons.create.useMutation({
    onSuccess: () => { utils.cms.lessons.list.invalidate(); utils.cms.stats.overview.invalidate(); setShowDialog(false); },
  });
  const updateLesson = trpc.cms.lessons.update.useMutation({
    onSuccess: () => { utils.cms.lessons.list.invalidate(); setShowDialog(false); },
  });
  const deleteLesson = trpc.cms.lessons.delete.useMutation({
    onSuccess: () => { utils.cms.lessons.list.invalidate(); utils.cms.stats.overview.invalidate(); },
  });

  // Slot mutations
  const createSlot = trpc.cms.slots.create.useMutation({
    onSuccess: () => { utils.cms.lessons.getFull.invalidate(); },
  });
  const updateSlot = trpc.cms.slots.update.useMutation({
    onSuccess: () => { utils.cms.lessons.getFull.invalidate(); },
  });
  const deleteSlot = trpc.cms.slots.delete.useMutation({
    onSuccess: () => { utils.cms.lessons.getFull.invalidate(); },
  });

  // Quiz mutations
  const createQuiz = trpc.cms.quizzes.create.useMutation({
    onSuccess: () => { utils.cms.lessons.getFull.invalidate(); },
  });
  const createQuestion = trpc.cms.questions.create.useMutation({
    onSuccess: () => { utils.cms.lessons.getFull.invalidate(); },
  });
  const updateQuestion = trpc.cms.questions.update.useMutation({
    onSuccess: () => { utils.cms.lessons.getFull.invalidate(); },
  });
  const deleteQuestion = trpc.cms.questions.delete.useMutation({
    onSuccess: () => { utils.cms.lessons.getFull.invalidate(); },
  });

  // Workflow status mutation
  const updateStatus = trpc.cms.workflow.updateStatus.useMutation({
    onSuccess: () => {
      utils.cms.programs.list.invalidate();
      utils.cms.paths.list.invalidate();
      utils.cms.modules.list.invalidate();
      utils.cms.lessons.list.invalidate();
    },
  });

  const handleStatusChange = (entityType: "program" | "path" | "module" | "lesson", item: any, status: string) => {
    updateStatus.mutate({ entityType, id: item.id, status: status as any });
  };

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: lang === "fr" ? "Programmes" : "Programs", view: "programs" }];
    if (view !== "programs" && selectedProgramId) {
      const prog = programsQuery.data?.find((p: any) => p.id === selectedProgramId);
      items.push({ label: prog?.title ?? `Program #${selectedProgramId}`, view: "paths", id: selectedProgramId });
    }
    if ((view === "modules" || view === "lessons" || view === "lesson-editor") && selectedPathId) {
      const path = pathsQuery.data?.find((p: any) => p.id === selectedPathId);
      items.push({ label: path?.title ?? `Path #${selectedPathId}`, view: "modules", id: selectedPathId });
    }
    if ((view === "lessons" || view === "lesson-editor") && selectedModuleId) {
      const mod = modulesQuery.data?.find((m: any) => m.id === selectedModuleId);
      items.push({ label: mod?.title ?? `Module #${selectedModuleId}`, view: "lessons", id: selectedModuleId });
    }
    if (view === "lesson-editor" && selectedLessonId) {
      const lesson = fullLessonQuery.data;
      items.push({ label: lesson?.title ?? `Lesson #${selectedLessonId}`, view: "lesson-editor", id: selectedLessonId });
    }
    return items;
  }, [view, selectedProgramId, selectedPathId, selectedModuleId, selectedLessonId, programsQuery.data, pathsQuery.data, modulesQuery.data, fullLessonQuery.data, lang]);

  const navigateTo = (v: View, ids?: { programId?: number; pathId?: number; moduleId?: number; lessonId?: number }) => {
    setView(v);
    if (ids?.programId !== undefined) setSelectedProgramId(ids.programId);
    if (ids?.pathId !== undefined) setSelectedPathId(ids.pathId);
    if (ids?.moduleId !== undefined) setSelectedModuleId(ids.moduleId);
    if (ids?.lessonId !== undefined) setSelectedLessonId(ids.lessonId);
  };

  const stats = statsQuery.data;

  return (
    <AdminControlLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              {lang === "fr" ? "Constructeur de cours" : "Course Builder"}
            </h1>
            <p className="text-sm text-gray-500">
              {stats ? `${stats.programs} ${lang === "fr" ? "programmes" : "programs"} · ${stats.paths} ${lang === "fr" ? "parcours" : "paths"} · ${stats.lessons} ${lang === "fr" ? "leçons" : "lessons"} · ${stats.quizzes} quizzes` : "Loading..."}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "category", label: lang === "fr" ? "Programmes" : "Programs", value: stats?.programs ?? 0 },
            { icon: "route", label: lang === "fr" ? "Parcours" : "Paths", value: stats?.paths ?? 0 },
            { icon: "menu_book", label: lang === "fr" ? "Leçons" : "Lessons", value: stats?.lessons ?? 0 },
            { icon: "quiz", label: "Quizzes", value: stats?.quizzes ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${ACCENT}10` }}>
                <span className="material-icons text-lg" style={{ color: ACCENT }}>{s.icon}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-4 text-sm">
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="material-icons text-gray-300 text-sm">chevron_right</span>}
              <button
                onClick={() => {
                  if (bc.view === "programs") navigateTo("programs");
                  else if (bc.view === "paths") navigateTo("paths", { programId: bc.id });
                  else if (bc.view === "modules") navigateTo("modules", { pathId: bc.id });
                  else if (bc.view === "lessons") navigateTo("lessons", { moduleId: bc.id });
                }}
                className={`px-2 py-1 rounded-md transition-colors ${
                  i === breadcrumbs.length - 1 ? "font-semibold text-gray-900" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {bc.label}
              </button>
            </span>
          ))}
        </div>

        {/* Content Area */}
        {view === "programs" && (
          <ProgramsList
            programs={programsQuery.data ?? []}
            loading={programsQuery.isLoading}
            lang={lang}
            onSelect={(id: number) => navigateTo("paths", { programId: id })}
            onCreate={() => { setDialogMode("create"); setEditingItem(null); setShowDialog(true); }}
            onEdit={(item: any) => { setDialogMode("edit"); setEditingItem(item); setShowDialog(true); }}
            onDelete={(id: number) => { if (confirm(lang === "fr" ? "Supprimer ce programme ?" : "Delete this program?")) deleteProgram.mutate({ id }); }}
            onTogglePublish={(item: any) => updateProgram.mutate({ id: item.id, isPublished: !item.isPublished })}
            onStatusChange={(item: any, status: string) => handleStatusChange("program", item, status)}
          />
        )}

        {view === "paths" && (
          <PathsList
            paths={pathsQuery.data ?? []}
            loading={pathsQuery.isLoading}
            lang={lang}
            onSelect={(id: number) => navigateTo("modules", { pathId: id })}
            onCreate={() => { setDialogMode("create"); setEditingItem(null); setShowDialog(true); }}
            onEdit={(item: any) => { setDialogMode("edit"); setEditingItem(item); setShowDialog(true); }}
            onDelete={(id: number) => { if (confirm(lang === "fr" ? "Supprimer ce parcours ?" : "Delete this path?")) deletePath.mutate({ id }); }}
            onTogglePublish={(item: any) => updatePath.mutate({ id: item.id, isPublished: !item.isPublished })}
            onStatusChange={(item: any, status: string) => handleStatusChange("path", item, status)}
          />
        )}

        {view === "modules" && (
          <ModulesList
            modules={modulesQuery.data ?? []}
            loading={modulesQuery.isLoading}
            lang={lang}
            onSelect={(id: number) => navigateTo("lessons", { moduleId: id })}
            onCreate={() => { setDialogMode("create"); setEditingItem(null); setShowDialog(true); }}
            onEdit={(item: any) => { setDialogMode("edit"); setEditingItem(item); setShowDialog(true); }}
            onDelete={(id: number) => { if (confirm(lang === "fr" ? "Supprimer ce module ?" : "Delete this module?")) deleteModule.mutate({ id }); }}
            onTogglePublish={(item: any) => updateModule.mutate({ id: item.id, isPublished: !item.isPublished })}
            onStatusChange={(item: any, status: string) => handleStatusChange("module", item, status)}
          />
        )}

        {view === "lessons" && (
          <LessonsList
            lessons={lessonsQuery.data ?? []}
            loading={lessonsQuery.isLoading}
            lang={lang}
            onSelect={(id: number) => navigateTo("lesson-editor", { lessonId: id })}
            onCreate={() => { setDialogMode("create"); setEditingItem(null); setShowDialog(true); }}
            onEdit={(item: any) => { setDialogMode("edit"); setEditingItem(item); setShowDialog(true); }}
            onDelete={(id: number) => { if (confirm(lang === "fr" ? "Supprimer cette leçon ?" : "Delete this lesson?")) deleteLesson.mutate({ id }); }}
            onTogglePublish={(item: any) => updateLesson.mutate({ id: item.id, isPublished: !item.isPublished })}
            onStatusChange={(item: any, status: string) => handleStatusChange("lesson", item, status)}
          />
        )}

        {view === "lesson-editor" && fullLessonQuery.data && (
          <LessonEditor
            lesson={fullLessonQuery.data}
            lang={lang}
            onCreateSlot={(data: any) => createSlot.mutate(data)}
            onUpdateSlot={(id: number, data: any) => updateSlot.mutate({ id, ...data })}
            onDeleteSlot={(id: number) => { if (confirm("Delete this slot?")) deleteSlot.mutate({ id }); }}
            onCreateQuiz={(data: any) => createQuiz.mutate(data)}
            onCreateQuestion={(data: any) => createQuestion.mutate(data)}
            onUpdateQuestion={(id: number, data: any) => updateQuestion.mutate({ id, ...data })}
            onDeleteQuestion={(id: number) => { if (confirm("Delete this question?")) deleteQuestion.mutate({ id }); }}
          />
        )}

        {/* Create/Edit Dialog */}
        {showDialog && (
          <CrudDialog
            view={view}
            mode={dialogMode}
            item={editingItem}
            lang={lang}
            parentId={
              view === "paths" ? selectedProgramId! :
              view === "modules" ? selectedPathId! :
              view === "lessons" ? selectedModuleId! : 0
            }
            onClose={() => setShowDialog(false)}
            onSubmit={(data: any) => {
              if (view === "programs") {
                if (dialogMode === "create") createProgram.mutate(data);
                else updateProgram.mutate({ id: editingItem.id, ...data });
              } else if (view === "paths") {
                if (dialogMode === "create") createPath.mutate({ ...data, programId: selectedProgramId! });
                else updatePath.mutate({ id: editingItem.id, ...data });
              } else if (view === "modules") {
                if (dialogMode === "create") createModule.mutate({ ...data, pathId: selectedPathId! });
                else updateModule.mutate({ id: editingItem.id, ...data });
              } else if (view === "lessons") {
                if (dialogMode === "create") createLesson.mutate({ ...data, moduleId: selectedModuleId! });
                else updateLesson.mutate({ id: editingItem.id, ...data });
              }
            }}
            isLoading={createProgram.isPending || updateProgram.isPending || createPath.isPending || updatePath.isPending || createModule.isPending || updateModule.isPending || createLesson.isPending || updateLesson.isPending}
          />
        )}
      </div>
    </AdminControlLayout>
  );
}

/* ═══════════════════════ SUB-COMPONENTS ═══════════════════════ */

function EmptyState({ icon, title, subtitle, actionLabel, onAction }: { icon: string; title: string; subtitle: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
      <span className="material-icons text-5xl text-gray-200 mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      <button onClick={onAction} className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-lg shadow-sm" style={{ backgroundColor: ACCENT }}>
        <span className="material-icons text-lg">add</span>
        {actionLabel}
      </button>
    </div>
  );
}

function ListHeader({ title, count, actionLabel, onAction }: { title: string; count: number; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {title} <span className="text-sm font-normal text-gray-400">({count})</span>
      </h2>
      <button onClick={onAction} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-sm font-medium rounded-lg shadow-sm transition-colors" style={{ backgroundColor: ACCENT }}>
        <span className="material-icons text-base">add</span>
        {actionLabel}
      </button>
    </div>
  );
}

const STATUS_CONFIG = {
  draft: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: "edit_note", labelEn: "Draft", labelFr: "Brouillon" },
  review: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "rate_review", labelEn: "In Review", labelFr: "En révision" },
  published: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "check_circle", labelEn: "Published", labelFr: "Publié" },
} as const;

function StatusBadge({ status, lang, onClick }: { status?: string; lang: string; onClick?: () => void }) {
  const s = (status && status in STATUS_CONFIG) ? status as keyof typeof STATUS_CONFIG : "draft";
  const cfg = STATUS_CONFIG[s];
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
    >
      <span className="material-icons" style={{ fontSize: "12px" }}>{cfg.icon}</span>
      {lang === "fr" ? cfg.labelFr : cfg.labelEn}
    </button>
  );
}

function StatusDropdown({ currentStatus, lang, onSelect }: { currentStatus: string; lang: string; onSelect: (status: string) => void }) {
  const [open, setOpen] = useState(false);
  const statuses = ["draft", "review", "published"] as const;
  return (
    <div className="relative">
      <StatusBadge status={currentStatus} lang={lang} onClick={() => setOpen(!open)} />
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
          {statuses.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const isCurrent = s === currentStatus;
            return (
              <button
                key={s}
                onClick={() => { onSelect(s); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 ${isCurrent ? "font-bold" : ""}`}
              >
                <span className={`material-icons ${cfg.text}`} style={{ fontSize: "14px" }}>{cfg.icon}</span>
                <span className={cfg.text}>{lang === "fr" ? cfg.labelFr : cfg.labelEn}</span>
                {isCurrent && <span className="material-icons text-green-500 ml-auto" style={{ fontSize: "14px" }}>check</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ PROGRAMS LIST ═══════════════════════ */

function ProgramsList({ programs, loading, lang, onSelect, onCreate, onEdit, onDelete, onTogglePublish, onStatusChange }: any) {
  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!programs.length) return (
    <EmptyState
      icon="category"
      title={lang === "fr" ? "Aucun programme" : "No Programs Yet"}
      subtitle={lang === "fr" ? "Créez votre premier programme (ESL ou FSL)" : "Create your first program (ESL or FSL)"}
      actionLabel={lang === "fr" ? "Nouveau programme" : "New Program"}
      onAction={onCreate}
    />
  );
  return (
    <>
      <ListHeader title={lang === "fr" ? "Programmes" : "Programs"} count={programs.length} actionLabel={lang === "fr" ? "Nouveau" : "New"} onAction={onCreate} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {programs.map((prog: any) => (
          <div key={prog.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${prog.color || ACCENT}15` }}>
                  {prog.icon || "📚"}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 cursor-pointer hover:underline" onClick={() => onSelect(prog.id)}>
                    {prog.title}
                  </h3>
                  <p className="text-[11px] text-gray-400">{prog.slug}</p>
                </div>
              </div>
              <StatusDropdown currentStatus={prog.status || (prog.isPublished ? "published" : "draft")} lang={lang} onSelect={(s: string) => onStatusChange(prog, s)} />
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{prog.description || (lang === "fr" ? "Aucune description" : "No description")}</p>
            <div className="flex items-center justify-between">
              <button onClick={() => onSelect(prog.id)} className="text-xs font-medium hover:underline" style={{ color: ACCENT }}>
                {lang === "fr" ? "Voir les parcours →" : "View Paths →"}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => onTogglePublish(prog)} className="p-1 rounded hover:bg-gray-100 transition-colors" title={prog.isPublished ? "Unpublish" : "Publish"}>
                  <span className="material-icons text-base text-gray-400">{prog.isPublished ? "visibility_off" : "visibility"}</span>
                </button>
                <button onClick={() => onEdit(prog)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                  <span className="material-icons text-base text-gray-400">edit</span>
                </button>
                <button onClick={() => onDelete(prog.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                  <span className="material-icons text-base text-red-300 hover:text-red-500">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════ PATHS LIST ═══════════════════════ */

function PathsList({ paths, loading, lang, onSelect, onCreate, onEdit, onDelete, onTogglePublish, onStatusChange }: any) {
  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!paths.length) return (
    <EmptyState
      icon="route"
      title={lang === "fr" ? "Aucun parcours" : "No Paths Yet"}
      subtitle={lang === "fr" ? "Ajoutez un parcours à ce programme" : "Add a path to this program"}
      actionLabel={lang === "fr" ? "Nouveau parcours" : "New Path"}
      onAction={onCreate}
    />
  );
  return (
    <>
      <ListHeader title={lang === "fr" ? "Parcours" : "Paths"} count={paths.length} actionLabel={lang === "fr" ? "Nouveau" : "New"} onAction={onCreate} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paths.map((path: any) => (
          <div key={path.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${path.color || ACCENT}15`, color: path.color || ACCENT }}>
                  Path {path.number}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {path.cefrLevel}
                </span>
              </div>
              <StatusDropdown currentStatus={path.status || (path.isPublished ? "published" : "draft")} lang={lang} onSelect={(s: string) => onStatusChange(path, s)} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1 cursor-pointer hover:underline" onClick={() => onSelect(path.id)}>
              {path.title}
            </h3>
            <p className="text-[11px] text-gray-400 mb-3">{path.subtitle || path.titleFr}</p>
            <div className="flex items-center justify-between">
              <button onClick={() => onSelect(path.id)} className="text-xs font-medium hover:underline" style={{ color: ACCENT }}>
                {lang === "fr" ? "Voir les modules →" : "View Modules →"}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => onTogglePublish(path)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                  <span className="material-icons text-base text-gray-400">{path.isPublished ? "visibility_off" : "visibility"}</span>
                </button>
                <button onClick={() => onEdit(path)} className="p-1 rounded hover:bg-gray-100 transition-colors">
                  <span className="material-icons text-base text-gray-400">edit</span>
                </button>
                <button onClick={() => onDelete(path.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                  <span className="material-icons text-base text-red-300 hover:text-red-500">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════ MODULES LIST ═══════════════════════ */

function ModulesList({ modules, loading, lang, onSelect, onCreate, onEdit, onDelete, onTogglePublish, onStatusChange }: any) {
  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!modules.length) return (
    <EmptyState
      icon="view_module"
      title={lang === "fr" ? "Aucun module" : "No Modules Yet"}
      subtitle={lang === "fr" ? "Ajoutez un module à ce parcours" : "Add a module to this path"}
      actionLabel={lang === "fr" ? "Nouveau module" : "New Module"}
      onAction={onCreate}
    />
  );
  return (
    <>
      <ListHeader title="Modules" count={modules.length} actionLabel={lang === "fr" ? "Nouveau" : "New"} onAction={onCreate} />
      <div className="space-y-3">
        {modules.map((mod: any, idx: number) => (
          <div key={mod.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: ACCENT }}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 cursor-pointer hover:underline" onClick={() => onSelect(mod.id)}>
                {mod.title}
              </h3>
              <p className="text-xs text-gray-400 truncate">{mod.description || mod.titleFr}</p>
            </div>
            <StatusDropdown currentStatus={mod.status || (mod.isPublished ? "published" : "draft")} lang={lang} onSelect={(s: string) => onStatusChange(mod, s)} />
            <div className="flex items-center gap-1">
              <button onClick={() => onSelect(mod.id)} className="p-1 rounded hover:bg-gray-100">
                <span className="material-icons text-base text-gray-400">arrow_forward</span>
              </button>
              <button onClick={() => onTogglePublish(mod)} className="p-1 rounded hover:bg-gray-100">
                <span className="material-icons text-base text-gray-400">{mod.isPublished ? "visibility_off" : "visibility"}</span>
              </button>
              <button onClick={() => onEdit(mod)} className="p-1 rounded hover:bg-gray-100">
                <span className="material-icons text-base text-gray-400">edit</span>
              </button>
              <button onClick={() => onDelete(mod.id)} className="p-1 rounded hover:bg-red-50">
                <span className="material-icons text-base text-red-300 hover:text-red-500">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════ LESSONS LIST ═══════════════════════ */

function LessonsList({ lessons, loading, lang, onSelect, onCreate, onEdit, onDelete, onTogglePublish, onStatusChange }: any) {
  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!lessons.length) return (
    <EmptyState
      icon="menu_book"
      title={lang === "fr" ? "Aucune leçon" : "No Lessons Yet"}
      subtitle={lang === "fr" ? "Ajoutez une leçon à ce module" : "Add a lesson to this module"}
      actionLabel={lang === "fr" ? "Nouvelle leçon" : "New Lesson"}
      onAction={onCreate}
    />
  );
  return (
    <>
      <ListHeader title={lang === "fr" ? "Leçons" : "Lessons"} count={lessons.length} actionLabel={lang === "fr" ? "Nouvelle" : "New"} onAction={onCreate} />
      <div className="space-y-3">
        {lessons.map((lesson: any) => (
          <div key={lesson.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-amber-50 text-amber-700">
              {lesson.lessonNumber}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 cursor-pointer hover:underline" onClick={() => onSelect(lesson.id)}>
                {lesson.title}
              </h3>
              <p className="text-xs text-gray-400">{lesson.titleFr} · {lesson.duration} · {lesson.xpReward} XP</p>
            </div>
            <StatusDropdown currentStatus={lesson.status || (lesson.isPublished ? "published" : "draft")} lang={lang} onSelect={(s: string) => onStatusChange(lesson, s)} />
            <div className="flex items-center gap-1">
              <button onClick={() => onSelect(lesson.id)} className="p-1 rounded hover:bg-gray-100" title="Edit content">
                <span className="material-icons text-base" style={{ color: ACCENT }}>edit_note</span>
              </button>
              <button onClick={() => onTogglePublish(lesson)} className="p-1 rounded hover:bg-gray-100">
                <span className="material-icons text-base text-gray-400">{lesson.isPublished ? "visibility_off" : "visibility"}</span>
              </button>
              <button onClick={() => onEdit(lesson)} className="p-1 rounded hover:bg-gray-100">
                <span className="material-icons text-base text-gray-400">settings</span>
              </button>
              <button onClick={() => onDelete(lesson.id)} className="p-1 rounded hover:bg-red-50">
                <span className="material-icons text-base text-red-300 hover:text-red-500">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════ LESSON EDITOR ═══════════════════════ */

const SLOT_TYPES = ["hook", "video", "strategy", "written", "oral", "quiz", "coaching"] as const;
const SLOT_ICONS: Record<string, string> = {
  hook: "bolt", video: "videocam", strategy: "school", written: "edit_note",
  oral: "mic", quiz: "quiz", coaching: "support_agent",
};
const SLOT_COLORS: Record<string, string> = {
  hook: "#f59e0b", video: "#3b82f6", strategy: "#8b5cf6", written: "#10b981",
  oral: "#ef4444", quiz: "#f97316", coaching: "#06b6d4",
};

function LessonEditor({ lesson, lang, onCreateSlot, onUpdateSlot, onDeleteSlot, onCreateQuiz, onCreateQuestion, onUpdateQuestion, onDeleteQuestion }: any) {
  const [activeSlotTab, setActiveSlotTab] = useState<string | null>(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotFormType, setSlotFormType] = useState<string>("hook");
  const [slotFormTitle, setSlotFormTitle] = useState("");
  const [slotFormContent, setSlotFormContent] = useState("");
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);

  // Quiz form state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [questionForm, setQuestionForm] = useState({ question: "", options: ["", "", "", ""], correctAnswer: "", feedback: "" });

  const existingSlotTypes = lesson.slots?.map((s: any) => s.slotType) ?? [];

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white" style={{ backgroundColor: ACCENT }}>
            {lesson.lessonNumber}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{lesson.title}</h2>
            <p className="text-sm text-gray-400">{lesson.titleFr} · {lesson.duration} · {lesson.xpReward} XP</p>
          </div>
        </div>
      </div>

      {/* 7-Slot Structure */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-icons text-lg" style={{ color: ACCENT }}>view_week</span>
          {lang === "fr" ? "Structure à 7 créneaux" : "7-Slot Structure"}
        </h3>

        {/* Slot Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SLOT_TYPES.map(type => {
            const exists = existingSlotTypes.includes(type);
            const isActive = activeSlotTab === type;
            return (
              <button
                key={type}
                onClick={() => {
                  if (exists) { setActiveSlotTab(isActive ? null : type); setShowSlotForm(false); }
                  else { setSlotFormType(type); setSlotFormTitle(""); setSlotFormContent(""); setEditingSlotId(null); setShowSlotForm(true); setActiveSlotTab(type); }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isActive ? "text-white border-transparent shadow-sm" : exists ? "border-gray-200 text-gray-700 hover:bg-gray-50" : "border-dashed border-gray-300 text-gray-400 hover:text-gray-600"
                }`}
                style={isActive ? { backgroundColor: SLOT_COLORS[type] } : {}}
              >
                <span className="material-icons text-sm">{SLOT_ICONS[type]}</span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {exists && <span className="material-icons text-xs">check_circle</span>}
                {!exists && <span className="material-icons text-xs">add_circle_outline</span>}
              </button>
            );
          })}
        </div>

        {/* Slot Content View */}
        {activeSlotTab && !showSlotForm && lesson.slots?.filter((s: any) => s.slotType === activeSlotTab).map((slot: any) => (
          <div key={slot.id} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">{slot.title}</h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingSlotId(slot.id); setSlotFormType(slot.slotType); setSlotFormTitle(slot.title); setSlotFormContent(slot.content); setShowSlotForm(true); }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <span className="material-icons text-base text-gray-400">edit</span>
                </button>
                <button onClick={() => onDeleteSlot(slot.id)} className="p-1 rounded hover:bg-red-50">
                  <span className="material-icons text-base text-red-300 hover:text-red-500">delete</span>
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <RichContentRenderer content={slot.content} className="text-gray-600 text-xs leading-relaxed" />
            </div>
          </div>
        ))}

        {/* Slot Create/Edit Form */}
        {showSlotForm && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              {editingSlotId ? "Edit" : "Create"} {slotFormType.charAt(0).toUpperCase() + slotFormType.slice(1)} Slot
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Slot title"
                value={slotFormTitle}
                onChange={(e) => setSlotFormTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
              />
              <RichTextEditor
                content={slotFormContent}
                onChange={(html: string) => setSlotFormContent(html)}
                placeholder="Start writing lesson content..."
                minHeight="250px"
                maxHeight="500px"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!slotFormTitle || !slotFormContent) return;
                    if (editingSlotId) {
                      onUpdateSlot(editingSlotId, { title: slotFormTitle, content: slotFormContent, slotType: slotFormType });
                    } else {
                      onCreateSlot({ lessonId: lesson.id, slotType: slotFormType, title: slotFormTitle, content: slotFormContent, sortOrder: SLOT_TYPES.indexOf(slotFormType as any) });
                    }
                    setShowSlotForm(false); setEditingSlotId(null);
                  }}
                  className="px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: ACCENT }}
                >
                  {editingSlotId ? (lang === "fr" ? "Mettre à jour" : "Update") : (lang === "fr" ? "Créer" : "Create")}
                </button>
                <button onClick={() => { setShowSlotForm(false); setEditingSlotId(null); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-icons text-lg" style={{ color: ACCENT }}>quiz</span>
          {lang === "fr" ? "Quiz de la leçon" : "Lesson Quiz"}
        </h3>

        {lesson.quizzes?.length === 0 && !showQuizForm && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">{lang === "fr" ? "Aucun quiz pour cette leçon" : "No quiz for this lesson"}</p>
            <button
              onClick={() => {
                onCreateQuiz({ lessonId: lesson.id, title: `Quiz - ${lesson.lessonNumber}`, quizType: "formative" as const });
                setShowQuizForm(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-lg" style={{ backgroundColor: ACCENT }}
            >
              <span className="material-icons text-base">add</span>
              {lang === "fr" ? "Créer un quiz" : "Create Quiz"}
            </button>
          </div>
        )}

        {lesson.quizzes?.map((quiz: any) => (
          <div key={quiz.id} className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{quiz.title} · {quiz.questions?.length ?? 0} questions · {quiz.passingScore}% to pass</p>
            </div>

            {/* Questions */}
            {quiz.questions?.map((q: any, idx: number) => (
              <div key={q.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Q{idx + 1}. {q.question}</p>
                    {q.options && (
                      <div className="space-y-0.5 ml-4">
                        {(q.options as string[]).map((opt: string, oi: number) => (
                          <p key={oi} className={`text-xs ${opt === q.correctAnswer ? "text-green-600 font-medium" : "text-gray-500"}`}>
                            {String.fromCharCode(65 + oi)}. {opt} {opt === q.correctAnswer && "✓"}
                          </p>
                        ))}
                      </div>
                    )}
                    {q.feedback && <p className="text-[10px] text-gray-400 mt-1 italic">Feedback: {q.feedback}</p>}
                  </div>
                  <button onClick={() => onDeleteQuestion(q.id)} className="p-1 rounded hover:bg-red-50">
                    <span className="material-icons text-sm text-red-300 hover:text-red-500">close</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Question Form */}
            <div className="border border-dashed border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">{lang === "fr" ? "Ajouter une question" : "Add Question"}</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={lang === "fr" ? "Question..." : "Question..."}
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  {questionForm.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...questionForm.options];
                        newOpts[i] = e.target.value;
                        setQuestionForm(prev => ({ ...prev, options: newOpts }));
                      }}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                    />
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={lang === "fr" ? "Réponse correcte (texte exact)" : "Correct answer (exact text)"}
                  value={questionForm.correctAnswer}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Feedback"
                  value={questionForm.feedback}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, feedback: e.target.value }))}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg"
                />
                <button
                  onClick={() => {
                    if (!questionForm.question || !questionForm.correctAnswer) return;
                    const filteredOpts = questionForm.options.filter(o => o.trim());
                    onCreateQuestion({
                      quizId: quiz.id,
                      question: questionForm.question,
                      options: filteredOpts.length > 0 ? filteredOpts : undefined,
                      correctAnswer: questionForm.correctAnswer,
                      feedback: questionForm.feedback || undefined,
                      questionType: filteredOpts.length > 0 ? "multiple_choice" as const : "fill_in_blank" as const,
                      sortOrder: (quiz.questions?.length ?? 0),
                    });
                    setQuestionForm({ question: "", options: ["", "", "", ""], correctAnswer: "", feedback: "" });
                  }}
                  disabled={!questionForm.question || !questionForm.correctAnswer}
                  className="px-3 py-1.5 text-white text-xs font-medium rounded-lg disabled:opacity-50" style={{ backgroundColor: ACCENT }}
                >
                  {lang === "fr" ? "Ajouter" : "Add Question"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ CRUD DIALOG ═══════════════════════ */

function CrudDialog({ view, mode, item, lang, parentId, onClose, onSubmit, isLoading }: any) {
  const [form, setForm] = useState<any>(() => {
    if (mode === "edit" && item) return { ...item };
    if (view === "programs") return { slug: "", title: "", titleFr: "", description: "", descriptionFr: "", icon: "", color: "#2563eb", sortOrder: 0, isPublished: false };
    if (view === "paths") return { slug: "", number: "", title: "", titleFr: "", subtitle: "", subtitleFr: "", cefrLevel: "A1", color: "#2563eb", sortOrder: 0, isPublished: false };
    if (view === "modules") return { title: "", titleFr: "", description: "", descriptionFr: "", quizPassingScore: 80, sortOrder: 0, isPublished: false };
    if (view === "lessons") return { lessonNumber: "", title: "", titleFr: "", duration: "50 min", xpReward: 100, sortOrder: 0, isPublished: false };
    return {};
  });

  const update = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  const titles: Record<string, string> = {
    programs: mode === "edit" ? (lang === "fr" ? "Modifier le programme" : "Edit Program") : (lang === "fr" ? "Nouveau programme" : "New Program"),
    paths: mode === "edit" ? (lang === "fr" ? "Modifier le parcours" : "Edit Path") : (lang === "fr" ? "Nouveau parcours" : "New Path"),
    modules: mode === "edit" ? (lang === "fr" ? "Modifier le module" : "Edit Module") : (lang === "fr" ? "Nouveau module" : "New Module"),
    lessons: mode === "edit" ? (lang === "fr" ? "Modifier la leçon" : "Edit Lesson") : (lang === "fr" ? "Nouvelle leçon" : "New Lesson"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{titles[view]}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <span className="material-icons text-gray-400">close</span>
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {/* Program fields */}
          {view === "programs" && (
            <>
              <Field label="Slug" value={form.slug} onChange={(v: string) => update("slug", v)} placeholder="e.g., fsl" />
              <Field label="Title (EN)" value={form.title} onChange={(v: string) => update("title", v)} placeholder="French as a Second Language" />
              <Field label="Titre (FR)" value={form.titleFr} onChange={(v: string) => update("titleFr", v)} placeholder="Français langue seconde" />
              <Field label="Description (EN)" value={form.description} onChange={(v: string) => update("description", v)} textarea />
              <Field label="Description (FR)" value={form.descriptionFr} onChange={(v: string) => update("descriptionFr", v)} textarea />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Icon" value={form.icon} onChange={(v: string) => update("icon", v)} placeholder="🇫🇷" />
                <Field label="Color" value={form.color} onChange={(v: string) => update("color", v)} placeholder="#2563eb" type="color" />
              </div>
              <Field label="Sort Order" value={form.sortOrder} onChange={(v: string) => update("sortOrder", parseInt(v) || 0)} type="number" />
            </>
          )}

          {/* Path fields */}
          {view === "paths" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slug" value={form.slug} onChange={(v: string) => update("slug", v)} placeholder="fsl-path-i" />
                <Field label="Number" value={form.number} onChange={(v: string) => update("number", v)} placeholder="I" />
              </div>
              <Field label="Title (EN)" value={form.title} onChange={(v: string) => update("title", v)} placeholder="Foundations" />
              <Field label="Titre (FR)" value={form.titleFr} onChange={(v: string) => update("titleFr", v)} placeholder="Les Fondations" />
              <Field label="Subtitle (EN)" value={form.subtitle} onChange={(v: string) => update("subtitle", v)} />
              <Field label="Sous-titre (FR)" value={form.subtitleFr} onChange={(v: string) => update("subtitleFr", v)} />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">CEFR Level</label>
                  <select value={form.cefrLevel} onChange={e => update("cefrLevel", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg">
                    {["A1", "A2", "B1", "B2", "C1", "C1+"].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <Field label="Color" value={form.color} onChange={(v: string) => update("color", v)} type="color" />
                <Field label="Sort Order" value={form.sortOrder} onChange={(v: string) => update("sortOrder", parseInt(v) || 0)} type="number" />
              </div>
            </>
          )}

          {/* Module fields */}
          {view === "modules" && (
            <>
              <Field label="Title (EN)" value={form.title} onChange={(v: string) => update("title", v)} placeholder="First Professional Steps" />
              <Field label="Titre (FR)" value={form.titleFr} onChange={(v: string) => update("titleFr", v)} placeholder="Premiers Pas Professionnels" />
              <Field label="Description (EN)" value={form.description} onChange={(v: string) => update("description", v)} textarea />
              <Field label="Description (FR)" value={form.descriptionFr} onChange={(v: string) => update("descriptionFr", v)} textarea />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quiz Passing Score (%)" value={form.quizPassingScore} onChange={(v: string) => update("quizPassingScore", parseInt(v) || 80)} type="number" />
                <Field label="Sort Order" value={form.sortOrder} onChange={(v: string) => update("sortOrder", parseInt(v) || 0)} type="number" />
              </div>
            </>
          )}

          {/* Lesson fields */}
          {view === "lessons" && (
            <>
              <Field label="Lesson Number" value={form.lessonNumber} onChange={(v: string) => update("lessonNumber", v)} placeholder="1.1" />
              <Field label="Title (EN)" value={form.title} onChange={(v: string) => update("title", v)} placeholder="Hello, My Name Is..." />
              <Field label="Titre (FR)" value={form.titleFr} onChange={(v: string) => update("titleFr", v)} placeholder="Bonjour, je m'appelle..." />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Duration" value={form.duration} onChange={(v: string) => update("duration", v)} placeholder="50 min" />
                <Field label="XP Reward" value={form.xpReward} onChange={(v: string) => update("xpReward", parseInt(v) || 100)} type="number" />
                <Field label="Sort Order" value={form.sortOrder} onChange={(v: string) => update("sortOrder", parseInt(v) || 0)} type="number" />
              </div>
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            {lang === "fr" ? "Annuler" : "Cancel"}
          </button>
          <button
            onClick={() => {
              const { id, createdAt, updatedAt, createdBy, ...data } = form;
              onSubmit(data);
            }}
            disabled={isLoading}
            className="px-5 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50" style={{ backgroundColor: ACCENT }}
          >
            {isLoading ? "..." : mode === "edit" ? (lang === "fr" ? "Mettre à jour" : "Update") : (lang === "fr" ? "Créer" : "Create")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type, textarea }: { label: string; value: any; onChange: (v: string) => void; placeholder?: string; type?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      {textarea ? (
        <textarea
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
        />
      ) : type === "color" ? (
        <div className="flex items-center gap-2">
          <input type="color" value={value ?? "#2563eb"} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded border border-gray-200 cursor-pointer" />
          <input type="text" value={value ?? ""} onChange={e => onChange(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg" />
        </div>
      ) : (
        <input
          type={type || "text"}
          value={value ?? ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
        />
      )}
    </div>
  );
}
