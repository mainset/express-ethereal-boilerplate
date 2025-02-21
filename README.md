# express ethereal boilerplate

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
