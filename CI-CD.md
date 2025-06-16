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


# GitHub Secrets Configuration Guide

This guide will help you set up all the required secrets for the GitHub Actions CI/CD pipeline.

## Access GitHub Secrets Settings

1. **Navigate to your repository on GitHub**
2. **Go to Settings → Secrets and variables → Actions**
3. **Click "New repository secret" for each secret below**

## Required Secrets

### 🔐 **Production Database Secrets**

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=mutumwa_ai_prod

# Full Database Connection String
DATABASE_URL=postgresql://postgres:your_secure_password_here@your-db-host:5432/mutumwa_ai_prod
```

### 🔗 **Redis Configuration**

```bash
# Redis Connection
REDIS_URL=redis://your-redis-host:6379
# Or if Redis has authentication:
# REDIS_URL=redis://username:password@your-redis-host:6379
```

### 🌐 **Frontend Configuration**

```bash
# API URL for production frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
# Or for development/staging:
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 📊 **SonarCloud (Optional but Recommended)**

```bash
# Get this token from https://sonarcloud.io/account/security/
SONAR_TOKEN=your_sonarcloud_token_here
```

### 🚀 **Deployment Secrets (Optional)**

```bash
# If using custom deployment server
DEPLOY_HOST=your-server-ip-or-domain
DEPLOY_USER=deployment-user
DEPLOY_KEY=your-ssh-private-key

# Docker Hub (if using Docker Hub instead of GitHub Container Registry)
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password
```

## Step-by-Step Configuration

### 1. Database Secrets

**For PostgreSQL on cloud providers:**

- **AWS RDS**: Use the endpoint from your RDS instance
- **Google Cloud SQL**: Use the connection string from Cloud SQL
- **Azure Database**: Use the connection string from Azure Portal
- **Local/Self-hosted**: Use your server's IP and port

**Example DATABASE_URL formats:**
```bash
# AWS RDS
DATABASE_URL=postgresql://postgres:password@your-db.region.rds.amazonaws.com:5432/mutumwa_ai_prod

# Google Cloud SQL
DATABASE_URL=postgresql://postgres:password@your-project:region:instance/mutumwa_ai_prod

# Self-hosted
DATABASE_URL=postgresql://postgres:password@192.168.1.100:5432/mutumwa_ai_prod
```

### 2. SonarCloud Setup (Optional)

1. **Visit https://sonarcloud.io/**
2. **Sign in with your GitHub account**
3. **Go to My Account → Security**
4. **Generate a new token**
5. **Copy the token and add it as `SONAR_TOKEN` secret**

### 3. Frontend URL Configuration

Set `NEXT_PUBLIC_API_URL` based on your deployment:

```bash
# Production API
NEXT_PUBLIC_API_URL=https://api.mutumwa-ai.com

# Staging API
NEXT_PUBLIC_API_URL=https://staging-api.mutumwa-ai.com

# Development (if deploying dev environment)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Environment-Specific Secrets

You can also set environment-specific secrets by creating **Environment secrets**:

### Creating Environments

1. **Go to Settings → Environments**
2. **Click "New environment"**
3. **Create environments: `staging`, `production`**
4. **Add environment-specific secrets**

### Environment Variables

**Staging Environment:**
```bash
DATABASE_URL=postgresql://postgres:password@staging-db:5432/mutumwa_ai_staging
NEXT_PUBLIC_API_URL=https://staging-api.mutumwa-ai.com
REDIS_URL=redis://staging-redis:6379
```

**Production Environment:**
```bash
DATABASE_URL=postgresql://postgres:password@prod-db:5432/mutumwa_ai_prod
NEXT_PUBLIC_API_URL=https://api.mutumwa-ai.com
REDIS_URL=redis://prod-redis:6379
```

## Security Best Practices

### ✅ Do's
- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific secrets
- Enable two-factor authentication on GitHub
- Use read-only database users where possible

### ❌ Don'ts
- Never commit secrets to code
- Don't use the same password across environments
- Don't share secrets in plain text
- Don't use production secrets in staging

## Validating Your Configuration

After setting up secrets, you can validate them by:

1. **Push a commit to trigger the workflow**
2. **Check the Actions tab for any failures**
3. **Review workflow logs for connection issues**

## Common Issues and Solutions

### Database Connection Issues
```bash
# Check if your database allows connections from GitHub Actions IPs
# You may need to whitelist GitHub's IP ranges or use a VPN

# Test connection string format
# Make sure there are no special characters that need URL encoding
```

### Redis Connection Issues
```bash
# Ensure Redis is accessible from external connections
# Check if Redis requires authentication
# Verify the port (default is 6379)
```

### Frontend API Issues
```bash
# Make sure NEXT_PUBLIC_API_URL includes the protocol (http/https)
# Verify the URL is accessible from the internet
# Check CORS configuration on your API
```

## Quick Setup Script

Here's a script to help you set up local environment variables for testing:

```bash
#!/bin/bash
# File: setup-env.sh

echo "Setting up environment variables for local testing..."

# Create .env file for server
cat > server/.env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/mutumwa_ai_dev
REDIS_URL=redis://localhost:6379
EOF

# Create .env.local file for frontend
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF

# Create .env file for collector
cat > collector/.env << EOF
NODE_ENV=development
SERVER_PORT=8888
EOF

echo "Environment files created!"
echo "Update the values in each .env file as needed."
```

## Troubleshooting

### Check Secret Access
```bash
# In your workflow, you can temporarily add this step to debug:
- name: Debug Secrets
  run: |
    echo "Database URL length: ${#DATABASE_URL}"
    echo "Redis URL length: ${#REDIS_URL}"
    # Never echo the actual secret values!
```

### Workflow Debugging
```bash
# Enable debug logging in GitHub Actions
# Go to Settings → Secrets and variables → Actions
# Add these secrets:
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
```

## Getting Help

If you encounter issues:

1. **Check the Actions tab** for detailed error logs
2. **Review the CI-CD.md** documentation
3. **Test connections locally** using the same credentials
4. **Check service status** of your database and Redis providers

Remember: Never share your actual secret values. Always use the GitHub Secrets interface to store sensitive information securely.
