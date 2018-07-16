import installExtension, { REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer'
import init from '../Loader'
try {
    const tools = [REACT_DEVELOPER_TOOLS, MOBX_DEVTOOLS, REDUX_DEVTOOLS]
        .forEach(name => {
            installExtension(name)
                .then((name) => console.log(`Added Extension:  ${name}`))
                .catch((err) => console.log('An error occurred: ', err))
        })
} catch (e) {
    console.log('Extension install failed:', e)
}

init('app')
