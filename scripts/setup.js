#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Mutumwa AI development environment...\n');

// Environment file templates
const envTemplates = {
  'collector/.env.development': `# Collector Development Environment
NODE_ENV=development
PORT=8888
STORAGE_DIR=./storage
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Optional: For local Whisper transcription
# WHISPER_MODEL_PATH=./models/whisper
# OCR_MODEL_PATH=./models/tesseract

# Optional: External APIs
# OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
`,

  'server/.env.development': `# Server Development Environment  
NODE_ENV=development
PORT=3001

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mutumwa_ai_dev
DB_USER=postgres
DB_PASSWORD=password

# Optional: JWT Secret for authentication
# JWT_SECRET=your_jwt_secret_here

# Optional: External service URLs
# COLLECTOR_URL=http://localhost:8888
# FRONTEND_URL=http://localhost:3000
`,

  'frontend/.env.local': `# Frontend Development Environment
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COLLECTOR_URL=http://localhost:8888

# Optional: Enable development features
# NEXT_PUBLIC_DEBUG=true
`
};

// Create environment files
function createEnvFiles() {
  console.log('📄 Creating environment files...');
  
  Object.entries(envTemplates).forEach(([filePath, content]) => {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Only create if file doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content);
      console.log(`  ✅ Created ${filePath}`);
    } else {
      console.log(`  ⚠️  ${filePath} already exists, skipping...`);
    }
  });
}

// Create storage directories
function createStorageDirectories() {
  console.log('\n📁 Creating storage directories...');
  
  const storageDirs = [
    'collector/storage',
    'collector/storage/documents',
    'collector/storage/tmp',
    'collector/storage/models'
  ];
  
  storageDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✅ Created ${dir}/`);
    } else {
      console.log(`  ✅ ${dir}/ already exists`);
    }
  });
}

// Create .gitignore if it doesn't exist
function createGitignore() {
  console.log('\n🔒 Checking .gitignore...');
  
  const gitignoreContent = `# Dependencies
node_modules/
.yarn/
.pnp.*

# Environment files
.env*
!.env.example

# Development
.next/
dist/
build/
*.log
*.log.*

# Database
*.db
*.sqlite

# Storage and temporary files
collector/storage/documents/
collector/storage/tmp/
collector/storage/models/
!collector/storage/.gitkeep

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Runtime
*.pid
*.seed
*.pid.lock
coverage/
.nyc_output/
`;

  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    console.log('  ✅ Created .gitignore');
  } else {
    console.log('  ✅ .gitignore already exists');
  }
}

// Create README with setup instructions
function updateReadme() {
  console.log('\n📖 Updating README...');
  
  const readmeContent = `# Mutumwa AI

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
   \`\`\`bash
   git clone <repository-url>
   cd mutumwa-ai
   npm run setup
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install:all
   \`\`\`

3. **Configure environment files:**
   - Edit \`server/.env.development\` with your database credentials
   - Edit \`collector/.env.development\` with API keys (optional)
   - Edit \`frontend/.env.local\` if needed

4. **Start development servers:**
   \`\`\`bash
   # Start all services
   npm start:all
   
   # Or start individually:
   npm run dev:server    # API server on :3001
   npm run dev:frontend  # Frontend on :3000  
   npm run dev:collector # Collector on :8888
   \`\`\`

### Database Setup

Make sure PostgreSQL is running and create the development database:

\`\`\`sql
CREATE DATABASE mutumwa_ai_dev;
\`\`\`

## Services

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Document Collector**: http://localhost:8888
- **API Documentation**: http://localhost:3001/api-docs

## Environment Variables

### Server (\`server/.env.development\`)
- \`DB_HOST\`, \`DB_PORT\`, \`DB_NAME\`, \`DB_USER\`, \`DB_PASSWORD\` - Database configuration

### Collector (\`collector/.env.development\`)  
- \`FIRECRAWL_API_KEY\` - For web crawling functionality (optional)
- \`STORAGE_DIR\` - Document storage directory

### Frontend (\`frontend/.env.local\`)
- \`NEXT_PUBLIC_API_URL\` - API server URL
- \`NEXT_PUBLIC_COLLECTOR_URL\` - Collector service URL

## Development

- \`npm run lint\` - Run linting
- \`npm run build:frontend\` - Build frontend for production
- \`npm run build:server\` - Build server for production

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with \`npm start:all\`
4. Submit a pull request
`;

  const readmePath = path.join(process.cwd(), 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log('  ✅ Updated README.md');
}

// Main setup function
async function setup() {
  try {
    createEnvFiles();
    createStorageDirectories();
    createGitignore();
    updateReadme();
    
    console.log('\n🎉 Setup complete!');    console.log('\n📋 Next steps:');
    console.log('1. Edit server/.env.development with your database credentials');
    console.log('2. Run: npm run install:all');
    console.log('3. Start development: npm run start:all');
    console.log('\n🌐 Services will be available at:');
    console.log('   Frontend:  http://localhost:3000');
    console.log('   API:       http://localhost:3001');  
    console.log('   Collector: http://localhost:8888');
    console.log('   API Docs:  http://localhost:3001/api-docs');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
