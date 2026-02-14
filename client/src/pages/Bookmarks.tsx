import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEM_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  lesson: { icon: "📚", label: "Lessons", color: "bg-blue-500/10 text-blue-600" },
  note: { icon: "📝", label: "Notes", color: "bg-green-500/10 text-green-600" },
  vocabulary: { icon: "📖", label: "Vocabulary", color: "bg-purple-500/10 text-purple-600" },
  discussion: { icon: "💬", label: "Discussions", color: "bg-amber-500/10 text-amber-600" },
  flashcard_deck: { icon: "🃏", label: "Flashcard Decks", color: "bg-rose-500/10 text-rose-600" },
};

export default function Bookmarks() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");

  const allBookmarks = trpc.bookmarks.getAll.useQuery();
  const removeBookmark = trpc.bookmarks.remove.useMutation({
    onSuccess: () => { toast.success("Bookmark removed"); allBookmarks.refetch(); },
  });

  const bookmarks = allBookmarks.data || [];
  const filtered = activeTab === "all" ? bookmarks : bookmarks.filter(b => b.itemType === activeTab);

  const typeCounts = bookmarks.reduce((acc, b) => {
    acc[b.itemType] = (acc[b.itemType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bookmarks & Favorites</h1>
        <p className="text-muted-foreground mt-1">Quick access to your saved content across the platform</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All ({bookmarks.length})</TabsTrigger>
          {Object.entries(ITEM_TYPE_CONFIG).map(([type, config]) => (
            typeCounts[type] ? (
              <TabsTrigger key={type} value={type}>
                {config.icon} {config.label} ({typeCounts[type]})
              </TabsTrigger>
            ) : null
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-4">
          {allBookmarks.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <div className="animate-pulse flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !filtered.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🔖</div>
                <h3 className="font-semibold">No bookmarks yet</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Save lessons, notes, vocabulary, and discussions for quick access
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map(bookmark => {
              const config = ITEM_TYPE_CONFIG[bookmark.itemType] || { icon: "📌", label: bookmark.itemType, color: "bg-muted text-muted-foreground" };
              return (
                <Card key={bookmark.id} className="hover:shadow-sm transition-all">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${config.color}`}>
                          {config.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{bookmark.itemTitle || `${config.label} #${bookmark.itemId}`}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeBookmark.mutate({ itemType: bookmark.itemType, itemId: bookmark.itemId })}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
