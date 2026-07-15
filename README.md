# StudyBlocks-AI

Full-stack AI learning platform that transforms academic material into structured study data, knowledge graphs, and source-grounded AI explanations.

## Current Status

* React app moved to `apps/web`.
* NestJS API added in `apps/api`.
* Monorepo configured with npm workspaces.
* Root scripts added for development, linting, testing, and builds.
* API health endpoint added at `/api/v1/health`.
* Environment validation and CORS configured.
* PostgreSQL added with Docker Compose.
* Prisma configured with PostgreSQL.
* Initial `Course` database model added.
* First database migration created.
* Markdown parser covered with 28 tests.
* API unit and e2e tests added.

## Project Structure

```text
StudyBlocks-AI/
├── apps/
│   ├── web/
│   └── api/
├── docs/
├── infrastructure/
├── packages/
├── docker-compose.yml
├── package.json
└── README.md
```

## Requirements

* Node.js
* npm
* Docker Desktop

## Setup

Install dependencies from the project root:

```bash
npm install
```

Create the API environment file:

```bash
cp apps/api/.env.example apps/api/.env
```

Start PostgreSQL:

```bash
npm run db:up
```

Run Prisma migrations:

```bash
npm run prisma:migrate
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Start the web app and API:

```bash
npm run dev
```

## Local URLs

Web app:

```text
http://localhost:5173
```

API health check:

```text
http://localhost:3000/api/v1/health
```

Prisma Studio:

```bash
npm run prisma:studio
```

## Quality Checks

Run all checks:

```bash
npm run lint
npm run test
npm run build
```

Run checks separately:

```bash
npm run lint:web
npm run test:web
npm run build:web

npm run lint:api
npm run test:api
npm run test:api:e2e
npm run build:api
```

## Database

Local database runs through Docker Compose.

```bash
npm run db:up
npm run db:logs
npm run db:down
```

Current database model:

```text
Course
```

The local development database URL in `.env.example` is safe to commit because it points to the local Docker database.

Never commit real production credentials, API keys, or cloud database URLs.

## Next Phase

Build the Course CRUD API:

```http
GET    /api/v1/courses
GET    /api/v1/courses/:id
POST   /api/v1/courses
PATCH  /api/v1/courses/:id
DELETE /api/v1/courses/:id
```
