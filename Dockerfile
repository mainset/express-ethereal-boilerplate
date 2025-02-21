# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.9.0
ARG PNPM_VERSION=9.15.4

FROM node:${NODE_VERSION}-alpine as base

# Install pnpm.
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/api-express

################################################################################
# Create a stage for installing production dependencies.
FROM base AS install-dependencies

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.local/share/pnpm/store to speed up subsequent builds.
# Leverage a bind mounts to package.json and pnpm-lock.yaml to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

################################################################################
# Create a stage for building the packages source code.
FROM install-dependencies as build

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN pnpm run build

################################################################################
# Create a new {production} stage that will be running the application
FROM install-dependencies AS production

# Use production node environment
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Copy compiled {/dist} code from the {build} Docker stage into the image.
COPY --chown=node:node --from=build /usr/src/api-express/dist ./dist
# Copy required files to launch the application
COPY ./package.json ./

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "run", "start:prod"]

################################################################################
# Create a new {production} stage that will be running the application
FROM install-dependencies AS development

# Use production node environment
ENV NODE_ENV development

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "run", "start:dev"]
