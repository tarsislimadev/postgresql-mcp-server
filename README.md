## PostgreSQL MCP Server

A simple PostgreSQL MCP server

### Quick start (Docker)

**Start PostgreSQL database:**
```bash
docker run --rm -d \
  --network host \
  --name postgresql-1 \
  -e POSTGRES_DB=psql \
  -e POSTGRES_USER=psql \
  -e POSTGRES_PASSWORD=psql \
  postgres:alpine
```

This runs a PostgreSQL container with default credentials:
- Database: `psql`
- User: `psql` 
- Password: `psql`
- Port: `5432` (host network)

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
        "@tarsislimadev/postgresql-mcp-server"
      ],
      "env": {
        "POSTGRES_URL": "postgresql://psql:psql@localhost:5432/psql"
      }
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

### License

[MIT](./LICENSE)
