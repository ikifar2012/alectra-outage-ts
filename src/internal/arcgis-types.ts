export type ArcGisProperties = Record<string, string | number | null>;

export interface ArcGisFeature<GeometryType> {
  type: "Feature";
  geometry: GeometryType;
  properties: ArcGisProperties;
}

export interface ArcGisFeatureCollection<GeometryType> {
  type: "FeatureCollection";
  features: ArcGisFeature<GeometryType>[];
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
