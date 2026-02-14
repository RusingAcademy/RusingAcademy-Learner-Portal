import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
} from "lucide-react";

interface Note {
  id: number;
  content: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface LearnerNotesProps {
  lessonId: number;
  lessonTitle: string;
  language?: "en" | "fr";
}

export function LearnerNotes({ lessonId, lessonTitle, language = "en" }: LearnerNotesProps) {
  const isEn = language === "en";
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const storageKey = `learner_notes_${lessonId}`;
    const savedNotes = localStorage.getItem(storageKey);
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: n.updatedAt ? new Date(n.updatedAt) : undefined,
        })));
      } catch (e) {
        console.error("Failed to parse notes:", e);
      }
    }
  }, [lessonId]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      const storageKey = `learner_notes_${lessonId}`;
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  }, [notes, lessonId]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now(),
      content: newNote.trim(),
      isPinned: false,
      createdAt: new Date(),
    };

    setNotes([note, ...notes]);
    setNewNote("");
    setIsAdding(false);
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleTogglePin = (id: number) => {
    setNotes(notes.map(n =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    ).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    }));
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingId) return;

    setNotes(notes.map(n =>
      n.id === editingId
        ? { ...n, content: editContent.trim(), updatedAt: new Date() }
        : n
    ));
    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isEn ? "en-US" : "fr-FR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" aria-hidden="true" />
            {isEn ? "My Notes" : "Mes notes"}
          </CardTitle>
          {!isAdding && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {isEn ? "Add Note" : "Ajouter"}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {isEn
            ? `Notes for "${lessonTitle}"`
            : `Notes pour "${lessonTitle}"`}
        </p>
      </CardHeader>
      <CardContent>
        {/* Add Note Form */}
        {isAdding && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={isEn ? "Write your note here..." : "Écrivez votre note ici..."}
              className="mb-3 min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                }}
              >
                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                {isEn ? "Cancel" : "Annuler"}
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                {isEn ? "Save" : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8">
            <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {isEn
                ? "No notes yet. Add your first note!"
                : "Pas encore de notes. Ajoutez votre première note !"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border transition-colors ${
                  note.isPinned
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    : "bg-background hover:bg-muted/50"
                }`}
              >
                {editingId === note.id ? (
                  <div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mb-3 min-h-[80px] resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-1" aria-hidden="true" />
                        {isEn ? "Cancel" : "Annuler"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editContent.trim()}
                      >
                        <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                        {isEn ? "Save" : "Enregistrer"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {note.isPinned && (
                          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-300">
                            <Pin className="h-3 w-3 mr-1" aria-hidden="true" />
                            {isEn ? "Pinned" : "Épinglé"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTogglePin(note.id)}
                          title={note.isPinned ? (isEn ? "Unpin" : "Désépingler") : (isEn ? "Pin" : "Épingler")}
                        >
                          <Pin className={`h-4 w-4 ${note.isPinned ? "text-yellow-600" : ""}`} aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStartEdit(note)}
                          title={isEn ? "Edit" : "Modifier"}
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                          title={isEn ? "Delete" : "Supprimer"}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {note.updatedAt
                        ? `${isEn ? "Updated" : "Modifié"} ${formatDate(note.updatedAt)}`
                        : formatDate(note.createdAt)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default LearnerNotes;
