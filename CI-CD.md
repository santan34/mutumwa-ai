# CI/CD Documentation

This document describes the automated CI/CD pipeline setup for the Mutumwa AI project using GitHub Actions.

## Overview

The project uses a comprehensive CI/CD pipeline that handles:
- Automated testing and code quality checks
- Docker image building and publishing
- Automated deployment to staging and production
- Dependency management and security scanning
- Release management

## Workflow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Push     │    │   Pull Request  │    │   Release Tag   │
│   (main/dev)    │    │   (main/dev)    │    │     (v*)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CI/CD Tests   │    │  Code Quality   │    │    Release      │
│   Build Images  │    │   Security      │    │   Deployment    │
│   Deploy        │    │   Lint Check    │    │   Package       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Test Job**: Runs on Node.js 18.x and 20.x with PostgreSQL and Redis services
  - Installs dependencies for all services
  - Runs linting and builds
  - Executes tests (when available)

- **Build and Push**: Builds Docker images for all services
  - Only runs on push to main/develop (not PRs)
  - Pushes images to GitHub Container Registry
  - Tags images with branch name and commit SHA

- **Deploy Staging**: Deploys to staging environment (develop branch)
- **Deploy Production**: Deploys to production environment (main branch)
- **Security Scan**: Runs Trivy vulnerability scanner

### 2. Code Quality (`.github/workflows/code-quality.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Features:**
- ESLint and Prettier checks
- SonarCloud static analysis
- CodeQL security scanning
- Dockerfile linting with Hadolint
- Docker Compose validation

### 3. Dependency Updates (`.github/workflows/dependency-updates.yml`)

**Triggers:**
- Weekly schedule (Mondays at 9 AM UTC)
- Manual trigger

**Features:**
- Updates npm dependencies in all services
- Fixes security vulnerabilities with `npm audit fix`
- Creates automatic pull requests for updates
- Generates security audit reports

### 4. Release (`.github/workflows/release.yml`)

**Triggers:**
- Push of version tags (v1.0.0, v2.1.3, etc.)

**Features:**
- Creates GitHub releases with changelogs
- Builds and pushes tagged Docker images
- Generates deployment packages with production configurations
- Creates deployment scripts for easy production setup

## Environment Setup

### Required Secrets

Configure these in your GitHub repository settings (Settings → Secrets and variables → Actions):

```
# SonarCloud (optional)
SONAR_TOKEN=your_sonar_token

# Production Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=mutumwa_ai_prod

# Connection Strings
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Branch Protection Rules

Recommended branch protection for `main`:
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators in restrictions

## Docker Images

Images are automatically built and pushed to GitHub Container Registry:

```
ghcr.io/your-username/mutumwa-ai-collector:latest
ghcr.io/your-username/mutumwa-ai-frontend:latest
ghcr.io/your-username/mutumwa-ai-server:latest
```

**Tagging Strategy:**
- `latest` - Latest main branch build
- `develop` - Latest develop branch build
- `main-<sha>` - Specific commit from main
- `v1.0.0` - Release tags
- `1.0`, `1` - Semantic version shortcuts

## Deployment Strategies

### Staging Deployment (Develop Branch)
- Automatic deployment on push to develop
- Uses latest development images
- Environment: `staging`

### Production Deployment (Main Branch)
- Automatic deployment on push to main
- Uses production-ready images
- Environment: `production`
- Includes health checks and rollback capabilities

### Release Deployment (Tags)
- Creates stable release packages
- Generates deployment archives
- Provides versioned Docker images

## Monitoring and Troubleshooting

### Checking Workflow Status
1. Go to repository → Actions tab
2. Select the workflow run
3. Review job logs and status

### Common Issues

**Build Failures:**
- Check dependency installation logs
- Verify Docker build context
- Review memory/resource limits

**Test Failures:**
- Check database connection
- Verify environment variables
- Review test logs

**Deployment Issues:**
- Verify secrets configuration
- Check service health checks
- Review deployment logs

### Debugging Commands

```bash
# Local Docker build test
docker build -t test-collector ./collector
docker build -t test-frontend ./frontend
docker build -t test-server ./server

# Validate docker-compose
docker-compose config

# Check workflow syntax
# Install act: https://github.com/nektos/act
act -n  # Dry run

# Manual deployment test
docker-compose -f docker-compose.prod.yml up -d
```

## Best Practices

1. **Commit Messages**: Use conventional commits for better changelogs
   ```
   feat: add user authentication
   fix: resolve database connection issue
   docs: update API documentation
   ```

2. **Version Tagging**: Use semantic versioning
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **Pull Requests**: 
   - Include comprehensive descriptions
   - Reference related issues
   - Ensure all checks pass

4. **Environment Parity**: Keep development, staging, and production environments as similar as possible

5. **Security**: 
   - Never commit secrets to code
   - Use environment variables for configuration
   - Regular dependency updates

## Extending the Pipeline

### Adding New Services
1. Create Dockerfile in service directory
2. Add service to docker-compose.yml
3. Update CI/CD workflow matrix to include new service
4. Add service-specific tests and linting

### Custom Deployment Targets
1. Create new workflow file or extend existing
2. Add environment-specific secrets
3. Configure deployment scripts
4. Set up monitoring and health checks

### Integration with External Services
- Add webhook notifications (Slack, Discord)
- Integrate with monitoring tools (Datadog, New Relic)
- Connect to deployment platforms (AWS, Azure, GCP)

## Security Considerations

- All secrets are encrypted and only accessible during workflow execution
- Docker images are scanned for vulnerabilities
- Dependencies are regularly updated and audited
- CodeQL performs security analysis on every push
- Branch protection prevents direct pushes to main branch
