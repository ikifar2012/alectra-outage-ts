import { DEFAULT_SEARCH_RADIUS_KM } from "../constants.ts";
import type { QueryOptions } from "../types.ts";

export const validateRadius = (radiusKm = DEFAULT_SEARCH_RADIUS_KM): number => {
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    throw new TypeError("radiusKm must be a positive number");
  }
  return radiusKm;
};

export const validateQuery = (options: QueryOptions): void => {
  if (options.bounds && options.near) {
    throw new TypeError("Use either bounds or near, not both");
  }

  if (options.bounds) {
    const { west, south, east, north } = options.bounds;
    if (![west, south, east, north].every(Number.isFinite)) {
      throw new TypeError("All bounds values must be finite numbers");
    }
  }

  if (options.near) {
    const [longitude, latitude] = options.near.location;
    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(options.near.radiusKm) ||
      options.near.radiusKm <= 0
    ) {
      throw new TypeError("near requires finite coordinates and a positive radiusKm");
    }
  }
};
