# --- STAGE 1: Dependency Installation ---
    FROM node:22-alpine AS base
    WORKDIR /usr/src/app
    COPY package*.json ./
    
    # --- STAGE 2: Production Execution ---
    FROM base AS production
    # Only install production-level dependencies
    RUN npm install --only=production
    COPY . .
    
    EXPOSE 5000
    ENV NODE_ENV=production
    
    CMD ["node", "index.js"]