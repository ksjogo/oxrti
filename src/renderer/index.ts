import init from '../Loader'

try {
    let installExtension = require('electron-devtools-installer')
    const tools = [installExtension.REACT_DEVELOPER_TOOLS, installExtension.MOBX_DEVTOOLS, installExtension.REDUX_DEVTOOLS]
        .forEach(name => {
            installExtension.default(name)
                .then((name: string) => console.log(`Added Extension:  ${name}`))
                .catch((err: any) => console.log('An error occurred: ', err))
        })
} catch (e) {
    console.error('Extension install failed:', e)
}

init('app')
