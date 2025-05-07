docker run -d \
  --name opencrvs \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:17
