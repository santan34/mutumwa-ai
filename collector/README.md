# Collector

A modular Node.js backend for crawling, processing, and syncing content from URLs, files, and repositories. Designed for extensibility, it supports custom middleware, document embedding, and integrations with platforms like GitHub, Confluence, and more.

## Features

- **Crawl URLs**: Scrape and process web pages for text content.
- **Process Files**: Handle single files or batches for ingestion.
- **Repository Sync**: Load and sync content from GitHub and GitLab repositories.
- **Extensible**: Add new content sources via the `extensions/` system.
- **Middleware**: Includes payload integrity verification and data signing.
- **Temporary Storage**: Uses a local storage directory for intermediate files.

## Project Structure

```
.
├── index.js                # Main server entry point
├── upload.js               # File upload handling
├── extensions/             # Extension endpoints (e.g., resync, obsidian vault)
├── hotdir/                 # Hot directory for special files
├── middleware/             # Middleware for signing and integrity
├── processCrawl/           # Web crawling logic
├── processLink/            # Link processing logic
├── processLinkWithFirecrawl/
├── processRawText/
├── processSingleFile/
├── storage/                # Temporary and persistent storage
├── utils/                  # Utility modules (constants, encryption, logger, etc.)
├── .env                    # Environment variables
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` for version)
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/collector.git
    cd collector
    ```

2. Install dependencies:
    ```sh
    npm install --legacy-peer-deps
    ```

3. Copy `.env.example` to `.env` and fill in required environment variables:
    ```sh
    cp .env.example .env
    ```

### Running the Server

```sh
npm start
```

Or, for development with auto-reload:

```sh
npm run dev
```

### API Endpoints
- `GET /accepts`
  List all accepted file types

- `POST /crawl`  
  Crawl a URL and return processed documents.

- `POST /process-raw-text`  
  Processes raw text.

- `POST /process`  
  Process a single file.

- `POST /process-link`  
  Process a link using Firecrawl.

- `POST /upload`
  Upload a file to hotdir be processed. 

- `POST /ext/resync-source-document`  
  Resync a document from a supported source (e.g., GitHub, Confluence).

- `POST /ext/:repo_platform-repo`  
  Load a repository from GitHub or GitLab.

### Extensions

Add new integrations or sync methods in the `extensions/` directory. See [extensions/index.js](extensions/index.js) for registration.

### Storage

Temporary files and processed documents are stored in the `hotdir` directory.

---

**Note:** This project uses third-party APIs (e.g. Firecrawl). Ensure you have the necessary API keys and permissions set in your `.env` file.