# -------------------------
# Build Stage
# -------------------------
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build React app (CRA -> /build)
RUN npm run build


# -------------------------
# Production Stage
# -------------------------
FROM nginx:alpine

# Copy build output (IMPORTANT FIX: build not dist)
COPY --from=build /app/build /usr/share/nginx/html

# Add SPA routing fix (CRITICAL for /login, /dashboard, etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]