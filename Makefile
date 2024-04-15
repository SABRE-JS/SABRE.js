.PHONY: help _pre-commit test

all: local

_pre-commit:
	@sh ./scripts/commands/pre-commit.sh

help:
	@echo "Valid Targets:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#._]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | xargs

deps:
	@echo "Update dependencies..."
	@sh ./scripts/commands/update-dependencies.sh

test: deps
	@echo "Testing..."
	@sh ./scripts/commands/test.sh
	
pkg: test rebuild
	@echo "Packaging..."
	@sh ./scripts/commands/npm-package.sh

run: local
	@echo "Launching..."
	@sh ./scripts/commands/local-debug.sh
	
local:
	@echo "Compiling locally."
	@sh ./scripts/commands/local-compile.sh
	
remote:
	@echo "Compiling remotely."
	@sh ./scripts/commands/remote-compile.sh
	
clean:
	@echo "Cleaning build directorys."
	@sh ./scripts/commands/clean.sh
	
rebuild: clean deps local

cleanup:
	@echo "Cleaning up build tools."
	@sh ./scripts/commands/cleanup.sh
	
buildfix: 
	@echo "Fixing build tools."
	@find ./scripts/ -name *.sh -print | xargs chmod +x

genreadme:
	@sh ./scripts/commands/generate-readme.sh
