import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3,
  Quote, Code2, Undo2, Redo2, Minus, Pilcrow,
  Link2, Unlink, Youtube as YoutubeIcon, ImagePlus, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useCallback, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ToolbarButton = ({
  onClick, active, disabled, children, title,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "h-8 w-8 inline-flex items-center justify-center rounded-lg transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:opacity-30 disabled:pointer-events-none",
          active
            ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20"
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={onClick}
      >
        {children}
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs font-medium">{title}</TooltipContent>
  </Tooltip>
);

const Divider = () => <div className="w-px h-6 bg-border/60 mx-1.5" />;

// --- URL Input Modal ---
interface UrlModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  title: string;
  description: string;
  placeholder: string;
  defaultValue?: string;
  icon: React.ReactNode;
}

const UrlModal = ({ open, onClose, onSubmit, title, description, placeholder, defaultValue = "", icon }: UrlModalProps) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl gap-0 p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <DialogHeader className="gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div>
                <DialogTitle className="text-base font-bold">{title}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-5">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={placeholder}
              className="h-11 rounded-xl text-sm"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="border-t border-border/40 bg-muted/20 px-6 py-3">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none h-10 rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!value.trim()} className="flex-1 sm:flex-none h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80">
              Insert
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Editor ---
const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [linkModal, setLinkModal] = useState(false);
  const [youtubeModal, setYoutubeModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing your article content..." }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer",
        },
      }),
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-xl overflow-hidden my-4",
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-4",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "max-w-none min-h-[280px] md:min-h-[400px] p-4 md:p-6 focus:outline-none text-foreground leading-relaxed " +
          "[&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-foreground [&_h1]:tracking-tight [&_h1]:mt-8 [&_h1]:mb-4 " +
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:tracking-tight [&_h2]:mt-6 [&_h2]:mb-3 " +
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-2 " +
          "[&_p]:text-foreground/85 [&_p]:leading-7 [&_p]:mb-3 " +
          "[&_li]:text-foreground/85 [&_li]:leading-7 " +
          "[&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:pl-6 [&_ol]:mb-4 " +
          "[&_blockquote]:border-l-3 [&_blockquote]:border-primary/40 [&_blockquote]:bg-primary/[0.03] [&_blockquote]:text-muted-foreground [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_blockquote]:py-3 [&_blockquote]:rounded-r-xl [&_blockquote]:italic [&_blockquote]:my-4 " +
          "[&_code]:bg-muted [&_code]:text-foreground [&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono " +
          "[&_pre]:bg-muted/80 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-4 [&_pre]:overflow-x-auto " +
          "[&_hr]:border-border/40 [&_hr]:my-6 " +
          "[&_iframe]:rounded-xl [&_iframe]:my-4 [&_iframe]:w-full [&_iframe]:aspect-video " +
          "[&_img]:rounded-xl [&_img]:my-4 [&_img]:max-w-full",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  const handleSetLink = useCallback((url: string) => {
    if (!editor) return;
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleAddYoutube = useCallback((url: string) => {
    if (!editor || !url) return;
    editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
  }, [editor]);

  const handleAddImage = useCallback((url: string) => {
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const currentLinkUrl = editor.getAttributes("link").href || "";

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-md premium-transition">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2.5 border-b border-border/40 bg-muted/20 backdrop-blur-sm">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
            <Bold className="w-4 h-4" strokeWidth={2.5} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph">
            <Pilcrow className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
            <Code2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => setLinkModal(true)} active={editor.isActive("link")} title="Add Link">
            <Link2 className="w-4 h-4" />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
              <Unlink className="w-4 h-4" />
            </ToolbarButton>
          )}
          <ToolbarButton onClick={() => setYoutubeModal(true)} title="Embed YouTube Video">
            <YoutubeIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => setImageModal(true)} title="Add Image URL">
            <ImagePlus className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
            <Undo2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
            <Redo2 className="w-4 h-4" />
          </ToolbarButton>

          <div className="ml-auto text-[11px] text-muted-foreground/40 font-medium tabular-nums px-2 hidden sm:block">
            {editor.getText().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        {/* Editor Area */}
        <div className="bg-card">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Modals */}
      <UrlModal
        open={linkModal}
        onClose={() => setLinkModal(false)}
        onSubmit={handleSetLink}
        title="Insert Link"
        description="Add a URL to the selected text"
        placeholder="https://example.com"
        defaultValue={currentLinkUrl}
        icon={<Link2 className="w-5 h-5 text-primary" />}
      />
      <UrlModal
        open={youtubeModal}
        onClose={() => setYoutubeModal(false)}
        onSubmit={handleAddYoutube}
        title="Embed YouTube Video"
        description="Paste a YouTube video URL"
        placeholder="https://www.youtube.com/watch?v=..."
        icon={<YoutubeIcon className="w-5 h-5 text-primary" />}
      />
      <UrlModal
        open={imageModal}
        onClose={() => setImageModal(false)}
        onSubmit={handleAddImage}
        title="Insert Image"
        description="Paste an image URL"
        placeholder="https://example.com/image.png"
        icon={<ImagePlus className="w-5 h-5 text-primary" />}
      />
    </>
  );
};

export default RichTextEditor;
