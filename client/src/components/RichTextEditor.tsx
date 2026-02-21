/**
 * RichTextEditor — TipTap WYSIWYG editor for CMS content editing
 * Features: Bold, Italic, Underline, Headings, Lists, Links, Images, Code, Alignment
 * Design: Clean toolbar with Material Icons, matches admin theme
 */
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { useCallback, useEffect, useState } from "react";

/* ─── Toolbar Button ─── */
function ToolbarBtn({
  icon,
  label,
  isActive,
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded transition-all ${
        isActive
          ? "bg-red-100 text-red-600"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className="material-icons" style={{ fontSize: "18px" }}>
        {icon}
      </span>
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-200 mx-0.5" />;
}

/* ─── Link Dialog ─── */
function LinkDialog({
  onSubmit,
  onCancel,
  initialUrl,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl || "");
  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-200 w-64"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(url);
          if (e.key === "Escape") onCancel();
        }}
      />
      <button
        onClick={() => onSubmit(url)}
        className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
      >
        OK
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  );
}

/* ─── Image Dialog ─── */
function ImageDialog({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string, alt: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Image URL (https://...)"
        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-200 w-72"
        autoFocus
      />
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Alt text (optional)"
        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-200 w-72"
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit(url, alt);
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSubmit(url, alt)}
          className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
        >
          Insert
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Toolbar ─── */
function EditorToolbar({ editor }: { editor: Editor }) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const addLink = useCallback(
    (url: string) => {
      if (!url) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
      setShowLinkDialog(false);
    },
    [editor]
  );

  const addImage = useCallback(
    (url: string, alt: string) => {
      if (url) {
        editor.chain().focus().setImage({ src: url, alt: alt || "" }).run();
      }
      setShowImageDialog(false);
    },
    [editor]
  );

  return (
    <div className="relative border-b border-gray-200 bg-gray-50 px-2 py-1.5 flex flex-wrap items-center gap-0.5 rounded-t-lg">
      {/* Text Formatting */}
      <ToolbarBtn
        icon="format_bold"
        label="Bold (Ctrl+B)"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarBtn
        icon="format_italic"
        label="Italic (Ctrl+I)"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarBtn
        icon="format_underlined"
        label="Underline (Ctrl+U)"
        isActive={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarBtn
        icon="format_strikethrough"
        label="Strikethrough"
        isActive={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarBtn
        icon="highlight"
        label="Highlight"
        isActive={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarBtn
        icon="title"
        label="Heading 2"
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      />
      <ToolbarBtn
        icon="text_fields"
        label="Heading 3"
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
      />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarBtn
        icon="format_list_bulleted"
        label="Bullet List"
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarBtn
        icon="format_list_numbered"
        label="Numbered List"
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarBtn
        icon="format_align_left"
        label="Align Left"
        isActive={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <ToolbarBtn
        icon="format_align_center"
        label="Align Center"
        isActive={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <ToolbarBtn
        icon="format_align_right"
        label="Align Right"
        isActive={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />

      <ToolbarDivider />

      {/* Block Elements */}
      <ToolbarBtn
        icon="format_quote"
        label="Blockquote"
        isActive={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <ToolbarBtn
        icon="code"
        label="Code Block"
        isActive={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />
      <ToolbarBtn
        icon="horizontal_rule"
        label="Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      />

      <ToolbarDivider />

      {/* Link & Image */}
      <ToolbarBtn
        icon="link"
        label="Insert Link"
        isActive={editor.isActive("link")}
        onClick={() => setShowLinkDialog(!showLinkDialog)}
      />
      <ToolbarBtn
        icon="image"
        label="Insert Image"
        onClick={() => setShowImageDialog(!showImageDialog)}
      />

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarBtn
        icon="undo"
        label="Undo (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      />
      <ToolbarBtn
        icon="redo"
        label="Redo (Ctrl+Shift+Z)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      />

      {/* Dialogs */}
      {showLinkDialog && (
        <LinkDialog
          onSubmit={addLink}
          onCancel={() => setShowLinkDialog(false)}
          initialUrl={editor.getAttributes("link").href}
        />
      )}
      {showImageDialog && (
        <ImageDialog
          onSubmit={addImage}
          onCancel={() => setShowImageDialog(false)}
        />
      )}
    </div>
  );
}

/* ─── Main Editor Component ─── */
export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  minHeight = "200px",
  maxHeight = "500px",
  disabled = false,
}: {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-red-600 underline hover:text-red-800" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full mx-auto" },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Highlight.configure({
        HTMLAttributes: { class: "bg-yellow-200 px-0.5 rounded" },
      }),
    ],
    content,
    editable: !disabled,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none px-4 py-3",
        style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
      },
    },
  });

  // Sync external content changes (e.g., when switching between slots)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all ${
        disabled
          ? "border-gray-100 bg-gray-50 opacity-60"
          : "border-gray-200 bg-white focus-within:ring-2 focus-within:ring-red-200 focus-within:border-red-300"
      }`}
    >
      {!disabled && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

/* ─── Read-Only Renderer ─── */
export function RichContentRenderer({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  // If content looks like plain text (no HTML tags), wrap in <p>
  const html =
    content && !content.includes("<") ? `<p>${content}</p>` : content;

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
