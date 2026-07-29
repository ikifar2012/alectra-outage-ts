export type ArcGisProperties = Record<string, string | number | null>;

export interface ArcGisFeature<G> {
  type: "Feature";
  geometry: G;
  properties: ArcGisProperties;
}

export interface ArcGisFeatureCollection<G> {
  type: "FeatureCollection";
  features: ArcGisFeature<G>[];
}

export interface ArcGisErrorResponse {
  error?: {
    code?: number;
    message?: string;
    details?: string[];
  };
}

export interface ArcGisGeocodeResponse extends ArcGisErrorResponse {
  candidates?: Array<{
    address?: string;
    score?: number;
    location?: { x?: number; y?: number };
  }>;
}
