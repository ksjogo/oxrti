import { types, IModelType } from 'mobx-state-tree'
import { shim, action, mst } from 'classy-mst'
export type __IModelType = IModelType<any, any>

export const initalState = {
  uptime: 2,
  otherValue: 10,
}

const AppStateData = types.model({
  uptime: types.number,
  otherValue: types.number,
})

class AppStateController extends shim(AppStateData) {

  @action
  uptimer () {
    this.uptime += 3
  }

  @action
  otherAction () {

  }
}

const AppState = mst(AppStateController, AppStateData, 'AppState')
export default AppState

export type IAppState = typeof AppState.Type
