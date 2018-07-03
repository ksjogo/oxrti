start:
	npx electron-webpack dev

startweb:
	node server.js

build:
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
	npx tslint -p . -c tslint.json **/*.tsx **/*.ts --fix  --exclude **/*.d.ts

patches:
	sed -i 's/if (!options.ignoreUnaccepted)/if (false)/' node_modules/webpack/lib/HotModuleReplacement.runtime.js