.PHONY: build clean
default: build-node

TSC_INSTALL_DIR=./node_modules/typescript/bin/
TSC=$(TSC_INSTALL_DIR)tsc

JEST_INSTALL_DIR=./node_modules/jest/bin/
JEST=$(JEST_INSTALL_DIR)jest.js

build-node:
	$(TSC) -p "$(CURDIR)/src/platforms/node/tsconfig.node.json"
	cp ./scripts/vm.bat ./dist/node/vm.bat

test:
	node $(JEST) src

clean:	
	rm -rf ./dist