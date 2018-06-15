build:
	npx webpack	--mode "production"
	npx webpack --config webpack.functions.js

install:
	npm install

run:
	node server.js

lint:
	npx tslint -p . -c tslint.json **/*.tsx **/*.ts --fix  --exclude **/*.d.ts
