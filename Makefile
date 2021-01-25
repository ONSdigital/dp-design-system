all: audit test build

debug:
	npm install && npm run dev

build:
	npm install --unsafe-perm
	npm run build

audit:
	  npm audit --audit-level=high

test:
	npm test

.PHONY: all debug build debug audit