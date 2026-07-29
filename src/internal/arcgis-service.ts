import { AlectraApiError } from "../errors.ts";
import type { QueryOptions } from "../types.ts";
import type {
  ArcGisErrorResponse,
  ArcGisFeatureCollection,
  ArcGisGeocodeResponse,
} from "./arcgis-types.ts";
import { validateQuery } from "./validation.ts";

export class ArcGisService {
  constructor(
    private readonly serviceUrl: string,
    private readonly geocoderUrl: string,
    private readonly fetch: typeof globalThis.fetch,
  ) {}

  async query<G>(
    layer: number,
    options: QueryOptions,
  ): Promise<ArcGisFeatureCollection<G>> {
    validateQuery(options);
    const params = this.createQueryParams(options);
    const response = await this.fetch(
      `${this.serviceUrl}/${layer}/query?${params}`,
      { signal: options.signal },
    );
    const body = await this.readJson<
      ArcGisFeatureCollection<G> & ArcGisErrorResponse
    >(response);

    this.throwIfError(response, body);
    if (body.type !== "FeatureCollection" || !Array.isArray(body.features)) {
      throw new AlectraApiError("Alectra service returned an unexpected response");
    }
    return body;
  }

  async geocode(
    addressOrTown: string,
    countryCode: string,
    signal?: AbortSignal,
  ): Promise<ArcGisGeocodeResponse> {
    const params = new URLSearchParams({
      f: "json",
      singleLine: addressOrTown,
      countryCode,
      maxLocations: "1",
      outSR: "4326",
      forStorage: "false",
      outFields: "Match_addr",
    });
    const response = await this.fetch(
      `${this.geocoderUrl}/findAddressCandidates?${params}`,
      { signal },
    );
    const body = await this.readJson<ArcGisGeocodeResponse>(response);
    this.throwIfError(response, body);
    return body;
  }

  private createQueryParams(options: QueryOptions): URLSearchParams {
    const params = new URLSearchParams({
      f: "geojson",
      where: "1=1",
      outFields: "*",
      returnGeometry: "true",
      outSR: "4326",
    });

    if (options.bounds) {
      const { west, south, east, north } = options.bounds;
      params.set("geometry", `${west},${south},${east},${north}`);
      params.set("geometryType", "esriGeometryEnvelope");
      params.set("inSR", "4326");
      params.set("spatialRel", "esriSpatialRelIntersects");
    }
    if (options.near) {
      const [longitude, latitude] = options.near.location;
      params.set("geometry", `${longitude},${latitude}`);
      params.set("geometryType", "esriGeometryPoint");
      params.set("inSR", "4326");
      params.set("distance", String(options.near.radiusKm));
      params.set("units", "esriSRUnit_Kilometer");
      params.set("spatialRel", "esriSpatialRelIntersects");
    }
    return params;
  }

  private async readJson<T>(response: Response): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch {
      throw new AlectraApiError(
        `Alectra service returned an invalid response (${response.status})`,
        response.status,
      );
    }
  }

  private throwIfError(response: Response, body: ArcGisErrorResponse): void {
    if (!response.ok || body.error) {
      throw new AlectraApiError(
        body.error?.message ?? `Alectra request failed (${response.status})`,
        body.error?.code ?? response.status,
        body.error?.details,
      );
    }
  }
}
