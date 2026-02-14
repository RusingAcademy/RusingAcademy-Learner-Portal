import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export default function StudyGroups() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("browse");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cefrLevel, setCefrLevel] = useState("B1");
  const [maxMembers, setMaxMembers] = useState(10);

  const publicGroups = trpc.studyGroups.getPublic.useQuery();
  const myGroups = trpc.studyGroups.getMine.useQuery();
  const createGroup = trpc.studyGroups.create.useMutation({
    onSuccess: () => {
      toast.success("Study group created!");
      setShowCreate(false);
      setName("");
      setDescription("");
      publicGroups.refetch();
      myGroups.refetch();
    },
  });
  const joinGroup = trpc.studyGroups.join.useMutation({
    onSuccess: () => { toast.success("Joined group!"); myGroups.refetch(); publicGroups.refetch(); },
  });
  const leaveGroup = trpc.studyGroups.leave.useMutation({
    onSuccess: () => { toast.success("Left group"); myGroups.refetch(); publicGroups.refetch(); },
  });

  const myGroupIds = new Set(myGroups.data?.map(g => g.id) || []);
  const levels = ["A1", "A2", "B1", "B2", "C1"];

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Study Groups</h1>
          <p className="text-muted-foreground mt-1">Learn together with fellow public servants preparing for the SLE</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "+ Create Group"}
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle>Create a Study Group</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., SLE B2 Prep — Ottawa" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full mt-1 p-3 border rounded-lg bg-background resize-none h-24"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe your group's focus and goals..."
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-sm font-medium">CEFR Level</label>
                <div className="flex gap-2 mt-1">
                  {levels.map(l => (
                    <Button key={l} size="sm" variant={cefrLevel === l ? "default" : "outline"} onClick={() => setCefrLevel(l)}>
                      {l}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Max Members</label>
                <Input type="number" min={2} max={50} value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))} className="mt-1 w-24" />
              </div>
            </div>
            <Button onClick={() => createGroup.mutate({ name, description, cefrLevel, maxMembers })} disabled={!name.trim() || createGroup.isPending}>
              {createGroup.isPending ? "Creating..." : "Create Group"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse Groups ({publicGroups.data?.length || 0})</TabsTrigger>
          <TabsTrigger value="mine">My Groups ({myGroups.data?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {!publicGroups.data?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-semibold">No study groups yet</h3>
                <p className="text-muted-foreground text-sm mt-1">Be the first to create a study group!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicGroups.data.map(group => (
                <Card key={group.id} className="hover:shadow-md transition-all">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                        )}
                      </div>
                      <Badge>{group.cefrLevel}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Max {group.maxMembers} members
                      </span>
                      {myGroupIds.has(group.id) ? (
                        <Button size="sm" variant="outline" onClick={() => leaveGroup.mutate({ groupId: group.id })}>
                          Leave
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => joinGroup.mutate({ groupId: group.id })}>
                          Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {!myGroups.data?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="font-semibold">You haven't joined any groups yet</h3>
                <p className="text-muted-foreground text-sm mt-1">Browse public groups or create your own</p>
              </CardContent>
            </Card>
          ) : (
            myGroups.data.map(group => (
              <Card key={group.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{group.cefrLevel}</Badge>
                      <Button size="sm" variant="outline" onClick={() => leaveGroup.mutate({ groupId: group.id })}>
                        Leave
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
