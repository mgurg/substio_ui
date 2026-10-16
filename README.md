# Substio UI

The Nuxt 4 frontend for a Polish platform for finding and posting legal substitution offers. Browse offers in a list or on a map, filter them by location and legal role, and publish a request for court hearing coverage.

## Tech stack

- Nuxt 4, Vue 3, TypeScript, Nuxt UI
- Mapbox GL for the offer map
- Hey API with Axios for the generated backend client
- Vitest for tests

## Run locally

Install [Bun](https://bun.sh/) and start the backend API. The frontend expects it at `http://localhost:5000` by default.

```bash
cp .env.example .env
bun install --frozen-lockfile
bun run dev
```

Open <http://localhost:3000>. Set `NUXT_BACKEND_API` in `.env` if the backend runs elsewhere. The map also needs a `MAPBOX_TOKEN`.

| Variable | Purpose |
| --- | --- |
| `NUXT_BACKEND_API` | Backend URL used by the API client |
| `NUXT_PUBLIC_DOMAIN` | Public site URL used for links and the sitemap |
| `MAPBOX_TOKEN` | Mapbox access token for the offer map |
| `NUXT_PUBLIC_BLOG_URL` | URL for the external blog link |
| `SENTRY_AUTH_TOKEN` | Optional source map upload during the Node Docker build |

## Common commands

```bash
bun run dev                 # Development server
bun run test --run          # Vitest suite
bun run build               # Production build
bun run preview             # Preview the build
bun run hey-client-axios    # Regenerate the backend client
```

The API generator reads `http://localhost:5000/openapi.json` and writes to `app/client/`. Run the backend before regenerating; the generated files should not be edited by hand.

## Docker

The default `Dockerfile` builds and runs with Bun. Pass the API URL when building and running the image:

```bash
docker build --build-arg NUXT_BACKEND_API=https://api.example.com -t substio-ui .
docker run --rm -p 3000:3000 -e NUXT_BACKEND_API=https://api.example.com substio-ui
```

For the Node 24 image, use `node.Dockerfile` or `compose.node.yaml`. The Node image uses `npm ci` with `package-lock.json`; Bun uses `bun.lock`.

## Updating dependencies

Use Bun for local dependency changes and keep both lockfiles in sync:

```bash
bun update --latest
docker run --rm -v "$PWD:/app" -w /app node:24-slim npm install --package-lock-only
```

The repository's `bunfig.toml` allows package versions published at least three days ago. Review major upgrades and run the tests and production build after updating.
