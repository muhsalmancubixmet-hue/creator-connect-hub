import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { WorldMapProps } from "./WorldMap";

const WorldMap = lazy(() => import("./WorldMap"));

/** SSR-safe wrapper around the Leaflet world map. */
export function CreatorMap(props: WorldMapProps & { className?: string }) {
  const { className, ...rest } = props;
  const fallback = <Skeleton className="size-full rounded-none" />;
  return (
    <div className={className ?? "relative isolate h-[420px] overflow-hidden rounded-2xl"}>
      <ClientOnly fallback={fallback}>
        <Suspense fallback={fallback}>
          <WorldMap {...rest} />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
