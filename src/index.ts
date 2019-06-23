/*
 * The Meet JS SDK Library for Meet.ONE Client
 * This library is used to assist in generating the protocol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2019-06-19 14:26:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-23 21:03:11
 */

import Common from './app/Common'
import { Config } from './app/Interface'
import { defaultConfig, version } from './app/defaultConfig'

import Network from './util/Network'

/** The Meet JS SDK Library for MEET.ONE Client */
export class MeetWallet extends Common {
  /** current js-sdk version */
  config: Config = defaultConfig

  constructor(initConfig?: Config) {
    super(Object.assign({}, defaultConfig, initConfig, { version: version }))
    this.config = Object.assign({}, defaultConfig, initConfig, { version: version })
    // for browsers
    if (typeof window !== 'undefined') {
      if (document.readyState !== 'loading') {
        this._init()
      } else {
        document.addEventListener('DOMContentLoaded', this._init)
      }
    } else {
      // nodejs
    }
  }

  /** init the  */
  private _init() {
    // judge `addJSMessageHandleFlag` whatever it is 1 for preventing mutil listening
    if (window.document.body.getAttribute('addJSMessageHandleFlag') !== '1') {
      window.document.body.setAttribute('addJSMessageHandleFlag', '1')
      // auto add `message` EventListener
      window.document.addEventListener('message', e => {
        try {
          // @ts-ignore
          const { params, callbackId } = JSON.parse(e.data)
          // Will skip old Library ('meet-bridge') callback
          // Notice that, we will skip the callback startwith `meet_callback`
          // So don't use it if you manually define callbackid
          if (callbackId.startsWith('meet_callback')) {
            return
          }
          const resultJSON = decodeURIComponent(atob(params))
          const result = JSON.parse(resultJSON)
          if (callbackId) {
            // @ts-ignore
            window[callbackId](result)
          }
        } catch (error) {}
      })
    }
  }
}

// export default MeetWallet
export { Network as Http }
