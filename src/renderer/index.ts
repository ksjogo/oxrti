import init from '../Loader'

try {
    let installExtension = require('electron-devtools-installer')
    const tools = [installExtension.REACT_DEVELOPER_TOOLS, installExtension.MOBX_DEVTOOLS, installExtension.REDUX_DEVTOOLS]
        .forEach(name => {
            installExtension.default(name)
                .then((name) => console.log(`Added Extension:  ${name}`))
                .catch((err) => console.log('An error occurred: ', err))
        })
} catch (e) {
    console.log('Extension install failed:', e)
}

init('app')
