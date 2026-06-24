FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Exposes the server process to network routing blocks outside the isolated container
CMD ["npm", "run", "dev", "--", "--host"]