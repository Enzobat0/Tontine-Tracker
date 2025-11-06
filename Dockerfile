# ------------------------------
# Stage 1: Use a lightweight Node.js base image
# ------------------------------
FROM node:20-slim

# ------------------------------
# Set working directory inside the container
# ------------------------------
WORKDIR /app

# ------------------------------
# Copy only package files first to leverage Docker cache
# ------------------------------
COPY package*.json ./

# ------------------------------
# Install dependencies
# Using npm ci ensures a clean, reproducible install
# ------------------------------
RUN npm ci --only=production

# ------------------------------
# Copy the rest of the application files
# ------------------------------
COPY . .

# ------------------------------
# Create a non-root user for better container security
# ------------------------------
RUN useradd -m appuser
USER appuser

# ------------------------------
# Expose the application port
# (Match this with your Express app’s listening port)
# ------------------------------
EXPOSE 3000

# ------------------------------
# Start the application
# ------------------------------
CMD ["node", "server.js"]