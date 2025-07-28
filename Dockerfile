# Stage 1: Build the application using Bun
FROM oven/bun:1.2-slim AS build-stage

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package*.json bun.lock ./

# Install dependencies using Bun
RUN bun install

# Copy all files
COPY . .

# Add build args for environment variables
ARG NUXT_PUBLIC_DOMAIN
ARG NUXT_BACKEND_API
ARG NUXT_UMAMI_ID
ARG NUXT_UMAMI_HOST

ENV NUXT_PUBLIC_DOMAIN=${NUXT_PUBLIC_DOMAIN}
ENV NUXT_BACKEND_API=${NUXT_BACKEND_API}
ENV NUXT_UMAMI_ID=${NUXT_UMAMI_ID}
ENV NUXT_UMAMI_HOST=${NUXT_UMAMI_HOST}


# Build the application
RUN bun run build

# Stage 2: Serve the application using Bun
FROM oven/bun:1.2-slim AS production-stage

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build-stage /app/.output /app/.output

# Expose the port the Nuxt app will run on
EXPOSE 3000

# Set environment variable for production
ENV NODE_ENV=production

# Command to run the app using Bun
CMD ["bun", ".output/server/index.mjs"]
