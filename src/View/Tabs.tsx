import { PluginComponentType } from './Component'
import { TabProps } from '@material-ui/core/Tab'

export type TabConfig = {
    content: PluginComponentType
    tab: TabProps,
    padding?: number,
    beforeFocusGain?: () => void,
    afterFocusGain?: () => void,
    beforeFocusLose?: () => void,
    afterFocusLose?: () => void,
}
