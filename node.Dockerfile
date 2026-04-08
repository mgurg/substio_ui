# Stage 1: Build the application using Node
FROM node:24-slim AS build-stage

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Add build args for environment variables
ARG NUXT_PUBLIC_DOMAIN
ARG NUXT_BACKEND_API
ARG SENTRY_AUTH_TOKEN
ARG MAPBOX_TOKEN

ENV NUXT_PUBLIC_DOMAIN=${NUXT_PUBLIC_DOMAIN}
ENV NUXT_BACKEND_API=${NUXT_BACKEND_API}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV MAPBOX_TOKEN=${MAPBOX_TOKEN}

# Increase memory limit for Node.js build process
ENV NODE_OPTIONS="--max-old-space-size=2560"

# Build the application
RUN npm run build

# Stage 2: Serve the application using Node
FROM node:24-slim AS production-stage

ARG NUXT_BACKEND_API

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Create a non-privileged user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Set working directory
WORKDIR /app

# Copy only the built output
COPY --from=build-stage /app/.output /app/.output

# Switch to the non-privileged user
USER appuser

# Expose Nuxt listening port
EXPOSE 3000

# Production environment
ENV NODE_ENV=production
ENV NUXT_BACKEND_API=${NUXT_BACKEND_API}

# Run the Nuxt server using Node
CMD ["node", ".output/server/index.mjs"]
