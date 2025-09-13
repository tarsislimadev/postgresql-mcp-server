docker run --rm -d \
  --network host \
  --name postgresql-1 \
  -e POSTGRES_DB=psql \
  -e POSTGRES_USER=psql \
  -e POSTGRES_PASSWORD=psql \
  postgres:alpine
