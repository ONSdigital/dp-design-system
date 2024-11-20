NVM_SOURCE_PATH ?= $(HOME)/.nvm/nvm.sh

ifneq ("$(wildcard $(NVM_SOURCE_PATH))","")
	NVM_EXEC = source $(NVM_SOURCE_PATH) && nvm exec --
endif
NPM = $(NVM_EXEC) npm

all: audit test build

debug:
	$(NPM) install && $(NPM) run dev

build:
	$(NPM) install --unsafe-perm
	$(NPM) run build

audit:
	$(NPM) run audit

test:
	$(NPM) run test

lint:
	$(NPM) run lint

.PHONY: all debug build debug audit lint
