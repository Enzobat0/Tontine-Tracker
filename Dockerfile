# ------------------------------
# Stage 1: Base image
# ------------------------------
FROM node:20-slim

# ------------------------------
# Set working directory inside the container
# ------------------------------
WORKDIR /app


# ------------------------------
# Copy only package files to leverage caching
# ------------------------------
COPY backend/package.json ./backend/

# ------------------------------
# Install dependencies
# ------------------------------
RUN npm install --omit=dev


# ------------------------------
# Copy the backend source code into the container
# ------------------------------
COPY backend ./backend

# ------------------------------
# Create a non-root user for security
# ------------------------------
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# ------------------------------
# Expose the app port
# ------------------------------
EXPOSE 4000

# ------------------------------
# Start the application
# ------------------------------
CMD ["node", "backend/src/app.js"]