import { createStyles, Theme } from '@material-ui/core'

const DrawerWidth = 400

const AppStyles = (theme: Theme) => createStyles({
    container: {
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: theme.mixins.toolbar,
    stack: {
    },
    drawer: {
        position: 'relative',
        width: `${DrawerWidth}px`,
    },
    drawerPaper: {
        position: 'relative',
        width: `${DrawerWidth}px`,
        flex: '1 0 auto',
        height: '100vh',
        display: 'flex',
        overflowY: 'auto',
        flexDirection: 'column',
    },
    content: {
        width: '100vw',
        height: '100vh',
        'max-height': 'calc(100vh - 48px)',
        'max-width': 'calc(100vw - 400px)',
    },
})

export default AppStyles
export { DrawerWidth }
