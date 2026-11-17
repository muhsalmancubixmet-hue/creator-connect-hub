/**
 * Global hierarchical location catalog (demo subset).
 * Country → Region/State/Province → District/County → City → Area.
 * Levels are optional: not every country uses every level (e.g. Singapore).
 * In production this comes from the SaaS Manager location service.
 */

export interface GeoPoint {
  country: string;
  countryCode: string;
  region?: string;
  district?: string;
  city: string;
  area?: string;
  lat: number;
  lng: number;
}

export interface LocationNode {
  name: string;
  type: "country" | "region" | "district" | "city" | "area";
  lat: number;
  lng: number;
  code?: string;
  children?: LocationNode[];
}

const city = (name: string, lat: number, lng: number): LocationNode => ({
  name,
  type: "city",
  lat,
  lng,
});

export const LOCATION_CATALOG: LocationNode[] = [
  {
    name: "India",
    type: "country",
    code: "IN",
    lat: 22.35,
    lng: 78.67,
    children: [
      {
        name: "Kerala",
        type: "region",
        lat: 10.15,
        lng: 76.4,
        children: [
          {
            name: "Ernakulam",
            type: "district",
            lat: 9.98,
            lng: 76.3,
            children: [city("Kochi", 9.9312, 76.2673)],
          },
          {
            name: "Thiruvananthapuram",
            type: "district",
            lat: 8.52,
            lng: 76.94,
            children: [city("Thiruvananthapuram", 8.5241, 76.9366)],
          },
          {
            name: "Kozhikode",
            type: "district",
            lat: 11.26,
            lng: 75.78,
            children: [city("Kozhikode", 11.2588, 75.7804)],
          },
          {
            name: "Thrissur",
            type: "district",
            lat: 10.53,
            lng: 76.21,
            children: [city("Thrissur", 10.5276, 76.2144)],
          },
          {
            name: "Wayanad",
            type: "district",
            lat: 11.69,
            lng: 76.13,
            children: [city("Kalpetta", 11.6085, 76.083)],
          },
          {
            name: "Kottayam",
            type: "district",
            lat: 9.59,
            lng: 76.52,
            children: [city("Kottayam", 9.5916, 76.5222)],
          },
          {
            name: "Kollam",
            type: "district",
            lat: 8.89,
            lng: 76.61,
            children: [city("Kollam", 8.8932, 76.6141)],
          },
          {
            name: "Alappuzha",
            type: "district",
            lat: 9.5,
            lng: 76.34,
            children: [city("Alappuzha", 9.4981, 76.3388)],
          },
          {
            name: "Palakkad",
            type: "district",
            lat: 10.79,
            lng: 76.65,
            children: [city("Palakkad", 10.7867, 76.6548)],
          },
          {
            name: "Malappuram",
            type: "district",
            lat: 11.05,
            lng: 76.07,
            children: [city("Malappuram", 11.051, 76.0711)],
          },
          {
            name: "Kannur",
            type: "district",
            lat: 11.87,
            lng: 75.37,
            children: [city("Kannur", 11.8745, 75.3704)],
          },
        ],
      },
      {
        name: "Maharashtra",
        type: "region",
        lat: 19.75,
        lng: 75.71,
        children: [city("Mumbai", 19.076, 72.8777)],
      },
      {
        name: "Karnataka",
        type: "region",
        lat: 15.32,
        lng: 75.71,
        children: [city("Bengaluru", 12.9716, 77.5946)],
      },
    ],
  },
  {
    name: "United Arab Emirates",
    type: "country",
    code: "AE",
    lat: 24.3,
    lng: 54.3,
    children: [
      {
        name: "Dubai",
        type: "region",
        lat: 25.2,
        lng: 55.27,
        children: [city("Dubai", 25.2048, 55.2708)],
      },
      {
        name: "Abu Dhabi",
        type: "region",
        lat: 24.45,
        lng: 54.38,
        children: [city("Abu Dhabi", 24.4539, 54.3773)],
      },
      {
        name: "Sharjah",
        type: "region",
        lat: 25.35,
        lng: 55.42,
        children: [city("Sharjah", 25.3463, 55.4209)],
      },
    ],
  },
  {
    name: "United Kingdom",
    type: "country",
    code: "GB",
    lat: 54,
    lng: -2,
    children: [
      {
        name: "England",
        type: "region",
        lat: 52.36,
        lng: -1.17,
        children: [city("London", 51.5072, -0.1276), city("Manchester", 53.4808, -2.2426)],
      },
    ],
  },
  {
    name: "United States",
    type: "country",
    code: "US",
    lat: 39.8,
    lng: -98.6,
    children: [
      {
        name: "New York",
        type: "region",
        lat: 42.9,
        lng: -75.5,
        children: [city("New York", 40.7128, -74.006)],
      },
      {
        name: "California",
        type: "region",
        lat: 36.8,
        lng: -119.4,
        children: [city("Los Angeles", 34.0522, -118.2437)],
      },
    ],
  },
  {
    name: "Singapore",
    type: "country",
    code: "SG",
    lat: 1.35,
    lng: 103.82,
    children: [city("Singapore", 1.3521, 103.8198)],
  },
  {
    name: "Canada",
    type: "country",
    code: "CA",
    lat: 56.1,
    lng: -106.3,
    children: [
      {
        name: "Ontario",
        type: "region",
        lat: 51.25,
        lng: -85.32,
        children: [city("Toronto", 43.6532, -79.3832)],
      },
    ],
  },
  {
    name: "France",
    type: "country",
    code: "FR",
    lat: 46.6,
    lng: 2.2,
    children: [
      {
        name: "Île-de-France",
        type: "region",
        lat: 48.85,
        lng: 2.35,
        children: [city("Paris", 48.8566, 2.3522)],
      },
    ],
  },
  {
    name: "Saudi Arabia",
    type: "country",
    code: "SA",
    lat: 23.9,
    lng: 45.1,
    children: [
      {
        name: "Riyadh Province",
        type: "region",
        lat: 24.7,
        lng: 46.7,
        children: [city("Riyadh", 24.7136, 46.6753)],
      },
    ],
  },
  {
    name: "Australia",
    type: "country",
    code: "AU",
    lat: -25.3,
    lng: 133.8,
    children: [
      {
        name: "New South Wales",
        type: "region",
        lat: -31.8,
        lng: 147,
        children: [city("Sydney", -33.8688, 151.2093)],
      },
    ],
  },
];

