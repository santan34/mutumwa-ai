# Docker Setup Guide

This project uses Docker Compose to orchestrate all services including the collector, frontend, server, PostgreSQL database, and Redis cache.

## Prerequisites

- Docker and Docker Compose installed on your system
- At least 4GB of available RAM
- Ports 3000, 3001, 5432, 6379, and 8888 available

## Quick Start

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Build and start all services:**
   ```bash
   npm run docker:up
   ```

3. **View logs:**
   ```bash
   npm run docker:logs
   ```

## Available Docker Commands

- `npm run docker:build` - Build all Docker images
- `npm run docker:up` - Start all services in detached mode
- `npm run docker:down` - Stop and remove all containers
- `npm run docker:logs` - View logs from all services
- `npm run docker:rebuild` - Rebuild everything from scratch

## Services Overview

### Frontend (Port 3000)
- Next.js application
- Accessible at http://localhost:3000

### Server (Port 3001)
- Express.js API server
- Swagger documentation at http://localhost:3001/api-docs

### Collector (Port 8888)
- Document processing service
- Handles file uploads and processing

### PostgreSQL Database (Port 5432)
- Primary database
- Credentials: postgres/password
- Database: mutumwa_ai_dev

### Redis Cache (Port 6379)
- Caching and session storage

## Development vs Production

The Docker setup is configured for production by default. For development:

1. Use the regular npm scripts: `npm run start:all`
2. Or modify the docker-compose.yml environment variables to set `NODE_ENV=development`

## Troubleshooting

1. **Port conflicts:** Ensure ports 3000, 3001, 5432, 6379, and 8888 are not in use
2. **Memory issues:** Increase Docker's memory allocation if builds fail
3. **Permission issues:** On Linux/Mac, you may need to adjust file permissions in the volumes

## Data Persistence

- PostgreSQL data is persisted in the `postgres_data` volume
- Redis data is persisted in the `redis_data` volume
- Collector storage is mounted as a volume for file persistence

## GitHub Actions CI/CD

This project includes automated CI/CD pipelines using GitHub Actions:

### Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Runs tests on push/PR to main/develop branches
   - Builds and pushes Docker images to GitHub Container Registry
   - Deploys to staging (develop branch) and production (main branch)

2. **Code Quality** (`.github/workflows/code-quality.yml`)
   - ESLint and Prettier checks
   - SonarCloud analysis
   - CodeQL security scanning
   - Dockerfile linting

3. **Dependency Updates** (`.github/workflows/dependency-updates.yml`)
   - Weekly automated dependency updates
   - Security vulnerability scanning
   - Creates PRs for updates

4. **Release** (`.github/workflows/release.yml`)
   - Triggered on version tags (v*)
   - Creates GitHub releases with changelogs
   - Builds tagged Docker images
   - Generates deployment packages

### Setup Requirements

To use the GitHub Actions workflows:

1. **Enable GitHub Container Registry:**
   ```bash
   # Your images will be available at:
   # ghcr.io/your-username/mutumwa-ai-collector
   # ghcr.io/your-username/mutumwa-ai-frontend
   # ghcr.io/your-username/mutumwa-ai-server
   ```

2. **Configure Secrets** (in GitHub repository settings):
   ```
   SONAR_TOKEN          # For SonarCloud integration
   POSTGRES_USER        # Production database user
   POSTGRES_PASSWORD    # Production database password
   POSTGRES_DB          # Production database name
   DATABASE_URL         # Full database connection string
   REDIS_URL           # Redis connection string
   NEXT_PUBLIC_API_URL # Frontend API URL
   ```

3. **SonarCloud Setup** (optional):
   - Update `sonar-project.properties` with your organization
   - Add SONAR_TOKEN to repository secrets

### Deployment Process

1. **Development:**
   ```bash
   git push origin develop
   # Triggers: tests → build → deploy to staging
   ```

2. **Production Release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # Triggers: tests → build → release → deployment package
   ```

3. **Using Pre-built Images:**
   ```bash
   # Pull and run latest production images
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Monitoring and Logs

- **GitHub Actions**: Check workflow runs in the Actions tab
- **Container Logs**: `docker-compose logs -f [service-name]`
- **Health Checks**: Built-in health checks for all services
