FROM mcr.microsoft.com/devcontainers/javascript-node:22

# Pass GH_TOKEN at build time
ARG GH_TOKEN
ENV GH_TOKEN=${GH_TOKEN}

# Set timezone
ENV TZ=UTC

# Install additional dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y curl git openssh-client gnupg

# Create directory structure with proper permissions
RUN mkdir -p /workspace/backend/node_modules /home/node/.pnpm-store \
    && chmod -R 777 /workspace /home/node/.pnpm-store \
    && chown -R node:node /home/node/.pnpm-store

# Install global NestJS packages (using npm for reliability during build)
RUN npm install -g @nestjs/cli jest @types/jest ts-jest supertest @types/supertest

# Install Newman and Newman HTML Extra Reporter
RUN npm install -g newman newman-reporter-htmlextra

# Install openapi-to-postman
RUN npm install -g openapi-to-postmanv2