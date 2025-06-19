# Mutumwa AI

A multi-component AI application with document processing, web interface, and API server.

## Architecture

- **Frontend** - Next.js React application with TypeScript
- **Server** - Express.js API server with TypeScript and PostgreSQL  
- **Collector** - Node.js document processing service

## Development Setup

### Prerequisites

- Node.js >= 18.12.1
- PostgreSQL database
- npm package manager

### Quick Start

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd mutumwa-ai
   npm run setup
   ```

2. **Install dependencies:**
   ```bash
   npm install:all
   ```

3. **Configure environment files:**
   - Edit `server/.env.development` with your database credentials
   - Edit `collector/.env.development` with API keys (optional)
   - Edit `frontend/.env.local` if needed

4. **Start development servers:**
   ```bash
   # Start all services
   npm start:all
   
   # Or start individually:
   npm run dev:server    # API server on :3001
   npm run dev:frontend  # Frontend on :3000  
   npm run dev:collector # Collector on :8888
   ```

### Database Setup

Make sure PostgreSQL is running and create the development database:

```sql
CREATE DATABASE mutumwa_ai_dev;
```

## Services

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Document Collector**: http://localhost:8888
- **API Documentation**: http://localhost:3001/api-docs

## Environment Variables

### Server (`server/.env.development`)
- `DB_HOST`, `DB_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - Database configuration

### Collector (`collector/.env.development`)  
- `FIRECRAWL_API_KEY` - For web crawling functionality (optional)
- `STORAGE_DIR` - Document storage directory

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` - API server URL
- `NEXT_PUBLIC_COLLECTOR_URL` - Collector service URL

## Development

- `npm run lint` - Run linting
- `npm run build:frontend` - Build frontend for production
- `npm run build:server` - Build server for production

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm start:all`
4. Submit a pull request
