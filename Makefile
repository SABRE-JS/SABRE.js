.PHONY: help _pre-commit test

all: local

_pre-commit:
	@sh ./sbin/commands/pre-commit.sh

help:
	@echo "Valid Targets:"
	@$(MAKE) -pRrq -f $(lastword $(MAKEFILE_LIST)) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#._]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$' | xargs

test:
	@echo "Testing..."
	@sh ./sbin/commands/test.sh
	
pkg: test rebuild
	@echo "Packaging..."
	@sh ./sbin/commands/npm-package.sh

run: local
	@echo "Launching..."
	@sh ./sbin/commands/local-debug.sh
	
local:
	@echo "Compiling locally."
	@sh ./sbin/commands/local-compile.sh
	
remote:
	@echo "Compiling remotely."
	@sh ./sbin/commands/remote-compile.sh
	
clean:
	@echo "Cleaning build directorys."
	@sh ./sbin/commands/clean.sh
	
rebuild: clean local

cleanup:
	@echo "Cleaning up build tools."
	@sh ./sbin/commands/cleanup.sh
	
buildfix: 
	@echo "Fixing build tools."
	@find ./sbin/ -name *.sh -print | xargs chmod +x

genreadme:
	@jsdoc2md -d 4 --template README.hbs --files src/*.js > README.md
