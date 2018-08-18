import { createMuiTheme } from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import './style.css'

// TOFIX: not working standalone currently
// import 'typeface-roboto'

// let's be a bit special and use our own theme

export default createMuiTheme({
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
