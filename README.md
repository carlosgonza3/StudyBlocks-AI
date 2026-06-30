# Study Blocks
Dynamic Markdown-based study guide platform that parses user-written notes into a structured hierarchy and converts sections into interactive study cards.


### Current Progress

* Converted the project into an npm workspace.
* Moved the React app to apps/web.
* Added a NestJS API in apps/api.
* Added /api/v1/health.
* Added environment validation and CORS configuration.
* Added unit and end-to-end API tests.
* Added 28 tests for the Markdown parser.
* Configured shared root scripts for development, linting, testing, and builds.
* Verified clean dependency installation from the root workspace.

#### Run Locally

```
    npm install
    npm run dev    
```


>  Web:
    http://localhost:5173

> API health check:
    http://localhost:3000/api/v1/health

#### Quality Checks

```
    npm run lint
    npm run test
    npm run build 
```

