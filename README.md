# alectra-outage-ts

**Status: experimental and unofficial.**

> **AI-generated project:** This library was designed and implemented with
> OpenAI Codex. Its code and behavior should be reviewed by a human before use
> in production.

An unofficial, dependency-free TypeScript client for the public data behind
[Alectra's outage map](https://experience.arcgis.com/experience/8371de586076441192a1fa7058816c00).
It provides typed access to current outage cases, assigned crews, outage-area
polygons, and address-based searches.

> This project is not affiliated with or endorsed by Alectra Utilities. The
> upstream ArcGIS service is public but undocumented, so its URL or schema may
> change without notice. Be considerate with polling.

## Important limitations

- Do not rely on this package for emergencies, public safety, or guaranteed
  restoration information. Confirm important information through Alectra's
  official channels.
- The package reads an undocumented public data source. Alectra can change,
  restrict, delay, or remove that source at any time.
- Customer counts, causes, crew states, locations, and restoration estimates
  are reported exactly as available upstream and may be missing or approximate.
- This package is a read-only client. It cannot report an outage or contact
  emergency services.
- The MIT license applies to this project's code, not to Alectra or Esri data,
  services, names, or trademarks.

## Data sources and privacy

Outage information comes from the public ArcGIS feature layers used by the
official Alectra outage map. Address and town searches use Esri's public World
Geocoding Service. Calling `geocode`, `getOutagesNear`, or `getSnapshotNear`
sends the supplied search text to Esri. Avoid submitting sensitive personal
information.

## Install

```bash
bun add alectra-outage-ts
# or: npm install alectra-outage-ts
```

For local development in this repository:

```bash
bun install
```

The distributed client is ESM-only and works in modern browsers, Bun, and
Node.js 18 or newer. It has no runtime dependencies and requires a global
`fetch` implementation.

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
console.log(snapshot.outages, snapshot.crews, snapshot.outageAreas);
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
`null`. Outage-area sizes use square metres and their perimeters use metres.
Nearby searches use a 10 km radius unless `radiusKm` is supplied.

## API

- `getOutages(options?)` returns `Promise<Outage[]>`
- `geocode(addressOrTown, options?)` resolves an address or town
- `getOutagesNear(addressOrTown, options?)` searches within 10 km by default
- `getCrews(options?)` returns `Promise<Crew[]>`
- `getOutageAreas(options?)` returns `Promise<OutageArea[]>`
- `getSnapshot(options?)` fetches all three concurrently
- `getSnapshotNear(addressOrTown, options?)` geocodes and fetches nearby layers

Requests that fail throw `AlectraApiError`.

## Responsible use

The upstream service currently advertises short-lived caching and is intended
to support a public map. Cache responses in your application and avoid rapid
or unnecessary polling. This library does not provide an automatic polling
loop.

## Development

```bash
bun install
bun run check
bun run build
```

`bun run check` runs strict TypeScript validation. `bun run build` creates the
ESM package in `dist/`.

## Publishing to npm

Publishing is handled by `.github/workflows/publish.yml` whenever a GitHub
Release is published. The workflow checks that the release tag matches the
version in `package.json`, validates and builds the package, and then publishes
it to npm.

The workflow uses npm trusted publishing with GitHub Actions OpenID Connect.
It does not require a long-lived `NPM_TOKEN`. npm automatically attaches
provenance when the package and GitHub repository are public.

Before the first automated release:

1. Publish the package once from an npm account that owns the package name.
   This bootstraps the package because its npm settings do not exist before the
   first publication.
2. In the package settings on npmjs.com, add a GitHub Actions trusted
   publisher using your GitHub owner, repository name, and the workflow
   filename `publish.yml`. Allow `npm publish`.
3. Commit a new package version, create a matching tag such as `v0.1.1`, and
   publish a GitHub Release for that tag.

For the initial manual publication:

```bash
npm login
npm publish
```

Do not create an `NPM_TOKEN` repository secret for the normal automated flow.
Trusted publishing requires a GitHub-hosted runner, Node.js 22.14 or newer,
npm 11.5.1 or newer, and `id-token: write`; the included workflow satisfies
those runner requirements with Node.js 24.

## Project structure

- `index.ts` is the stable public export surface
- `src/client.ts` contains the user-facing client workflows
- `src/types.ts` contains public TypeScript types
- `src/constants.ts` contains service URLs, layer IDs, and defaults
- `src/errors.ts` contains public error types
- `src/internal/arcgis-service.ts` handles HTTP and ArcGIS query construction
- `src/internal/normalize.ts` converts ArcGIS fields into public models
- `src/internal/validation.ts` validates query inputs

## License and trademarks

The library code is available under the [MIT License](./LICENSE). “Alectra,”
related names, and associated marks belong to their respective owners. Their
use here only identifies the public service with which this unofficial client
interoperates.
