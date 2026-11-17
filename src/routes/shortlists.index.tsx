import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, FolderPlus, Loader2, Megaphone, Plus, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getBusinessShortlists,
  createBusinessShortlist,
  type BusinessShortlist,
} from "@/lib/business-api";

export const Route = createFileRoute("/shortlists/")({
  head: () => ({
    meta: [
      { title: "Shortlists — Influencers.com Business" },
      {
        name: "description",
        content:
          "Organise saved creators into collections for each campaign, with notes, tags and contact status.",
      },
      { property: "og:title", content: "Shortlists — Influencers.com Business" },
      { property: "og:description", content: "Your saved creator collections in one place." },
    ],
  }),
  component: Shortlists,
});

function Shortlists() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("emerald");

  const { data: shortlists = [], isLoading } = useQuery<BusinessShortlist[]>({
    queryKey: ["business-shortlists"],
    queryFn: getBusinessShortlists,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createBusinessShortlist({ name: name.trim(), description: description.trim(), color }),
    onSuccess: (newShortlist) => {
      toast.success(`Shortlist "${newShortlist.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["business-shortlists"] });
      setOpenCreate(false);
      setName("");
      setDescription("");
      setColor("emerald");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create shortlist.");
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Shortlist name is required.");
      return;
    }
    createMutation.mutate();
  };

  const COLOR_CHOICES = [
    { key: "emerald", label: "Emerald", ring: "ring-emerald-500 bg-emerald-500" },
    { key: "amber", label: "Amber", ring: "ring-amber-500 bg-amber-500" },
    { key: "rose", label: "Rose", ring: "ring-rose-500 bg-rose-500" },
    { key: "indigo", label: "Indigo", ring: "ring-indigo-500 bg-indigo-500" },
    { key: "violet", label: "Violet", ring: "ring-violet-500 bg-violet-500" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Shortlists"
        subtitle="Collections of creators saved in database for specific brand campaigns."
        actions={
          <Button className="rounded-xl" onClick={() => setOpenCreate(true)}>
            <Plus className="size-4" /> New shortlist
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shortlists.map((s) => (
            <Link
              key={s.id}
              to="/shortlists/$shortlistId"
              params={{ shortlistId: s.id }}
              className="card-elevated hover-lift flex flex-col p-5 group"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Bookmark className="size-5" />
                </span>
                <Badge variant="secondary" className="rounded-full">
                  {s.creators_count} {s.creators_count === 1 ? "creator" : "creators"}
                </Badge>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold group-hover:text-primary transition-colors">
                {s.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {s.description || "No description provided."}
              </p>

              <div className="mt-4 flex -space-x-2.5 overflow-hidden py-1">
                {s.creator_avatars && s.creator_avatars.length > 0 ? (
                  s.creator_avatars.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt=""
                      className="size-8 rounded-full border-2 border-card object-cover"
                    />
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground/70 italic">Empty collection</span>
                )}
              </div>

              <p className="mt-auto pt-4 text-xs text-muted-foreground">
                Updated{" "}
                {s.updated_at
                  ? new Date(s.updated_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently"}
              </p>
            </Link>
          ))}

          <button
            onClick={() => setOpenCreate(true)}
            className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
          >
            <FolderPlus className="size-7" />
            <span className="mt-2 text-sm font-semibold">Create a new collection</span>
            <span className="text-xs text-muted-foreground mt-0.5">
              Organize creators for your campaign
            </span>
          </button>
        </div>
      )}

      {/* Create Shortlist Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Shortlist</DialogTitle>
            <DialogDescription>
              Create a custom collection folder to organize and bookmark creators.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Shortlist Name *</label>
              <Input
                placeholder="e.g. Kerala Food Vlogs, Tech Reviewers..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Description (Optional)
              </label>
              <Textarea
                placeholder="Brief notes about the goals of this collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1.5 resize-none text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Theme Color</label>
              <div className="mt-2 flex gap-3">
                {COLOR_CHOICES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setColor(c.key)}
                    className={`size-7 rounded-full ${c.ring} transition-transform ${
                      color === c.key
                        ? "scale-125 ring-2 ring-offset-2 ring-primary"
                        : "opacity-75 hover:opacity-100"
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
                {createMutation.isPending ? "Creating..." : "Create Shortlist"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
