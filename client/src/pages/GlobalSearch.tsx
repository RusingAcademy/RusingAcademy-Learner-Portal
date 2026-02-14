import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function GlobalSearch() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [debouncedQuery] = useState(() => query);
  const searchEnabled = query.trim().length >= 2;

  const results = trpc.search.global.useQuery(
    { query: query.trim() },
    { enabled: searchEnabled }
  );

  const data = results.data;
  const totalResults = (data?.notes?.length || 0) + (data?.vocabulary?.length || 0) + (data?.discussions?.length || 0);

  const allResults = useMemo(() => {
    if (!data) return [];
    return [
      ...data.notes.map((n: any) => ({ ...n, type: "note" as const, icon: "📝", label: "Note" })),
      ...data.vocabulary.map((v: any) => ({ ...v, type: "vocabulary" as const, icon: "📖", label: "Vocabulary" })),
      ...data.discussions.map((d: any) => ({ ...d, type: "discussion" as const, icon: "💬", label: "Discussion" })),
    ];
  }, [data]);

  const filtered = activeTab === "all" ? allResults : allResults.filter(r => r.type === activeTab);

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Search</h1>
        <p className="text-muted-foreground mt-1">Search across all your content — notes, vocabulary, and discussions</p>
      </div>

      <div className="relative">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search notes, vocabulary, discussions..."
          className="text-lg h-12 pl-12"
          autoFocus
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
      </div>

      {searchEnabled && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.isLoading ? "Searching..." : `${totalResults} results found`}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
              {data?.notes?.length ? <TabsTrigger value="note">Notes ({data.notes.length})</TabsTrigger> : null}
              {data?.vocabulary?.length ? <TabsTrigger value="vocabulary">Vocabulary ({data.vocabulary.length})</TabsTrigger> : null}
              {data?.discussions?.length ? <TabsTrigger value="discussion">Discussions ({data.discussions.length})</TabsTrigger> : null}
            </TabsList>

            <TabsContent value={activeTab} className="space-y-3 mt-4">
              {results.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardContent className="py-4">
                        <div className="animate-pulse flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-2/5" />
                            <div className="h-3 bg-muted rounded w-3/5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !filtered.length ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="font-semibold">No results found</h3>
                    <p className="text-muted-foreground text-sm mt-1">Try a different search term</p>
                  </CardContent>
                </Card>
              ) : (
                filtered.map((item, i) => (
                  <Card key={`${item.type}-${item.id || i}`} className="hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">
                              {item.type === "note" ? item.title :
                               item.type === "vocabulary" ? item.word :
                               item.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs shrink-0">{item.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.type === "note" ? (item.content?.substring(0, 150) + "...") :
                             item.type === "vocabulary" ? `${item.translation} — ${item.definition || ""}` :
                             item.content?.substring(0, 150) + "..."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {!searchEnabled && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold">Start typing to search</h3>
            <p className="text-muted-foreground mt-1">Search across your notes, vocabulary, and community discussions</p>
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery("grammar")}>grammar</Badge>
              <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery("vocabulary")}>vocabulary</Badge>
              <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery("SLE")}>SLE</Badge>
              <Badge variant="outline" className="cursor-pointer" onClick={() => setQuery("conjugation")}>conjugation</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
