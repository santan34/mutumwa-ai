# Coolify Deployment Guide

This Docker Compose configuration is optimized for deployment with Coolify, a self-hosted application deployment platform.

## Architecture

The application consists of:
- **PostgreSQL**: Database service (internal only)
- **Redis**: Cache service (internal only)
- **Collector**: Data collection service (port 8888)
- **Server**: API backend (port 3001)
- **Frontend**: Next.js frontend (port 3000)

## Key Features for Coolify

### Internal Services
- PostgreSQL and Redis are configured as internal services
- No external ports exposed for database services
- Services communicate through the `mutumwa-network` bridge network

### Health Checks
- PostgreSQL: `pg_isready` command
- Redis: `redis-cli ping` command
- Ensures services are ready before dependent services start

### Labels
- `coolify.managed=true`: Marks services as managed by Coolify
- `coolify.type`: Categorizes services (database, cache, service, application)
- Traefik labels for routing (frontend and server)

### Environment Variables
- Configurable through environment variables
- Sensible defaults provided
- Copy `.env.example` to `.env` and customize

## Deployment Steps

### 1. Local Development
```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your values
# Start services
docker-compose up -d
```

### 2. Coolify Deployment
1. Create a new application in Coolify
2. Connect your Git repository
3. Set environment variables in Coolify dashboard
4. Deploy the application

### 3. Environment Variables to Set in Coolify
```
POSTGRES_PASSWORD=your_secure_password
SERVER_DOMAIN=your-api-domain.com
FRONTEND_DOMAIN=your-frontend-domain.com
NODE_ENV=production
```

## Service Communication

### Internal URLs
- Database: `postgres:5432`
- Redis: `redis:6379`
- Server API: `server:3001`
- Collector: `collector:8888`

### External Access
- Frontend: `http://localhost:3000` (or your domain)
- Server API: `http://localhost:3001` (or your domain)
- Collector: `http://localhost:8888` (or your domain)

## Volumes

- `postgres_data`: PostgreSQL data persistence
- `redis_data`: Redis data persistence
- `./collector/storage`: Collector file storage
- `./collector/hotdir`: Collector hot directory

## Networks

- `mutumwa-network`: Bridge network for internal communication

## Health Monitoring

All services include health checks:
- PostgreSQL: Checks database connectivity
- Redis: Checks cache connectivity
- Dependent services wait for healthy status

## Scaling

To scale services in Coolify:
1. Use Coolify's scaling options
2. Ensure database connections are properly configured
3. Consider Redis connection pooling for high-scale deployments

## Troubleshooting

### Common Issues
1. **Database connection failed**: Check POSTGRES_PASSWORD and network connectivity
2. **Redis connection failed**: Verify Redis service is healthy
3. **Services not starting**: Check health check logs

### Debugging Commands
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Check network connectivity
docker-compose exec server ping postgres
docker-compose exec server ping redis
```

## Security Considerations

- Database and Redis are not exposed externally
- Use strong passwords for production
- Configure SSL/TLS for external services
- Review Coolify security settings

## Migration from Existing Setup

If migrating from an existing setup:
1. Backup your database
2. Update environment variables
3. Test in staging environment
4. Deploy to production
5. Restore database if needed
