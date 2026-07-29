/**
 * Unofficial, dependency-free client for the public data behind Alectra's
 * outage map.
 *
 * This project was designed and implemented with OpenAI Codex. Review its
 * code and behavior before using it in production.
 */

export { AlectraOutageClient, alectra } from "./src/client.ts";
export {
  ALECTRA_OUTAGE_SERVICE_URL,
  ARCGIS_GEOCODER_URL,
} from "./src/constants.ts";
export { AlectraApiError } from "./src/errors.ts";
export type {
  AlectraClientOptions,
  BoundingBox,
  Crew,
  GeocodeResult,
  MultiPolygon,
  NearbyOptions,
  Outage,
  OutageArea,
  OutageSnapshot,
  Point,
  Polygon,
  Position,
  QueryOptions,
} from "./src/types.ts";
