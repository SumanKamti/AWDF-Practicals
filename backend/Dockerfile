# Node.js LTS official alpine image for minimal attack surface and small image footprint
FROM node:20-alpine

# Set container working directory to /app
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install application dependencies inside the container
RUN npm install

# Copy backend application source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

# Start the application using the existing start script in package.json
CMD ["npm", "start"]
