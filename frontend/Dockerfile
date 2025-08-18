# Multi-stage Dockerfile for building and serving the frontend (Create React App or similar)
# Stage 1: build the app
FROM node:18-alpine AS build

WORKDIR /app
# Install dependencies based on package-lock/package.json
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build --silent

# Stage 2: serve with nginx
FROM nginx:stable-alpine

# Copy built files to nginx html folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config (handles SPA client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
