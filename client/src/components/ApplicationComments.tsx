import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Lock, Trash2, Edit2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface Comment {
  id: number;
  content: string;
  userName: string;
  userRole: string;
  isInternal: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface ApplicationCommentsProps {
  applicationId: number;
  comments?: Comment[];
  loading?: boolean;
  isAdmin?: boolean;
  onAddComment?: (content: string, isInternal: boolean, parentCommentId?: number) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
  onUpdateComment?: (commentId: number, content: string) => Promise<void>;
}

export function ApplicationComments({
  applicationId,
  comments = [],
  loading = false,
  isAdmin = false,
  onAddComment,
  onDeleteComment,
  onUpdateComment,
}: ApplicationCommentsProps) {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    try {
      await onAddComment(newComment, isInternal, replyingTo || undefined);
      setNewComment("");
      setIsInternal(false);
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!onDeleteComment) return;

    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim() || !onUpdateComment) return;

    try {
      await onUpdateComment(commentId, editContent);
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600 text-sm">{isEn ? "Loading comments..." : "Chargement des commentaires..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={20} className="text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isEn ? "Comments & Notes" : "Commentaires et notes"}
          </h3>
          <span className="ml-auto text-sm text-gray-600">{comments.length}</span>
        </div>

        {/* Comments List */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {isEn ? "No comments yet. Be the first to comment!" : "Pas encore de commentaires. Soyez le premier à commenter !"}
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  isAdmin={isAdmin}
                  onReply={() => setReplyingTo(comment.id)}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onEdit={(id, content) => {
                    setEditingId(id);
                    setEditContent(content);
                  }}
                  onUpdate={handleUpdateComment}
                  editingId={editingId}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Comment Form */}
        <div className="border-t border-gray-200 pt-6">
          <div className="space-y-4">
            {replyingTo && (
              <div className="flex items-center gap-2 text-sm text-teal-600 bg-teal-50 p-3 rounded-lg">
                <MessageSquare size={16} />
                <span>
                  {isEn ? "Replying to comment" : "Répondre au commentaire"}
                </span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="ml-auto text-teal-600 hover:text-teal-700 font-medium"
                >
                  {isEn ? "Cancel" : "Annuler"}
                </button>
              </div>
            )}

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isEn ? "Add a comment..." : "Ajouter un commentaire..."}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={3}
            />

            <div className="flex items-center justify-between">
              {isAdmin && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <Lock size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {isEn ? "Internal note (admin only)" : "Note interne (admins uniquement)"}
                  </span>
                </label>
              )}

              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Send size={16} />
                {isEn ? "Post Comment" : "Publier le commentaire"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual comment thread component
 */
function CommentThread({
  comment,
  isAdmin,
  onReply,
  onDelete,
  onEdit,
  onUpdate,
  editingId,
  editContent,
  setEditContent,
  language,
}: {
  comment: Comment;
  isAdmin: boolean;
  onReply: () => void;
  onDelete: () => void;
  onEdit: (id: number, content: string) => void;
  onUpdate: (id: number, content: string) => Promise<void>;
  editingId: number | null;
  editContent: string;
  setEditContent: (content: string) => void;
  language: string;
}) {
  const isEn = language === "en";
  const isEditing = editingId === comment.id;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center text-sm font-semibold text-teal-700">
              {comment.userName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-medium text-gray-900">{comment.userName}</p>
              <p className="text-xs text-gray-600">
                {new Date(comment.createdAt).toLocaleDateString(isEn ? "en-US" : "fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comment.isInternal && isAdmin && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                <Lock size={12} />
                {isEn ? "Internal" : "Interne"}
              </span>
            )}

            {isAdmin && (
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(comment.id, comment.content)}
                  className="p-1 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded"
                  title={isEn ? "Edit" : "Modifier"}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                  title={isEn ? "Delete" : "Supprimer"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(comment.id, editContent)}
                className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
              >
                {isEn ? "Save" : "Enregistrer"}
              </button>
              <button
                onClick={() => setEditContent("")}
                className="px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
              >
                {isEn ? "Cancel" : "Annuler"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        )}

        <button
          onClick={onReply}
          className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
        >
          {isEn ? "Reply" : "Répondre"}
        </button>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              isAdmin={isAdmin}
              onReply={onReply}
              onDelete={() => onDelete()}
              onEdit={onEdit}
              onUpdate={onUpdate}
              editingId={editingId}
              editContent={editContent}
              setEditContent={setEditContent}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  );
}
