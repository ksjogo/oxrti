# oxrti

## Background

This is the current development place for new RTI/BRDF software developed inside the Computer Science department at the University of Oxford.
The inital parts will be the main body of a master thesis by Johannes "ksjogo" Goslar, which will contain deeper discussion of all components.

The easiest way to access to software is by visiting [our hosted version](https://oxrti.azurewebsites.net/api/azurestatic) for the latest release. To see the current master, visit [here](https://oxrti-master.azurewebsites.net/api/azurestatic).

# Dev Installation

 Prerequisites 
 
   * Node.js in a recent version (v8.9.4 tested)
   * Npm (5.6.0) and npx (9.7.1) in a recent version 
   * node-webgl dependencies ( `brew install anttweakbar freeimage glew glfw3` for macs)

The repository should be ready to go after cloning and npm installing.

```
git clone https://github.com/ksjogo/oxrti.git
npm install
npx electron-webpack dev
```

An oxrti window should open up.