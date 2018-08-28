# oxrti

## Background

This is the current development place for new RTI/BRDF software developed inside the Computer Science department at the University of Oxford.

# Running It

If you have a local copy of the git repository, a `index.html` file is present. Opening this should load the latest version of the software. Google Chrome is recommended as the WebGL implementation is more performant and standard conform than Firefox.

## Online Copy

Just visit [our hosted version](https://oxrtimaster.azurewebsites.net/api/azurestatic) for the current master.

## Download

[Zip](https://github.com/ksjogo/oxrti/raw/master/dist/oxrti.zip) including the bundled HTML and JavaScript.

## Dev Setup

Prerequisites 
 
   * Node.js in a recent version (v8.9.4 tested)
   * Npm (>=5.6.0) and npx (>=9.7.1) in a recent version 
   * Git (in $PATH)

The repository should be ready to go after cloning and npm installing.

```
git clone https://github.com/ksjogo/oxrti.git
npm install
```

Then run:
```
npm start
```
An oxrti Electron window should open up (tested on MacOS and Windows only).


Or access the webpack dev server inside your browser after:
```
npm run-script startweb
```
Then open http://localhost:3000 inside your browser.


## Test Files

If you have a full checkout, some data files are inside the `data` directory. Otherwise run
```
git submodule update --init
```
to download them.

## Build Servers

* GNU/Linux and OSX status: [![unix status](https://travis-ci.org/ksjogo/oxrti.svg?branch=master)](https://travis-ci.org/ksjogo/oxrti)
* Windows: [![windows status](https://ci.appveyor.com/api/projects/status/41pgk56jugmeie7w?svg=true)](https://ci.appveyor.com/project/ksjogo/oxrti)


# Development
Please enable the build pre-commit hook
```
ln -s -f ../../scripts/precommit.js .git/hooks/pre-commit
```