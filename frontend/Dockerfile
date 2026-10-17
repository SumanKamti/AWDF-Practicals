# ==========================================
# Stage 1: Build React (Vite) Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests first for efficient layer caching
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Build argument for backend API URL embedded at build time
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source code and build production distribution bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production Web Server with Nginx
# ==========================================
FROM nginx:alpine

# Copy built production assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing and gzip compression
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose internal web server port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
