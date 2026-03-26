.PHONY: dev build preview install clean check \
       db-generate db-push db-migrate db-studio \
       pdf-dev pdf-build pdf-check pdf-test \
       services-up services-down services-destroy services-logs services-ps psql \
       caddy-validate caddy-fmt

dev:
	pnpm run dev

build:
	pnpm run build

preview:
	pnpm run preview

install:
	pnpm install --frozen-lockfile

check:
	pnpm run check

db-generate:
	pnpm drizzle-kit generate

db-push:
	pnpm drizzle-kit push

db-migrate:
	pnpm tsx scripts/migrate.ts

db-studio:
	pnpm drizzle-kit studio

clean:
	rm -rf node_modules .svelte-kit build

pdf-dev:
	cd pdf-service && cargo run

pdf-build:
	cd pdf-service && cargo build --release

pdf-check:
	cd pdf-service && cargo check

pdf-test:
	cd pdf-service && cargo test

services-up:
	docker compose up -d

services-down:
	docker compose down

services-destroy:
	docker compose down -v

services-logs:
	docker compose logs -f

services-ps:
	docker compose ps

psql:
	docker compose exec postgres psql -U hosted_resumes -d hosted_resumes

caddy-validate:
	caddy validate --config deploy/Caddyfile

caddy-fmt:
	caddy fmt --overwrite deploy/Caddyfile
