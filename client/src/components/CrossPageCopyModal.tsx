/**
 * CrossPageCopyModal — Copy or Move a section to another CMS page
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Copy, ArrowRight, Loader2, FileText } from "lucide-react";

interface CrossPageCopyModalProps {
  open: boolean;
  onClose: () => void;
  sectionId: number;
  sectionTitle: string;
  currentPageId: number;
  onSuccess: () => void;
}

export default function CrossPageCopyModal({ open, onClose, sectionId, sectionTitle, currentPageId, onSuccess }: CrossPageCopyModalProps) {
  const [targetPageId, setTargetPageId] = useState<string>("");
  const [mode, setMode] = useState<"copy" | "move">("copy");

  const pagesQuery = trpc.crossPage.listPages.useQuery(undefined, { enabled: open });
  const copyMut = trpc.crossPage.copySection.useMutation({
    onSuccess: () => {
      toast.success(`Section copied successfully`);
      onSuccess();
      handleClose();
    },
    onError: (err) => toast.error(err.message),
  });
  const moveMut = trpc.crossPage.moveSection.useMutation({
    onSuccess: () => {
      toast.success(`Section moved successfully`);
      onSuccess();
      handleClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleClose = () => {
    setTargetPageId("");
    setMode("copy");
    onClose();
  };

  const handleSubmit = () => {
    if (!targetPageId) {
      toast.error("Please select a target page");
      return;
    }
    const pageIdNum = parseInt(targetPageId);
    if (mode === "copy") {
      copyMut.mutate({ sectionId, targetPageId: pageIdNum });
    } else {
      moveMut.mutate({ sectionId, targetPageId: pageIdNum });
    }
  };

  const isPending = copyMut.isPending || moveMut.isPending;
  const availablePages = (pagesQuery.data || []).filter((p: any) => p.id !== currentPageId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {mode === "copy" ? <Copy className="h-4 w-4 text-indigo-500" /> : <ArrowRight className="h-4 w-4 text-orange-500" />}
            {mode === "copy" ? "Copy" : "Move"} Section to Another Page
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Section</p>
            <p className="text-sm font-medium truncate">{sectionTitle || "Untitled Section"}</p>
          </div>

          {/* Mode selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Action</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("copy")}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  mode === "copy" ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Copy className={`h-4 w-4 ${mode === "copy" ? "text-indigo-500" : "text-gray-400"}`} />
                <div className="text-left">
                  <p className="font-medium">Copy</p>
                  <p className="text-[10px] text-gray-500">Duplicate to target</p>
                </div>
              </button>
              <button
                onClick={() => setMode("move")}
                className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-all ${
                  mode === "move" ? "border-orange-500 bg-orange-50 ring-1 ring-orange-200" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <ArrowRight className={`h-4 w-4 ${mode === "move" ? "text-orange-500" : "text-gray-400"}`} />
                <div className="text-left">
                  <p className="font-medium">Move</p>
                  <p className="text-[10px] text-gray-500">Remove from current</p>
                </div>
              </button>
            </div>
          </div>

          {/* Target page selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Target Page</Label>
            {pagesQuery.isLoading ? (
              <div className="flex items-center gap-2 p-3 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading pages...
              </div>
            ) : availablePages.length === 0 ? (
              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
                No other pages available. Create another CMS page first.
              </div>
            ) : (
              <Select value={targetPageId} onValueChange={setTargetPageId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select a page..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePages.map((page: any) => (
                    <SelectItem key={page.id} value={page.id.toString()}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span>{page.title || page.slug}</span>
                        <span className="text-[10px] text-gray-400 ml-1">({page.status})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {mode === "move" && (
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
              <p className="font-medium mb-0.5">Warning</p>
              <p>Moving will remove this section from the current page and add it to the target page.</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!targetPageId || isPending}
            className={mode === "move" ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
            {mode === "copy" ? "Copy Section" : "Move Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
