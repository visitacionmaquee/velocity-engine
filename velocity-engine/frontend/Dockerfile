# --- STAGE 1: Build Environment ---
    FROM node:22-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci
    COPY . .
    RUN npm run build
    
    # --- STAGE 2: Production Web Server ---
    FROM nginx:1.25-alpine
    # Copy the compiled static assets from Stage 1 into Nginx's public directory
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Expose production web port
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]