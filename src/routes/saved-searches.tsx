import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { AppShell, PageHeader } from "@/components/business/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatFollowers } from "@/data/mock";
import { formatMoney } from "@/lib/currency";
import {
  getBusinessSavedSearches,
  deleteBusinessSavedSearch,
  toggleSavedSearchNotify,
  type SavedSearchData,
} from "@/lib/business-api";

export const Route = createFileRoute("/saved-searches")({
  head: () => ({
    meta: [
      { title: "Saved Searches — Influencers.com Business" },
      {
        name: "description",
        content:
          "Save creator search configurations and get notified when new matching creators join.",
      },
      { property: "og:title", content: "Saved Searches — Influencers.com Business" },
      { property: "og:description", content: "Reusable creator searches with new-match alerts." },
    ],
  }),
  component: SavedSearches,
});

function SavedSearches() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: searches = [], isLoading } = useQuery({
    queryKey: ["business-saved-searches"],
    queryFn: getBusinessSavedSearches,
  });

  const toggleNotifyMutation = useMutation({
    mutationFn: async ({ id, notify }: { id: string; notify: boolean }) => {
      return await toggleSavedSearchNotify(id, notify);
    },
    onSuccess: (data) => {
      toast.success(data.detail);
      queryClient.invalidateQueries({ queryKey: ["business-saved-searches"] });
    },
    onError: (err: any) => {
      toast.error("Failed to update notification setting: " + (err.response?.data?.detail || err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string; name: string }) => {
      await deleteBusinessSavedSearch(id);
    },
    onSuccess: (_, variables) => {
      toast.success(`Saved search "${variables.name}" removed`);
      queryClient.invalidateQueries({ queryKey: ["business-saved-searches"] });
    },
    onError: (err: any) => {
      toast.error("Failed to delete saved search: " + (err.response?.data?.detail || err.message));
    },
  });

  const handleDelete = (id: string, name: string) => {
    deleteMutation.mutate({ id, name });
  };

  const handleToggleNotify = (id: string, notify: boolean) => {
    toggleNotifyMutation.mutate({ id, notify });
  };

  return (
    <AppShell>
      <PageHeader
        title="Saved Searches"
        subtitle="Reusable discovery filters with alerts for new matching creators."
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/discover">
              <Search className="size-4" /> New search
            </Link>
          </Button>
        }
      />

      {searches.length === 0 ? (
        <div className="card-elevated p-8 text-center max-w-lg mx-auto space-y-3">
          <div className="size-12 rounded-2xl bg-secondary mx-auto grid place-items-center text-muted-foreground">
            <Search className="size-6" />
          </div>
          <h3 className="font-display font-semibold text-base">No saved searches yet</h3>
          <p className="text-xs text-muted-foreground">
            Save custom creator search configurations and receive alerts as soon as new matching creators join.
          </p>
          <Button asChild className="rounded-xl mt-2">
            <Link to="/discover">Discover Creators</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {searches.map((s) => {
            const tags = Array.from(
              new Set([
                ...(s.categories || []),
                ...(s.locations || []),
                ...(s.languages || []),
                ...(s.platforms || []),
              ])
            );

            return (
              <div key={s.id} className="card-elevated p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{s.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(s.newMatches ?? 0) > 0
                        ? `${s.newMatches} new creators since you last checked`
                        : "No new matches"}
                    </p>
                  </div>
                  {(s.newMatches ?? 0) > 0 && (
                    <Badge className="rounded-full bg-accent text-accent-foreground">
                      {s.newMatches} new
                    </Badge>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tags.map((t, idx) => (
                    <Badge key={`${t}-${idx}`} variant="secondary" className="rounded-full font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>
                    Followers:{" "}
                    <span className="font-medium text-foreground">
                      {s.followers?.[0] != null ? formatFollowers(s.followers[0]) : "0"}–
                      {s.followers?.[1] != null ? formatFollowers(s.followers[1]) : "0"}
                    </span>
                  </div>
                  <div>
                    Engagement:{" "}
                    <span className="font-medium text-foreground">{s.minEngagement ?? 0}%+</span>
                  </div>
                  <div className="col-span-2">
                    Budget:{" "}
                    <span className="font-medium text-foreground">
                      {s.budget?.[0] != null ? formatMoney(s.budget[0], "INR") : "0"} –{" "}
                      {s.budget?.[1] != null ? formatMoney(s.budget[1], "INR") : "0"}
                    </span>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                  <Label
                    htmlFor={`notify-${s.id}`}
                    className="inline-flex items-center gap-2 text-sm font-normal cursor-pointer"
                  >
                    <Bell className="size-4 text-primary" /> Notify me about new matching creators
                  </Label>
                  {mounted ? (
                    <Switch
                      id={`notify-${s.id}`}
                      checked={s.notify_enabled ?? s.notify ?? true}
                      disabled={toggleNotifyMutation.isPending}
                      onCheckedChange={(checked) => handleToggleNotify(s.id, checked)}
                    />
                  ) : (
                    <div className="h-5 w-9 rounded-full bg-input" />
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button asChild className="flex-1 rounded-xl">
                    <Link to="/discover">Run search</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={deleteMutation.isPending}
                    className="rounded-xl text-destructive hover:text-destructive"
                    onClick={() => handleDelete(s.id, s.name)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
