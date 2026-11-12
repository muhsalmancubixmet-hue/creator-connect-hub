import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bookmark, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatFollowers, formatMoney, type Creator } from "@/data/mock";
import { toggleCreatorShortlist } from "@/lib/business-api";

export function PlatformPill({ platform }: { platform: string }) {
  return (
    <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
      {platform}
    </span>
  );
}

export function CreatorCard({
  creator,
  selectable = false,
  selected = false,
  onSelect,
  match,
}: {
  creator: Creator;
  selectable?: boolean | undefined;
  selected?: boolean | undefined;
  onSelect?: ((id: string) => void) | undefined;
  match?: number | undefined;
}) {
  const [saving, setSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    try {
      const res = await toggleCreatorShortlist(creator.id);
      toast.success(res.detail || (res.is_saved ? `${creator.name} saved to shortlist` : `${creator.name} removed from shortlist`));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update shortlist.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article
      className={cn(
        "group card-elevated hover-lift relative flex flex-col overflow-hidden",
        selected && "border-primary ring-2 ring-primary/25",
      )}
    >
      <div className="relative h-24 overflow-hidden">
        <img
          src={creator.cover}
          alt=""
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent" />
        {selectable && (
          <label className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-card/90 px-2 py-1 text-[11px] font-medium shadow-soft backdrop-blur">
            <Checkbox
              checked={selected}
              onCheckedChange={() => onSelect?.(creator.id)}
              className="size-3.5"
            />
            Compare
          </label>
        )}
        {match !== undefined && (
          <span className="absolute right-3 top-3 rounded-full gradient-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-soft">
            {match}% Match
          </span>
        )}
      </div>

      <div className="-mt-9 flex flex-1 flex-col px-5 pb-5">
        <Avatar className="size-16 rounded-2xl border-4 border-card shadow-soft">
          <AvatarImage src={creator.avatar} alt={creator.name} />
          <AvatarFallback className="rounded-2xl">{creator.name[0]}</AvatarFallback>
        </Avatar>

        <div className="mt-3 flex items-center gap-1.5">
          <h3 className="truncate font-display text-base font-semibold">{creator.name}</h3>
          {creator.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">{creator.handle}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{creator.category}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" /> {creator.location}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{creator.bio}</p>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-secondary/70 p-3 text-center">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">
              {formatFollowers(creator.followers)}
            </p>
            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              Followers
            </p>
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-success">
              {creator.engagement}%
            </p>
            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              Engage.
            </p>
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{creator.mainPlatform}</p>
            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              Platform
            </p>
          </div>
        </div>


        <div className="mt-3 flex flex-wrap gap-1.5">
          {creator.services.slice(0, 3).map((s) => (
            <Badge key={s.name} variant="secondary" className="rounded-full font-normal">
              {s.name}
            </Badge>
          ))}
        </div>

        <p className="mt-3 text-sm">
          <span className="text-muted-foreground">From </span>
          <span className="font-display font-semibold text-foreground">
            {formatMoney(creator.startingPrice, creator.currency)}
          </span>
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button asChild size="sm" className="flex-1 rounded-xl">
            <Link to="/creators/$creatorId" params={{ creatorId: creator.id }}>
              View Profile
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={saving}
            onClick={handleToggleSave}
            title="Save to shortlist"
          >
            <Bookmark className="size-4" />
            <span className="sr-only sm:not-sr-only">{saving ? "..." : "Save"}</span>
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-xl"
          >
            <Link to="/messages">
              <MessageSquare className="size-4" />
              <span className="sr-only sm:not-sr-only">Contact</span>
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function CreatorGrid({
  creators,
  selectable,
  selectedIds = [],
  onSelect,
  matches,
}: {
  creators: Creator[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  matches?: Record<string, number>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {creators.map((c) => (
        <CreatorCard
          key={c.id}
          creator={c}
          selectable={selectable}
          selected={selectedIds.includes(c.id)}
          onSelect={onSelect}
          match={matches?.[c.id]}
        />
      ))}
    </div>
  );
}
