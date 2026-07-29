export type Position = [longitude: number, latitude: number];

export interface Point {
  type: "Point";
  coordinates: Position;
}

export interface Polygon {
  type: "Polygon";
  coordinates: Position[][];
}

export interface MultiPolygon {
  type: "MultiPolygon";
  coordinates: Position[][][];
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface QueryOptions {
  /** Only return features which intersect this WGS84 bounding box. */
  bounds?: BoundingBox;
  /** Only return features within a distance of these WGS84 coordinates. */
  near?: {
    location: Position;
    radiusKm: number;
  };
  /** Cancel this request with an AbortController. */
  signal?: AbortSignal;
}

export interface NearbyOptions {
  /** Search radius in kilometres. Defaults to 10. */
  radiusKm?: number;
  /** Prefer results from this country. Defaults to Canada. */
  countryCode?: string;
  /** Cancel the geocoding and outage requests. */
  signal?: AbortSignal;
}

export interface GeocodeResult {
  address: string;
  location: Point;
  score: number;
}

export interface Outage {
  objectId: number;
  caseId: number | null;
  showOnMap: boolean;
  outageTime: Date | null;
  customersOut: number | null;
  customersAffected: number | null;
  cause: string | null;
  message: string | null;
  estimatedRestorationTime: Date | null;
  location: Point;
}

export interface Crew {
  objectId: number;
  caseId: number | null;
  mappedCaseId: number | null;
  status: string | null;
  lastUpdated: Date | null;
  assigned: number | null;
  enroute: number | null;
  arrived: number | null;
  completed: number | null;
  showOnMap: boolean | null;
  location: Point;
}

export interface OutageArea {
  objectId: number;
  caseId: string | null;
  areaSquareMeters: number | null;
  perimeterMeters: number | null;
  geometry: Polygon | MultiPolygon;
}

export interface OutageSnapshot {
  outages: Outage[];
  crews: Crew[];
  outageAreas: OutageArea[];
  fetchedAt: Date;
}

export interface AlectraClientOptions {
  /** Override the service URL, useful if Alectra moves the public layers. */
  serviceUrl?: string;
  /** Override the public ArcGIS geocoder URL. */
  geocoderUrl?: string;
  /** Supply a custom fetch implementation (Node 18+, Bun, and browsers have one). */
  fetch?: typeof globalThis.fetch;
}
