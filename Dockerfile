# Stage 1: Build the application using Bun
FROM oven/bun:1.2-slim AS build-stage

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json bun.lock ./

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# Copy all files
COPY . .

# Add build args for environment variables
ARG NUXT_PUBLIC_DOMAIN
ARG NUXT_BACKEND_API

ENV NUXT_PUBLIC_DOMAIN=${NUXT_PUBLIC_DOMAIN}
ENV NUXT_BACKEND_API=${NUXT_BACKEND_API}

# Build the application
RUN bun run build

# Stage 2: Serve the application using Bun
FROM oven/bun:1.2-slim AS production-stage

ARG NUXT_BACKEND_API

# Install curl for health checks in a single layer
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Create a non-privileged user that the app will run under
# See https://docs.docker.com/go/dockerfile-user-best-practices/
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

# Copy only the necessary files from the build stage
COPY --from=build-stage /app/.output /app/.output

# Switch to the non-privileged user
USER appuser

# Expose the port the Nuxt app will run on
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production
ENV NUXT_BACKEND_API=${NUXT_BACKEND_API}

# Command to run the app using Bun
CMD ["bun", ".output/server/index.mjs"]
