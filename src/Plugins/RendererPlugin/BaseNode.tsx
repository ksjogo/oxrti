import { ComponentProps } from '../../View/Component'
import { IWrappedComponent } from 'mobx-react'

export default abstract class BaseNode {
    abstract render: React.StatelessComponent<ComponentProps> & IWrappedComponent<React.StatelessComponent<ComponentProps>>
}
