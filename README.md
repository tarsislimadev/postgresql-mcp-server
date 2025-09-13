## PostgreSQL MCP Server

Run simple read‑only SQL queries against PostgreSQL through a Model Context Protocol (MCP) server.

### What you get
- **MCP over HTTP (port 8080)**
- **One tool: `sql-select`** — executes `SELECT` queries
- **PostgreSQL connection via `POSTGRES_URL`**

### Quick start (Docker)

#### Option 1: Using convenience scripts
The project includes convenience scripts in the `env/` directory for easy setup:

1. **Start PostgreSQL database:**
```bash
./env/docker.postgres.sh
```
This runs a PostgreSQL container with default credentials:
- Database: `psql`
- User: `psql` 
- Password: `psql`
- Port: `5432` (host network)

2. **Start the MCP server:**
```bash
./env/docker.mcp.sh
```
This runs the PostgreSQL MCP server container connected to the database.

3. **Alternative: Use docker-compose directly:**
```bash
./env/docker.up.sh
```
Or run `docker compose up --build` directly.

#### Option 2: Manual docker-compose
```bash
docker compose up --build
```

The server starts at `http://localhost:8080`.

#### Setting your database URL
Set your database URL by exporting it before starting, or by editing your compose file:
```bash
export POSTGRES_URL="postgresql://user:password@host:5432/dbname"
docker compose up --build
```

### Use with an MCP client

#### Configuration via .mcp.json

Create a `.mcp.json` file in your project root or MCP client configuration directory to connect to this PostgreSQL MCP server:

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_URL": "postgresql://psql:psql@localhost:5432/psql"
      }
    }
  }
}
```

#### Alternative: HTTP-based configuration

If your MCP client supports HTTP-based servers, you can configure it to connect to the running server:

```json
{
  "mcpServers": {
    "postgresql": {
      "url": "http://localhost:8080",
      "type": "http"
    }
  }
}
```

#### Environment variables

You can customize the PostgreSQL connection by setting environment variables:

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_URL": "postgresql://username:password@hostname:port/database",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "your_username",
        "POSTGRES_PASSWORD": "your_password",
        "POSTGRES_DB": "your_database"
      }
    }
  }
}
```

#### Docker-based configuration

If you're running the server via Docker (as described in Quick Start), use this configuration:

```json
{
  "mcpServers": {
    "postgresql": {
      "url": "http://localhost:8080",
      "type": "http"
    }
  }
}
```

#### Using the server

Once configured, you can call the `sql-select` tool with an input object:
- `query`: a SQL string (intended for `SELECT`).

Example input:
```json
{ "query": "select 1 as ok" }
```
The server returns a text payload containing the result rows (or an error message).

### Notes
- Designed for read‑only queries. It performs a basic check and may not catch every non‑SELECT case.
- Output is text. Some clients may need to parse JSON rows from the text.

### Folder layout
- `src/postgres-mcp-server/index.mjs` — MCP server and tool
- `src/postgres-mcp-server/Dockerfile` — container image
- `docker-compose.yml` — local run setup
- `env/docker.postgres.sh` — convenience script to start PostgreSQL container
- `env/docker.mcp.sh` — convenience script to start MCP server container
- `env/docker.up.sh` — convenience script to run docker-compose

### License
MIT
