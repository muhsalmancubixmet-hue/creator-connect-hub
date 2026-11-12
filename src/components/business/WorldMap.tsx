/**
 * Reusable global creator map (Leaflet + OpenStreetMap, clustered markers).
 * Browser-only: load via React.lazy behind <ClientOnly> (see CreatorMap).
 */
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import type { Creator } from "@/data/mock";

export interface WorldMapProps {
  creators: Creator[];
  center?: { lat: number; lng: number } | null;
  radiusKm?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

function avatarIcon(c: Creator, active: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div style="width:44px;height:44px;border-radius:9999px;overflow:hidden;border:3px solid ${
      active ? "var(--accent)" : "var(--card)"
    };box-shadow:0 6px 16px rgb(0 0 0 / .25)"><img src="${c.avatar}" alt="" style="width:100%;height:100%;object-fit:cover"/></div>`,
  });
}

function FitView({ creators, center, radiusKm }: WorldMapProps) {
  const map = useMap();
  useEffect(() => {
    if (center && radiusKm) {
      map.fitBounds(L.latLng(center.lat, center.lng).toBounds(radiusKm * 2000), { maxZoom: 12 });
      return;
    }
    if (!creators.length) {
      map.setView([20, 10], 2);
      return;
    }
    const b = L.latLngBounds(creators.map((c) => [c.geo.lat, c.geo.lng] as [number, number]));
    map.fitBounds(b, { padding: [40, 40], maxZoom: 10 });
  }, [map, creators, center, radiusKm]);
  return null;
}

export default function WorldMap(props: WorldMapProps) {
  const { creators, center, radiusKm, selectedId, onSelect } = props;
  const markers = useMemo(
    () =>
      creators.map((c) => (
        <Marker
          key={c.id}
          position={[c.geo.lat, c.geo.lng]}
          icon={avatarIcon(c, c.id === selectedId)}
          eventHandlers={{ click: () => onSelect?.(c.id) }}
        >
          <Popup>
            <strong>{c.name}</strong>
            <br />
            {c.category} · {c.geo.city}, {c.geo.country}
          </Popup>
        </Marker>
      )),
    [creators, selectedId, onSelect],
  );

  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      minZoom={2}
      worldCopyJump
      scrollWheelZoom
      className="size-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup chunkedLoading>{markers}</MarkerClusterGroup>
      {center && radiusKm ? (
        <Circle
          center={[center.lat, center.lng]}
          radius={radiusKm * 1000}
          pathOptions={{ color: "var(--primary)", weight: 1.5, fillOpacity: 0.08 }}
        />
      ) : null}
      <FitView {...props} />
    </MapContainer>
  );
}
