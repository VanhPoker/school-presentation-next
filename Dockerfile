# Stage 1: Base - Setup Node environment
FROM node:20.19.0-alpine AS base
WORKDIR /app

ARG ENV
ENV ENV=$ENV

# Install dependencies only when needed
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Builder - Build the application
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build based on ENV argument (default is production)
RUN if [ -z "$ENV" ]; then npm run build; else npm run build; fi

# Stage 3: Runner - Lightweight production image
FROM node:20.19.0-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files for Next.js standalone mode
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001 && \
  chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js in production mode
CMD ["npm", "start"]
