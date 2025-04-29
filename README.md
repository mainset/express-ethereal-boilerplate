# express ethereal boilerplate

- [Starting dev server](#starting-dev-server)
- [DB migrations](#db-migrations)
- [Project structure example](#project-structure-example)

### Starting dev server

The applications is dockerized and it starts via docker.

The correct Docker profiler is required!

To start the development server with live code changes use `--profile dev`:

```bash
docker compose --profile dev up
```

To server the production compiled static files:

```bash
docker compose --profile prod up
```

NOTE: remember to `--build` Docker image for cases when changes been made in `Dockerfile` config file:

```bash
# dev live server
docker compose --profile dev up --build
# prod server static files
docker compose --profile prod up --build
```

### DB migrations

As the applications dockerized, the migrations should be run inside the Docker container.

From the root of the project or `/dockerized` project folder, run:

```bash
docker compose exec api--express-dev pnpm run db:migrate-latest
```

### Project structure example

```
/backend
│── /src
│   │── /api
│   │   │── /controllers      # 🚀 Route handlers (business logic)
│   │   │── /routes           # 🌍 Define API routes
│   │   │── /middlewares      # 🛑 Request processing logic (auth, validation)
│   │   │── /services         # 🔄 Business logic / processing
│   │   │── /repositories     # 💾 Database access layer
│   │   │── /models           # 📄 Database models / entities
│   │   │── /validators       # ✅ Request validation logic
│   │   │── /decorators       # 🎀 Reusable metadata-based utilities
│   │   │── /utils            # 🛠️ Utility/helper functions
│   │   │── /constants        # 📌 App-wide constants
│   │   │── /types            # 🏷️ TypeScript type definitions
│   │   │── /events           # 🎧 Event-based logic (if using event emitters)
│   │── /config               # ⚙️ Configuration (env, database, etc.)
│   │── /core                 # 🏗️ Core framework-level utilities
│   │── /infra                # 🏢 Infrastructure (e.g., database, queue setup)
│   │── /scripts              # 📜 CLI scripts (e.g., migrations, seeders)
│   │── /tests                # 🧪 Tests (unit & integration)
│   ├── app.ts                # 🎬 Main app entry point
│   ├── server.ts             # 🚀 Server startup logic
│── /migrations               # 🏛️ Database migrations
│── /seeders                  # 🌱 Database seed scripts
│── /logs                     # 📜 Log files
│── .env                      # 🌎 Environment variables
│── package.json              # 📦 Dependencies & scripts
│── tsconfig.json             # 🏷️ TypeScript config
│── README.md                 # 📖 Documentation
```
