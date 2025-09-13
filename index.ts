#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Client } from "pg";

// PostgreSQL connection configuration
const POSTGRES_URL = process.env.POSTGRES_URL || "postgresql://localhost:5432/postgres";
const POSTGRES_HOST = process.env.POSTGRES_HOST || "localhost";
const POSTGRES_PORT = parseInt(process.env.POSTGRES_PORT || "5432");
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE || "postgres";
const POSTGRES_USER = process.env.POSTGRES_USER || "postgres";
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || "";

// Create PostgreSQL client
const client = new Client({
  connectionString: POSTGRES_URL,
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  database: POSTGRES_DATABASE,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
});

// Connect to PostgreSQL
async function connectToDatabase() {
  try {
    await client.connect();
    console.error("Connected to PostgreSQL database");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
}

// Define tools
const tools: Tool[] = [
  {
    name: "query",
    description: "Execute a SQL query on the PostgreSQL database",
    inputSchema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "The SQL query to execute",
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "list_tables",
    description: "List all tables in the current database",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "describe_table",
    description: "Get detailed information about a specific table",
    inputSchema: {
      type: "object",
      properties: {
        table_name: {
          type: "string",
          description: "The name of the table to describe",
        },
      },
      required: ["table_name"],
    },
  },
  {
    name: "list_databases",
    description: "List all available databases",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_schemas",
    description: "List all schemas in the current database",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: "postgresql-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle call tool request
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "query": {
        const { sql } = args as { sql: string };
        const result = await client.query(sql);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                rows: result.rows,
                rowCount: result.rowCount,
                fields: result.fields?.map((f: any) => ({
                  name: f.name,
                  dataTypeID: f.dataTypeID,
                  dataTypeSize: f.dataTypeSize,
                })),
              }, null, 2),
            },
          ],
        };
      }

      case "list_tables": {
        const result = await client.query(`
          SELECT 
            schemaname,
            tablename,
            tableowner,
            hasindexes,
            hasrules,
            hastriggers
          FROM pg_tables 
          WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
          ORDER BY schemaname, tablename;
        `);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      }

      case "describe_table": {
        const { table_name } = args as { table_name: string };
        const result = await client.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [table_name]);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      }

      case "list_databases": {
        const result = await client.query(`
          SELECT datname FROM pg_database 
          WHERE datistemplate = false
          ORDER BY datname;
        `);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      }

      case "list_schemas": {
        const result = await client.query(`
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          ORDER BY schema_name;
        `);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Main function
async function main() {
  // Connect to database
  await connectToDatabase();

  // Create stdio transport
  const transport = new StdioServerTransport();

  // Connect server to transport
  await server.connect(transport);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.error("Shutting down...");
    await client.end();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error("Shutting down...");
    await client.end();
    process.exit(0);
  });
}

// Start the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