export interface FlatLocation {
  label: string;
  name: string;
  type: LocationNode["type"];
  path: string[];
  lat: number;
  lng: number;
}

/** Flattened catalog for search/select, e.g. "Kochi, Ernakulam, Kerala, India". */
export const FLAT_LOCATIONS: FlatLocation[] = (() => {
  const out: FlatLocation[] = [];
  const walk = (n: LocationNode, parents: string[]) => {
    const path = [...parents, n.name];
    out.push({
      label: [...path].reverse().join(", "),
      name: n.name,
      type: n.type,
      path,
      lat: n.lat,
      lng: n.lng,
    });
    n.children?.forEach((c) => walk(c, path));
  };
  LOCATION_CATALOG.forEach((c) => walk(c, []));
  return out;
})();

export const CITY_OPTIONS = FLAT_LOCATIONS.filter((l) => l.type === "city").map((l) =>
  l.path.length > 2
    ? `${l.name}, ${l.path[l.path.length - 2]}, ${l.path[0]}`
    : `${l.name}, ${l.path[0]}`,
);

/** Build a GeoPoint from a catalog city name (demo helper). */
export function geoForCity(cityName: string, area?: string): GeoPoint {
  const hit = FLAT_LOCATIONS.find((l) => l.type === "city" && l.name === cityName);
  if (!hit) throw new Error(`Unknown demo city ${cityName}`);
  const [countryName, ...rest] = hit.path;
  const country = LOCATION_CATALOG.find((c) => c.name === countryName)!;
  const levels = rest.slice(0, -1);
  const g: GeoPoint = {
    country: countryName!,
    countryCode: country.code ?? "",
    city: cityName,
    lat: hit.lat,
    lng: hit.lng,
  };
  if (levels[0]) g.region = levels[0];
  if (levels[1]) g.district = levels[1];
  if (area) g.area = area;
  return g;
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
