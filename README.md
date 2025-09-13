# PostgreSQL MCP Server

A simple PostgreSQL MCP server

# Use with an MCP client

## Configuration via .mcp.json

Create a `.mcp.json` file in your project root or MCP client configuration directory to connect to this PostgreSQL MCP server:

```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": [ "-y", "@tarsislimadev/postgresql-mcp-server" ],
      "env": {
        "POSTGRES_URL": "postgresql://psql:psql@localhost:5432/psql"
      }
    }
  }
}
```

# Start your PostgreSQL server with Docker

```bash
docker run --rm -d \
  --network host \
  --name psql-1 \
  -e POSTGRES_DB=psql \
  -e POSTGRES_USER=psql \
  -e POSTGRES_PASSWORD=psql \
  postgres:alpine
```

# License

[MIT](./LICENSE)
