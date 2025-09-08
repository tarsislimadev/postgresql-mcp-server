import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHttpServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { Pool } from 'pg';
import pkg from './package.json'

const server = new McpServer({ name: pkg.name, version: pkg.version });

const conn = () => new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://localhost:5432/psql?user=psql&password=psql'
});

const content_str = (r) => ({ content: [{ type: 'text', text: String(r) }] })

server.registerTool('sql-select',
  {
    title: 'SQL Select',
    description: 'Select data from a PostgreSQL database',
    inputSchema: z.object({ query: z.string() })
  },
  async ({ query }) => {
    if (query.toString().toLowerCase().trim().split(' ').at(0).startsWith('select')) {
      return  new Promise((res) => {
        conn().query(query, (err, result) => {
          if (err) res(content_str(err.message))
          else res(content_str(result.rows))
        })
      })
    }
    return  new Promise((_, rej) => rej(new Error('Must be a SQL Select')))
  }
);

await server.connect(new StreamableHttpServerTransport({ port: 8080 }));
