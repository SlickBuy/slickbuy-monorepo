# Database configuration

This API is configured to use PostgreSQL via environment variables.

Environment variables:

- POSTGRES_HOST (default: localhost)
- POSTGRES_PORT (default: 5432)
- POSTGRES_USER (default: auction)
- POSTGRES_PASSWORD (default: auction)
- POSTGRES_DB (default: auction)

Local development:

1. Start Postgres with Docker Compose at the repo root:

   docker compose up -d db

2. Create a .env file under apps/api/ and set the variables above as needed.

3. Start the API:

   npm run dev --workspace=apps/api

Production:

- Set synchronize: false and use TypeORM migrations.
- Point env vars to your managed Postgres.
