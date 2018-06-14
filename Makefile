build:
	cd main && NODE_ENV=production npx webpack --mode "production"
	npx webpack	

lint:
	npx tslint -p . -c tslint.json **/*.tsx **/*.ts --fix  --exclude **/*.d.ts
