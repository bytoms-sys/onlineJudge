# FROM gcc:latest

# # Create non-root user
# RUN useradd -m -s /bin/sh judgeuser

# # Create working directory and set permissions
# RUN mkdir -p /app && \
#     chown -R judgeuser:judgeuser /app && \
#     chmod 777 /app

# # Set working directory
# WORKDIR /app

# # Switch to non-root user
# USER judgeuser

# # Default command (will be overridden)
# CMD ["/bin/sh"]

FROM node:18-alpine

WORKDIR /app

# Install GCC for C++ compilation
RUN apk update && apk add --no-cache g++

COPY backend/compilerBackend/executeCode.js .
COPY backend/compilerBackend/index.js .

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy your app code (including executeCode.js and index.js)
#COPY backend/. .

EXPOSE 8000

CMD ["node", "index.js"]