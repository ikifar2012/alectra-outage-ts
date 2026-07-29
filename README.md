# alectra-outage-ts

> **AI-generated project:** This library was designed and implemented with
> OpenAI Codex. Its code and behavior should be reviewed by a human before use
> in production.

An unofficial, dependency-free TypeScript client for the public data behind
[Alectra's outage map](https://experience.arcgis.com/experience/8371de586076441192a1fa7058816c00).

> This project is not affiliated with or endorsed by Alectra Utilities. The
> upstream ArcGIS service is public but undocumented, so its URL or schema may
> change without notice. Be considerate with polling.

## Install

```bash
bun add alectra-outage-ts
```

The client works in modern browsers, Bun, and Node.js 18 or newer.

## Usage

```ts
import { alectra } from "alectra-outage-ts";

const outages = await alectra.getOutages();

for (const outage of outages) {
  console.log({
    caseId: outage.caseId,
    customersOut: outage.customersOut,
    cause: outage.cause,
    estimatedRestorationTime: outage.estimatedRestorationTime,
    coordinates: outage.location.coordinates,
  });
}
```

Fetch outages, assigned crews, and outage polygons together:

```ts
const snapshot = await alectra.getSnapshot();
console.log(snapshot.outages, snapshot.crews, snapshot.areas);
```

Search using a street address, postal code, or town:

```ts
const outages = await alectra.getOutagesNear("Barrie, Ontario");

const nearby = await alectra.getSnapshotNear(
  "55 John Street, Hamilton, Ontario",
  { radiusKm: 5 },
);

console.log(nearby.place.address);
console.log(nearby.outages);
```

Canadian geocoding is used by default. You can also resolve a place without
fetching outages:

```ts
const place = await alectra.geocode("L6Y 1N7");
// { address, score, location: { type: "Point", coordinates: [lng, lat] } }
```

Limit results to a longitude/latitude bounding box:

```ts
const outages = await alectra.getOutages({
  bounds: {
    west: -79.9,
    south: 43.5,
    east: -79.0,
    north: 44.1,
  },
});
```

Use an `AbortSignal` or a custom `fetch` implementation:

```ts
import { AlectraOutageClient } from "alectra-outage-ts";

const client = new AlectraOutageClient({ fetch });
const controller = new AbortController();

const outages = await client.getOutages({ signal: controller.signal });
```

All coordinates are GeoJSON longitude/latitude values (EPSG:4326). ArcGIS date
timestamps are returned as `Date` objects, and missing upstream values become
`null`.

## API

- `getOutages(options?)` returns `Promise<Outage[]>`
- `geocode(addressOrTown, options?)` resolves an address or town
- `getOutagesNear(addressOrTown, options?)` searches within 10 km by default
- `getCrews(options?)` returns `Promise<Crew[]>`
- `getOutageAreas(options?)` returns `Promise<OutageArea[]>`
- `getSnapshot(options?)` fetches all three concurrently
- `getSnapshotNear(addressOrTown, options?)` geocodes and fetches nearby layers

Requests that fail throw `AlectraApiError`.

## Project structure

- `index.ts` is the stable public export surface
- `src/client.ts` contains the user-facing client workflows
- `src/types.ts` contains public TypeScript types
- `src/constants.ts` contains service URLs, layer IDs, and defaults
- `src/errors.ts` contains public error types
- `src/internal/arcgis-service.ts` handles HTTP and ArcGIS query construction
- `src/internal/normalize.ts` converts ArcGIS fields into public models
- `src/internal/validation.ts` validates query inputs
