all: audit test build

debug:
	npm install && npm run dev

build:
	npm install --unsafe-perm
	npm run build

audit:
	  npm run audit --audit-level=high

test:
	npm run test

lint:
	npm run lint

.PHONY: all debug build debug audit lint