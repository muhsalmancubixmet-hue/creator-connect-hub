import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowLeftRight,
  BadgeCheck,
  Compass,
  Loader2,
  MapPin,
  MessageSquare,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getBusinessShortlistDetail,
  getBusinessShortlists,
  removeCreatorFromShortlist,
  addCreatorToShortlist,
  type BusinessShortlist,
  type ShortlistCreatorEntry
} from "@/lib/business-api";

export const Route = createFileRoute("/shortlists/$shortlistId")({
  head: () => ({
    meta: [
      { title: "Shortlist Details — Influencers.com Business" },
      { name: "description", content: "Manage saved creators in this shortlist." },
    ],
  }),
  component: ShortlistDetail,
});

function ShortlistDetail() {
  const { shortlistId } = useParams({ from: "/shortlists/$shortlistId" });
  const queryClient = useQueryClient();

  const { data: shortlist, isLoading, error } = useQuery<BusinessShortlist>({
    queryKey: ["business-shortlist", shortlistId],
    queryFn: () => getBusinessShortlistDetail(shortlistId),
  });

  const { data: allShortlists = [] } = useQuery<BusinessShortlist[]>({
    queryKey: ["business-shortlists"],
    queryFn: getBusinessShortlists,
  });

  const removeMutation = useMutation({
    mutationFn: (creatorId: string) => removeCreatorFromShortlist(shortlistId, creatorId),
    onSuccess: () => {
      toast.success("Creator removed from shortlist.");
      queryClient.invalidateQueries({ queryKey: ["business-shortlist", shortlistId] });
      queryClient.invalidateQueries({ queryKey: ["business-shortlists"] });
    },
    onError: () => toast.error("Failed to remove creator from shortlist."),
  });

  const moveMutation = useMutation({
    mutationFn: async ({ targetShortlistId, creatorId }: { targetShortlistId: string; creatorId: string }) => {
      await addCreatorToShortlist(targetShortlistId, creatorId);
      await removeCreatorFromShortlist(shortlistId, creatorId);
    },
    onSuccess: () => {
      toast.success("Creator moved to target shortlist!");
      queryClient.invalidateQueries({ queryKey: ["business-shortlist", shortlistId] });
      queryClient.invalidateQueries({ queryKey: ["business-shortlists"] });
    },
    onError: () => toast.error("Failed to move creator."),
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (error || !shortlist) {
    return (
      <AppShell>
        <div className="p-12 text-center">
          <h2 className="font-display text-xl font-bold">Shortlist Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">This collection might have been deleted or archived.</p>
          <Button asChild className="mt-4 rounded-xl">
            <Link to="/shortlists">Back to Shortlists</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const entries: ShortlistCreatorEntry[] = shortlist.entries || [];

  return (
    <AppShell>
      <PageHeader
        title={shortlist.name}
        subtitle={shortlist.description || `${entries.length} creators saved in this collection.`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/shortlists">
                <ArrowLeft className="size-4" /> All Shortlists
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link to="/discover">
                <Compass className="size-4" /> Find More Creators
              </Link>
            </Button>
          </div>
        }
      />

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/40">
          <Sparkles className="mx-auto size-10 text-primary/60" />
          <h3 className="mt-4 font-display text-base font-semibold">No creators in this shortlist yet</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Browse creators across Kerala and click "Add to Shortlist" to organize them here.
          </p>
          <Button asChild className="mt-5 rounded-xl">
            <Link to="/discover">Discover Creators</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const avatar =
              entry.creator_avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.creator_name)}&background=E0F2FE&color=0369A1&bold=true`;

            return (
              <div key={entry.id} className="card-elevated p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <img
                    src={avatar}
                    alt={entry.creator_name}
                    className="size-20 shrink-0 rounded-2xl object-cover shadow-soft border border-border"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/creators/$creatorId"
                        params={{ creatorId: entry.creator_id }}
                        className="inline-flex items-center gap-1.5 font-display text-base font-semibold hover:text-primary"
                      >
                        {entry.creator_name}
                        {entry.creator_verified && <BadgeCheck className="size-4 text-primary" />}
                      </Link>
                      <span className="text-xs text-muted-foreground font-mono">@{entry.creator_handle}</span>
                      {entry.creator_category && (
                        <Badge variant="secondary" className="rounded-full text-xs">
                          {entry.creator_category}
                        </Badge>
                      )}
                      {(entry.tags || []).map((t) => (
                        <Badge key={t} className="rounded-full bg-accent-soft text-accent text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      <span>{entry.creator_location || "Kerala, India"}</span>
                      <span>·</span>
                      <span>Added {new Date(entry.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    </div>

                    {entry.creator_bio && (
                      <p className="mt-2 text-xs text-muted-foreground/90 line-clamp-2">
                        {entry.creator_bio}
                      </p>
                    )}

                    {entry.notes && (
                      <p className="mt-3 rounded-xl bg-secondary/60 p-2.5 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Note: </span>
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-xl">
                      <Link to="/creators/$creatorId" params={{ creatorId: entry.creator_id }}>
                        Profile
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-xl">
                      <Link to="/messages">Message</Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="rounded-xl">
                          <ArrowLeftRight className="size-4" /> Move
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl">
                        <DropdownMenuLabel className="text-xs">Move to shortlist</DropdownMenuLabel>
                        {allShortlists
                          .filter((s) => s.id !== shortlist.id)
                          .map((s) => (
                            <DropdownMenuItem
                              key={s.id}
                              onClick={() => moveMutation.mutate({ targetShortlistId: s.id, creatorId: entry.creator_id })}
                            >
                              {s.name}
                            </DropdownMenuItem>
                          ))}
                        {allShortlists.filter((s) => s.id !== shortlist.id).length === 0 && (
                          <div className="px-3 py-2 text-xs text-muted-foreground">No other shortlists</div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={removeMutation.isPending}
                      onClick={() => removeMutation.mutate(entry.creator_id)}
                      title="Remove from shortlist"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

