export const ALECTRA_OUTAGE_SERVICE_URL =
  "https://services8.arcgis.com/BiisLrqUuQvkdMCP/arcgis/rest/services/DEV_Outage_Layers/FeatureServer";

export const ARCGIS_GEOCODER_URL =
  "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

export const DEFAULT_COUNTRY_CODE = "CAN";
export const DEFAULT_SEARCH_RADIUS_KM = 10;

export const LAYERS = {
  crews: 0,
  outages: 1,
  areas: 2,
} as const;
