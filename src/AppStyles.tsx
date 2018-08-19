import { createStyles, Theme } from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import './style.css'

const DrawerWidth = 350

// TOFIX: not working standalone currently
// import 'typeface-roboto'

// let's be a bit special and use our own theme

let Theme = createMuiTheme({
    palette: {
        primary: red,
    },
    overrides: {
        MuiTooltip: {
            tooltip: {
                fontSize: 16,
            },
            tooltipPlacementBottom: {
                marginTop: 5,
            },
            tooltipPlacementTop: {
                marginBottom: 5,
            },
        },
    },
})

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
    appBarActions: {
        position: 'absolute',
        right: 0,
        backgroundColor: theme.palette.primary.main,
        borderLeft: '2px solid rgba(255, 255, 255, 0.12)',
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
        'max-width': `calc(100vw - ${DrawerWidth}px)`,
    },
})

export default AppStyles
export { DrawerWidth, Theme }
