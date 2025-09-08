## PostgreSQL MCP Server

Run simple read‑only SQL queries against PostgreSQL through a Model Context Protocol (MCP) server.

### What you get
- **MCP over HTTP (port 8080)**
- **One tool: `sql-select`** — executes `SELECT` queries
- **PostgreSQL connection via `POSTGRES_URL`**

### Quick start (Docker)
```bash
docker compose up --build
```
The server starts at `http://localhost:8080`.

Set your database URL by exporting it before starting, or by editing your compose file:
```bash
export POSTGRES_URL="postgresql://user:password@host:5432/dbname"
docker compose up --build
```

### Use with an MCP client
- Connect your MCP‑compatible client to `http://localhost:8080`.
- Call the `sql-select` tool with an input object:
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

### License
MIT
