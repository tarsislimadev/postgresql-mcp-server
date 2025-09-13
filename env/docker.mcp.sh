docker run --rm -d \
  --network host \
  --name postgresql-mcp-server-1 \
  -e POSTGRES_URL=postgresql://psql:psql@postgres:5432/psql \
  tmvdl/postgresql-mcp-server 
