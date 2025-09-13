import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import knex from "knex";
import pkg from './package.json' with { type: 'json' };
const db = knex({
    client: "pg",
    connection: process.env.POSTGRES_URL ||
        "postgresql://localhost:5432/psql?user=psql&password=psql",
});
const content = (text) => ({
    content: [{ type: "text", text: String(text) }],
});
export default function server_creator() {
    const server = new McpServer({
        name: pkg.name, // "postgresql-mcp-server",
        version: pkg.version, // "0.1.0",
    });
    server.registerTool("sql-select", {
        title: "SQL Select",
        description: "Select data from a PostgreSQL database",
        inputSchema: { query: z.string() },
    }, async ({ query }) => {
        const firstToken = query.toString().toLowerCase().trim().split(/\s+/).at(0) || "";
        if (firstToken.startsWith("select")) {
            try {
                const result = await db.raw(query);
                return content(JSON.stringify(result?.rows ?? result));
            }
            catch (err) {
                return content(String(err?.message ?? err));
            }
        }
        throw new Error("Must be a SQL Select");
    });
    return server;
}
