# Mutumwa AI Development Guide

## Quick Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd mutumwa-ai
   npm run setup
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Start Database (Option 1: Docker)**
   ```bash
   docker-compose up -d postgres
   ```

   **OR Start Database (Option 2: Local PostgreSQL)**
   ```sql
   -- Connect to PostgreSQL and run:
   CREATE DATABASE mutumwa_ai_dev;
   ```

4. **Configure Environment**
   - Edit `server/.env.development` with your database credentials
   - Edit `collector/.env.development` with API keys (optional)

5. **Start Development**
   ```bash
   npm run start:all
   ```

## Services Overview

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| Frontend | 3000 | Next.js React app | http://localhost:3000 |
| Server | 3001 | Express API server | http://localhost:3001 |
| Collector | 8888 | Document processor | http://localhost:8888 |
| API Docs | 3001 | Swagger documentation | http://localhost:3001/api-docs |

## Individual Service Commands

```bash
# Start services individually
npm run dev:server    # Start API server
npm run dev:frontend  # Start frontend
npm run dev:collector # Start document collector

# Build for production  
npm run build:frontend
npm run build:server

# Run linting
npm run lint
```

## Environment Files

### Server (`.env.development`)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
POSTGRES_DB=mutumwa_ai_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
```

### Collector (`.env.development`)
```env
NODE_ENV=development
PORT=8888
STORAGE_DIR=./storage
FIRECRAWL_API_KEY=your_api_key_here
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COLLECTOR_URL=http://localhost:8888
```

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Server    │    │  Collector  │
│  (Next.js)  │◄──►│ (Express)   │◄──►│ (Node.js)   │
│   :3000     │    │   :3001     │    │   :8888     │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌─────────────┐
                    │ PostgreSQL  │
                    │   :5432     │
                    └─────────────┘
```

## Development Workflow

1. **Database Changes**
   - Modify entities in `server/src/entities/`
   - Run migrations: `cd server && npx mikro-orm migration:create`

2. **API Changes**
   - Add routes in `server/src/routes/`
   - Add controllers in `server/src/controllers/`
   - Update Swagger docs in controllers

3. **Frontend Changes**
   - Edit components in `frontend/app/`
   - Use Tailwind CSS for styling

4. **Document Processing**
   - Add processors in `collector/processSingleFile/`
   - Extend utilities in `collector/utils/`

## Troubleshooting

**Port Conflicts:**
- Change ports in respective `.env` files
- Update CORS origins in server

**Database Connection:**
```bash
# Test connection
psql -h localhost -U postgres -d mutumwa_ai_dev
```

**Module Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules */node_modules
npm run install:all
```

**Storage Issues:**
```bash
# Reset collector storage
rm -rf collector/storage/documents/*
rm -rf collector/storage/tmp/*
```

## Production Deployment

1. **Build all services:**
   ```bash
   npm run build:frontend
   npm run build:server
   ```

2. **Set production environment variables**

3. **Deploy using Docker or your preferred platform**

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Ensure all services start with `npm run start:all`
4. Submit a pull request

## API Documentation

Visit http://localhost:3001/api-docs when the server is running to see the complete API documentation.
