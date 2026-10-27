FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies (production)
RUN npm ci --omit=dev || npm install --omit=dev

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 5001

# Start the Express server
CMD ["node", "src/server.js"]
