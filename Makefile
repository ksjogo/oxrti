start:
	npx electron-webpack dev

startweb:
	node server.js

build:
	sed -i "s/<title>Oxrti.*<\/title>/<title>Oxrti - $$(date)<\/title>/" azurestatic/index.html
	npx webpack	--mode "production"
	npx webpack --config webpack.functions.js

install:
	npm install

electronbuild:
	npx electron-webpack build --mode "production"
	sed -i 's/require("source-map-support\/source-map-support.js").install(),//' dist/main/main.js
	npx electron-builder -c.mac.identity=null

macPrepare:
	brew install anttweakbar freeimage glew glfw3

lint:
	npx tslint --project . --fix -e oxrti.plugins.json

patches:
	@echo "Fixing Webpack HMR"
	@sed -i 's/if (!options.ignoreUnaccepted)/if (false)/' node_modules/webpack/lib/HotModuleReplacement.runtime.js
	@echo "Fixing Webpack WS"
	@sed -i "s/  WebSocket = require('ws');/  throw new Error('we cannot use ws, it will annoy webpack');/" ./node_modules/socketcluster-client/lib/sctransport.js
