import type { ArcGisFeature } from "./arcgis-types.ts";
import type {
  Crew,
  MultiPolygon,
  Outage,
  OutageArea,
  Point,
  Polygon,
} from "../types.ts";

export const asNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

export const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;

const asDate = (value: unknown): Date | null => {
  const timestamp = asNumber(value);
  if (timestamp === null) return null;
  const date = new Date(timestamp);
  return Number.isNaN(date.valueOf()) ? null : date;
};

const asBoolean = (value: unknown): boolean | null => {
  if (value === 1 || value === true) return true;
  if (value === 0 || value === false) return false;
  return null;
};

export const normalizeOutage = ({
  properties,
  geometry,
}: ArcGisFeature<Point>): Outage => ({
  objectId: asNumber(properties.OBJECTID) ?? 0,
  caseId: asNumber(properties.CaseIDOnMap),
  showOnMap: asBoolean(properties.ShowOnMap) ?? false,
  outageTime: asDate(properties.OutageTime),
  customersOut: asNumber(properties.CURCUST),
  customersAffected: asNumber(properties.INITCUST),
  cause: asString(properties.OutageCausePublic),
  message: asString(properties.PUBLICMSG),
  estimatedRestorationTime: asDate(properties.EstRestoreTime),
  location: geometry,
});

export const normalizeCrew = ({
  properties,
  geometry,
}: ArcGisFeature<Point>): Crew => ({
  objectId: asNumber(properties.OBJECTID) ?? 0,
  caseId: asNumber(properties.CaseID),
  mappedCaseId: asNumber(properties.CaseIDOnMap),
  status: asString(properties.CrewStatus),
  lastUpdated: asDate(properties.LastUpdated),
  assigned: asNumber(properties.Assigned),
  enroute: asNumber(properties.Enroute),
  arrived: asNumber(properties.Arrived),
  completed: asNumber(properties.Completed),
  showOnMap: asBoolean(properties.ShowOnMap),
  location: geometry,
});

export const normalizeOutageArea = ({
  properties,
  geometry,
}: ArcGisFeature<Polygon | MultiPolygon>): OutageArea => ({
  objectId: asNumber(properties.OBJECTID) ?? 0,
  caseId:
    properties.CaseIDOnMap == null
      ? null
      : String(properties.CaseIDOnMap),
  areaSquareMeters: asNumber(properties.SHAPE__Area),
  perimeterMeters: asNumber(properties.SHAPE__Length),
  geometry,
});
