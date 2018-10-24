.PHONY: build clean
default: build

INSTALL_DIR=./node_modules/typescript/bin/
TSC=$(INSTALL_DIR)tsc

build-node :
	$(TSC) -p --outDir

build : 
	$(TSC)
	
clean :	
		rm -rf ./dist