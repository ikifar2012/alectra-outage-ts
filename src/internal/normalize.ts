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
  properties: p,
  geometry,
}: ArcGisFeature<Point>): Outage => ({
  objectId: asNumber(p.OBJECTID) ?? 0,
  caseId: asNumber(p.CaseIDOnMap),
  showOnMap: asBoolean(p.ShowOnMap) ?? false,
  outageTime: asDate(p.OutageTime),
  customersOut: asNumber(p.CURCUST),
  customersAffected: asNumber(p.INITCUST),
  cause: asString(p.OutageCausePublic),
  message: asString(p.PUBLICMSG),
  estimatedRestorationTime: asDate(p.EstRestoreTime),
  location: geometry,
});

export const normalizeCrew = ({
  properties: p,
  geometry,
}: ArcGisFeature<Point>): Crew => ({
  objectId: asNumber(p.OBJECTID) ?? 0,
  caseId: asNumber(p.CaseID),
  mappedCaseId: asNumber(p.CaseIDOnMap),
  status: asString(p.CrewStatus),
  lastUpdated: asDate(p.LastUpdated),
  assigned: asNumber(p.Assigned),
  enroute: asNumber(p.Enroute),
  arrived: asNumber(p.Arrived),
  completed: asNumber(p.Completed),
  showOnMap: asBoolean(p.ShowOnMap),
  location: geometry,
});

export const normalizeOutageArea = ({
  properties: p,
  geometry,
}: ArcGisFeature<Polygon | MultiPolygon>): OutageArea => ({
  objectId: asNumber(p.OBJECTID) ?? 0,
  caseId: p.CaseIDOnMap == null ? null : String(p.CaseIDOnMap),
  area: asNumber(p.SHAPE__Area),
  perimeter: asNumber(p.SHAPE__Length),
  geometry,
});
