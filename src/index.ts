/*
 * The Meet JS SDK Library for Meet.ONE Client
 * This library is used to assist in generating the protcol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2019-06-19 14:26:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-26 11:52:30
 */

import Common from './app/Common'
import { Config, AppInfo, NodeInfo } from './app/Interface'
import { defaultConfig, version } from './app/DefaultConfig'

import Network from './util/Network'
import Tool from './util/Tool'

import { EOS } from './blockchain/eos/eos'
import { Blockchains } from './blockchain/SupportBlockchain'
import { Cosmos } from './blockchain/cosmos/cosmos'
import Blockchian from './blockchain/BlockChain'

/** The Meet JS SDK Library for MEET.ONE Client */
export class MeetWallet extends Common {
  /** current js-sdk version */
  config: Config = defaultConfig
  appInfo: AppInfo = {
    appVersion: '0.0.0',
    language: '',
    platform: '',
    isMeetOne: false
  }
  nodeInfo!: NodeInfo
  blockchain: Blockchian | undefined

  constructor(initConfig?: Config) {
    super(Object.assign({}, defaultConfig, initConfig, { version: version }))
    this.config = Object.assign({}, defaultConfig, initConfig, { version: version })
    // for browsers
    if (typeof window !== 'undefined') {
      if (document.readyState !== 'loading') {
        this._init()
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          this._init()
        })
      }
    } else {
      // nodejs
    }
  }

  ready(callback: Function) {
    super
      .getAppInfo()
      .then(res => {
        if (res.code === 0) {
          this.appInfo = res.data
        }
        return this.updateNetwork()
      })
      .then(res => {
        if (res) {
          let plugin
          switch (res.blockchain) {
            case Blockchains.EOS:
            case Blockchains.MEETONE:
            case Blockchains.BOS:
              plugin = new EOS(this)
              break
            case Blockchains.COSMOS:
              plugin = new Cosmos(this)
              break
            default:
              break
          }
          document.addEventListener('meetoneLoaded', () => {
            callback(this, this.blockchain)
          })
          this.blockchain = plugin
        }
      })
    return this
  }

  /** 获取客户端当前的网络信息(节点地址,节点Id, 节点端口, 节点类型) */
  updateNetwork(): Promise<NodeInfo> {
    return new Promise(async (resolve, reject) => {
      let res = await this.getNodeInfo()
      if (res.code === 0) {
        const { appVersion = '2.5.0' } = this.appInfo
        // 当前版本号大于或等于 2.5.0
        if (Tool.versionCompare(appVersion, '2.5.0') >= 0) {
          let { blockchain = '', chainId, host, port, protocol } = res.data
          // 2.5.0版本以后
          this.nodeInfo = {
            blockchain: blockchain.toLowerCase(),
            chainId,
            host,
            port,
            protocol
          }
        } else {
          // 2.5.0版本之前, 返回的字段只有这些
          let { name = '', domains, chain_id } = res.data
          this.nodeInfo = {
            blockchain: name.toLowerCase(),
            chainId: chain_id,
            host: domains[0]
          }
        }
        resolve(this.nodeInfo)
      } else {
        reject(null)
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

export { Network as http, Tool as util }
