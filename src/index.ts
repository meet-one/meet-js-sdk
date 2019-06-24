/*
 * The Meet JS SDK Library for Meet.ONE Client
 * This library is used to assist in generating the protcol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2019-06-19 14:26:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-24 13:50:14
 */

import Common from './app/Common'
import { Config } from './app/Interface'
import { defaultConfig, version } from './app/DefaultConfig'

import Network from './util/Network'
import { EOS } from './blockchain/eos/eos'
import Blockchian from './blockchain/BlockChain'

/** The Meet JS SDK Library for MEET.ONE Client */
export class MeetWallet extends Common {
  /** current js-sdk version */
  config: Config = defaultConfig
  /**  */
  blockchain: Blockchian

  constructor(initConfig?: Config) {
    super(Object.assign({}, defaultConfig, initConfig, { version: version }))
    this.config = Object.assign({}, defaultConfig, initConfig, { version: version })
    // 获取当前节点的信息
    // this.network().then(res => {
    //   // network config info
    //   if (res.code === 0) {
    //     // 新版参数
    //     let { blockchain, chainId, host, port, protocol } = res.data
    //     console.info(blockchain, chainId, host, port, protocol)
    //   }
    // })
    this.updateNetwork()
    this.blockchain = new EOS(this)
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

  /** 获取客户端当前的网络信息(节点地址,节点Id, 节点端口, 节点类型) */
  updateNetwork() {
    this.network().then(res => {
      // TODO:
      if (res.code === 0) {
        // 新版
        let { blockchain, chainId, host, port, protocol } = res.data
        console.info('new:', { blockchain, chainId, host, port, protocol })
        // 旧版
        let { name, domains, chain_id } = res.data
        console.info('old:::', { name, domains, chain_id })
        // 优先使用新版
      }
    })
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
