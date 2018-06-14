import { observable } from 'mobx'
import autobind from 'autobind-decorator'
import * as querystring from 'querystring'

export default class AppState {

  async remote (command: string, args: any) {
    if (command !== 'chattoken')
      return Promise.resolve({})

    const url = `https://wellbeingbots.azurewebsites.net/api/${command}?${querystring.stringify(args)}`
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    let response = await fetch(url, {
      method: 'POST',
      headers: headers,
    })
    return response.json()
  }
}
