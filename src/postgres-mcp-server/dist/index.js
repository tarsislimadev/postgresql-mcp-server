import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import knex from 'knex';
import pkg from './package.json' with { type: 'json' };
const server = new McpServer({ name: pkg.name, version: pkg.version });
const db = knex({
    client: 'pg',
    connection: process.env.POSTGRES_URL || 'postgresql://localhost:5432/psql?user=psql&password=psql'
});
const content_str = (r) => ({ content: [{ type: 'text', text: String(r) }] });
server.registerTool('sql-select', {
    title: 'SQL Select',
    description: 'Select data from a PostgreSQL database',
    inputSchema: { query: z.string() }
}, async ({ query }) => {
    const firstToken = query.toString().toLowerCase().trim().split(/\s+/).at(0) || '';
    if (firstToken.startsWith('select')) {
        return new Promise((res) => {
            db.raw(query).then((result) => {
                res(content_str(JSON.stringify(result?.rows ?? result)));
            }).catch((err) => {
                res(content_str(String(err?.message ?? err)));
            });
        });
    }
    return new Promise((_, rej) => rej(new Error('Must be a SQL Select')));
});
await server.connect(new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }));
