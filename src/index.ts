/*
 * The Meet JS SDK Library for Meet.ONE Client
 * This library is used to assist in generating the protocol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2019-06-19 14:26:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-21 20:50:15
 */

import Common from './app/Common'
const VERSION = '0.0.1'

class MeetWallet extends Common {
  /** current js-sdk version */
  version: string = ''
  /** protocal string */
  protocal: string = 'meetone://'

  constructor(protocal?: string) {
    super(protocal)
    this.version = VERSION
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
            console.log('skip:' + callbackId)
            return
          }
          const resultJSON = decodeURIComponent(atob(params))
          const result = JSON.parse(resultJSON)
          console.log(callbackId, result)
          if (callbackId) {
            // @ts-ignore
            window[callbackId](result)
          }
        } catch (error) {
          // TODO: 前端监控机制
        }
      })
    }
  }

  /** Change the meet-js-sdk Protocal */
  setProtocal(protocal: string): void {
    this.protocal = protocal
  }
}

let meetwallet = new MeetWallet()

// browsers
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.meetwallet = meetwallet
}

// nodejs
export default meetwallet
