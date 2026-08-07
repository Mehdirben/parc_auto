# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Install exactly the dependency graph recorded in package-lock.json.
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code and build the application
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the Angular application using Nginx
FROM nginx:alpine
# Copy the compiled Angular browser bundles to Nginx public html directory
COPY --from=build /app/dist/parc-automobile-frontend /usr/share/nginx/html
# Override standard Nginx config with our custom SPA routing config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
