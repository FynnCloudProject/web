# Build stage
# Run the node builder natively on the host architecture to bypass QEMU arm64 emulation bugs
FROM --platform=$BUILDPLATFORM node:25-slim AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with Nitro SSR (server-side rendering)
RUN npx nuxi build

# Production stage - serve with Node.js / Nitro
FROM node:25-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

# Copy built Nitro output from builder stage
COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
