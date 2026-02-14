# Blog Client - Docker Setup

This document provides instructions for running the blog client using Docker.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Your backend API running and accessible

## Quick Start

### 1. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` and set your API URL:

```
NEXT_PUBLIC_API_URL=http://your-api-url:8080
```

### 2. Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the container
- Expose the application on port 3000

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Docker Commands

### Build the image
```bash
docker-compose build
```

### Start the container
```bash
docker-compose up -d
```

### Stop the container
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f blog-client
```

### Rebuild and restart
```bash
docker-compose up -d --build
```

## Docker Image Details

The Dockerfile uses a multi-stage build process:

1. **deps stage**: Installs production dependencies
2. **builder stage**: Builds the Next.js application
3. **runner stage**: Creates a minimal production image

This approach results in a smaller final image size and improved security.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: The URL of your backend API (required)
- `NODE_ENV`: Set to `production` automatically in Docker
- `PORT`: The port the application runs on (default: 3000)

## Customization

### Change the Port

To run the application on a different port, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Access on port 8080 instead of 3000
```

### Add to Existing Docker Network

If you have other services (like your backend API) in a Docker network, you can connect this service to it:

```yaml
networks:
  blog-network:
    external: true
    name: your-existing-network
```

## Troubleshooting

### Container won't start
Check the logs:
```bash
docker-compose logs blog-client
```

### Cannot connect to API
Make sure the `NEXT_PUBLIC_API_URL` in `.env` is accessible from within the Docker container. If your API is running on `localhost` of the host machine, use `host.docker.internal` instead:
```
NEXT_PUBLIC_API_URL=http://host.docker.internal:8080
```

### Image optimization errors
The configuration has `unoptimized: true` set to handle images from private IPs (like MinIO). If you experience issues, verify your `next.config.ts` image settings.

## Production Deployment

For production deployment:

1. Use a production-ready environment variable for `NEXT_PUBLIC_API_URL`
2. Consider using Docker secrets for sensitive data
3. Set up proper networking between services
4. Use a reverse proxy (like Nginx or Traefik) for SSL/TLS termination
5. Implement proper logging and monitoring

## Notes

- The Docker image is optimized for production use
- Node modules are not mounted as volumes; they're baked into the image
- Static assets are properly cached
- The application runs as a non-root user for security
