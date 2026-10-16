# Substio UI

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

or `bun run --bun dev` in case where outdated Node.js is also installed.

## Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## package-lock.json

Bun is the primary package manager. `package-lock.json` is only needed by the Node-based Docker build (`node.Dockerfile`). After changing dependencies with Bun, sync the lock file by running inside a Node 24 container (matching the build environment):

```bash
docker run --rm -v $(pwd):/app -w /app node:24-slim npm install --package-lock-only
```

Then commit the updated `package-lock.json`.

## Docker

```bash

docker build --build-arg NUXT_BACKEND_API=https://my-api.pl -t substio-ui:latest .

docker run -p 3000:3000 substio-ui:latest

```

```bash
docker compose build
```

```bash
docker compose up
```

```bash
docker compose -f compose.dev.yaml build
```

```bash
docker compose -f compose.dev.yaml up
```

```bash
docker compose -f compose.node.yaml build
```

```bash
docker compose -f compose.node.yaml up
```

```bash
docker compose build --build-arg NUXT_BACKEND_API=https://your-api-url
```

## Updates

Update all dependencies to latest version

```bash
bun outdated
```

```bash
bun update --interactive
```

```bash
bun update -f
```

Install dependencies (lockfile)

```bash
bun install --frozen-lockfile
```

Upgrading **Nuxt**

```bash
bunx nuxi@latest upgrade --dedupe
```

```bash
bunx nuxi prepare
```