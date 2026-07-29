import {
  ALECTRA_OUTAGE_SERVICE_URL,
  ARCGIS_GEOCODER_URL,
  DEFAULT_COUNTRY_CODE,
  LAYERS,
} from "./constants.ts";
import { AlectraApiError } from "./errors.ts";
import { ArcGisService } from "./internal/arcgis-service.ts";
import {
  asNumber,
  normalizeCrew,
  normalizeOutage,
  normalizeOutageArea,
} from "./internal/normalize.ts";
import { validateRadius } from "./internal/validation.ts";
import type {
  AlectraClientOptions,
  Crew,
  GeocodeResult,
  MultiPolygon,
  NearbyOptions,
  Outage,
  OutageArea,
  OutageSnapshot,
  Point,
  Polygon,
  QueryOptions,
} from "./types.ts";

export class AlectraOutageClient {
  readonly serviceUrl: string;
  readonly geocoderUrl: string;
  readonly fetch: typeof globalThis.fetch;
  private readonly arcgis: ArcGisService;

  constructor(options: AlectraClientOptions = {}) {
    this.serviceUrl = (options.serviceUrl ?? ALECTRA_OUTAGE_SERVICE_URL).replace(
      /\/+$/,
      "",
    );
    this.geocoderUrl = (options.geocoderUrl ?? ARCGIS_GEOCODER_URL).replace(
      /\/+$/,
      "",
    );
    this.fetch = options.fetch ?? globalThis.fetch;
    if (!this.fetch) {
      throw new TypeError("No fetch implementation is available");
    }
    this.arcgis = new ArcGisService(
      this.serviceUrl,
      this.geocoderUrl,
      this.fetch,
    );
  }

  async getOutages(options: QueryOptions = {}): Promise<Outage[]> {
    const collection = await this.arcgis.query<Point>(LAYERS.outages, options);
    return collection.features.map(normalizeOutage);
  }

  async getCrews(options: QueryOptions = {}): Promise<Crew[]> {
    const collection = await this.arcgis.query<Point>(LAYERS.crews, options);
    return collection.features.map(normalizeCrew);
  }

  async getOutageAreas(options: QueryOptions = {}): Promise<OutageArea[]> {
    const collection = await this.arcgis.query<Polygon | MultiPolygon>(
      LAYERS.areas,
      options,
    );
    return collection.features.map(normalizeOutageArea);
  }

  /**
   * Resolve an address, postal code, landmark, or town name to coordinates.
   * Returns null when ArcGIS cannot find a matching place.
   */
  async geocode(
    addressOrTown: string,
    options: Pick<NearbyOptions, "countryCode" | "signal"> = {},
  ): Promise<GeocodeResult | null> {
    if (!addressOrTown.trim()) {
      throw new TypeError("Address or town cannot be empty");
    }
    const body = await this.arcgis.geocode(
      addressOrTown,
      options.countryCode ?? DEFAULT_COUNTRY_CODE,
      options.signal,
    );
    const candidate = body.candidates?.[0];
    const longitude = asNumber(candidate?.location?.x);
    const latitude = asNumber(candidate?.location?.y);
    if (!candidate || longitude === null || latitude === null) return null;

    return {
      address: candidate.address ?? addressOrTown,
      score: asNumber(candidate.score) ?? 0,
      location: { type: "Point", coordinates: [longitude, latitude] },
    };
  }

  async getOutagesNear(
    addressOrTown: string,
    options: NearbyOptions = {},
  ): Promise<Outage[]> {
    const { query } = await this.resolveNearbyQuery(addressOrTown, options);
    return this.getOutages(query);
  }

  /** Fetch all three layers concurrently. */
  async getSnapshot(options: QueryOptions = {}): Promise<OutageSnapshot> {
    const [outages, crews, outageAreas] = await Promise.all([
      this.getOutages(options),
      this.getCrews(options),
      this.getOutageAreas(options),
    ]);
    return { outages, crews, outageAreas, fetchedAt: new Date() };
  }

  /** Geocode an address or town and fetch all map layers around it. */
  async getSnapshotNear(
    addressOrTown: string,
    options: NearbyOptions = {},
  ): Promise<OutageSnapshot & { place: GeocodeResult }> {
    const { place, query } = await this.resolveNearbyQuery(addressOrTown, options);
    const snapshot = await this.getSnapshot(query);
    return { ...snapshot, place };
  }

  private async resolveNearbyQuery(
    addressOrTown: string,
    options: NearbyOptions,
  ): Promise<{ place: GeocodeResult; query: QueryOptions }> {
    const place = await this.geocode(addressOrTown, options);
    if (!place) {
      throw new AlectraApiError(`Could not find "${addressOrTown}"`);
    }
    return {
      place,
      query: {
        signal: options.signal,
        near: {
          location: place.location.coordinates,
          radiusKm: validateRadius(options.radiusKm),
        },
      },
    };
  }
}

export const alectra = new AlectraOutageClient();
