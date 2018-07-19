# oxrti

## Background

This is the current development place for new RTI/BRDF software developed inside the Computer Science department at the University of Oxford.
The inital parts will be the main body of a master thesis by Johannes "ksjogo" Goslar, which will contain deeper discussion of all components.

# Running It

## Local static copy
To access the precompiled local copy, just
```
open index.html
```
inside some web browser.

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

Access either the webpack dev server inside your browser:
```
npm run-script startweb
```
Then open http://localhost:3000 inside your browser.

Or use the electron version:
```
npm start
```
An oxrti window should open up.

## Test Files

There are some test files inside a submodule. Run
```
git submodule update --init
```
to download them.

## Build Servers

* GNU/Linux and OSX status: [![unix status](https://travis-ci.org/ksjogo/oxrti.svg?branch=master)](https://travis-ci.org/ksjogo/oxrti)
* Windows: [![windows status](https://ci.appveyor.com/api/projects/status/41pgk56jugmeie7w?svg=true)](https://ci.appveyor.com/project/ksjogo/oxrti)

## Online Copy

Later live versions will be available online and hosted.

<!--
The easiest way to access to software is by visiting [our hosted version](https://oxrti.azurewebsites.net/api/azurestatic) for the latest release. To see the current master, visit [here](https://oxrti-master.azurewebsites.net/api/azurestatic).

-->