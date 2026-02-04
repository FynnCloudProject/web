# Build stage - compile the Nuxt app
FROM node:25-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the static site
RUN npx nuxi generate

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built static files from builder stage
COPY --from=builder /app/.output/public /usr/share/nginx/html

# Copy nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]