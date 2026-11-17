import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { FLAT_LOCATIONS } from "@/data/geo";
import { cn } from "@/lib/utils";
import { searchTaxonomyLocations } from "@/lib/business-api";

export interface PickedLocation {
  label: string;
  lat: number;
  lng: number;
  type: string;
}

/**
 * Global location search: demo catalog matches first, then worldwide
 * OpenStreetMap (Nominatim) results — countries, regions, cities, areas, postcodes.
 */
export function LocationSearch({
  value,
  onSelect,
  placeholder = "Search any city, region or country…",
  className,
}: {
  value: PickedLocation | null;
  onSelect: (loc: PickedLocation | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState<PickedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const local: PickedLocation[] =
    q.trim().length > 0
      ? FLAT_LOCATIONS.filter((l) => l.label.toLowerCase().includes(q.trim().toLowerCase()))
          .slice(0, 5)
          .map((l) => ({ label: l.label, lat: l.lat, lng: l.lng, type: l.type }))
      : [];

  useEffect(() => {
    const term = q.trim();
    if (term.length < 3) {
      setRemote([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const backendLocations = await searchTaxonomyLocations(term);
        if (backendLocations && backendLocations.length > 0) {
          setRemote(
            backendLocations.map((d: any) => ({
              label: d.full_path || `${d.name}, ${d.parent_name || ""}`,
              lat: Number(d.latitude || 0),
              lng: Number(d.longitude || 0),
              type: d.type || "city",
            })),
          );
        } else {
          setRemote([]);
        }
      } catch {
        if (!ctrl.signal.aborted) setRemote([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const seen = new Set(local.map((l) => l.label.split(",")[0]));
  const results = [...local, ...remote.filter((r) => !seen.has(r.label.split(",")[0]))];

  if (value) {
    return (
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 text-sm",
          className,
        )}
      >
        <MapPin className="size-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate font-medium">{value.label}</span>
        <button
          type="button"
          aria-label="Clear location"
          className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
          onClick={() => onSelect(null)}
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-label="Search location"
        className="h-11 rounded-xl border-transparent bg-secondary/60 pl-9 pr-9"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
      {open && q.trim() && (
        <div className="absolute z-[1100] mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lift">
          {results.length ? (
            results.map((r) => (
              <button
                key={`${r.label}-${r.lat}`}
                type="button"
                className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-secondary"
                onClick={() => {
                  onSelect(r);
                  setQ("");
                  setOpen(false);
                }}
              >
                <Search className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1">{r.label}</span>
                  <span className="text-[11px] capitalize text-muted-foreground">{r.type}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              {loading ? "Searching worldwide…" : "No places found"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
