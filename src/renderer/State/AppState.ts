import { observable } from 'mobx'
import autobind from 'autobind-decorator'
import * as querystring from 'querystring'

export default class AppState {

  @observable
  uptime = 0

  @autobind
  uptimer () {
    this.uptime += 1
    setTimeout(this.uptimer, 1000)
  }

  constructor (old?: AppState) {
    if (old) {
      this.uptime = old.uptime
    }

    setTimeout(this.uptimer, 10)
  }

}
