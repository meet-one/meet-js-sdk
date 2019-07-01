/*
 * The Meet JS SDK Library for Meet.ONE Client
 * This library is used to assist in generating the protcol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2019-06-19 14:26:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-07-01 14:00:02
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
  /** 当前应用信息 */
  appInfo: AppInfo | undefined
  /** 当前应用节点信息 */
  nodeInfo!: NodeInfo
  /** 当前链 */
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
        if (res.code === 0) this.appInfo = res.data
        return this.updateNetwork()
      })
      .then(res => {
        if (res) {
          let plugin
          switch (res.blockchain) {
            case Blockchains.EOS:
            case Blockchains.MEETONE:
            case Blockchains.MEETONE_2:
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
        let { name, blockchain, domains, chain_id, chainId, host, port, protocol } = res.data
        this.nodeInfo = {
          blockchain: blockchain ? blockchain.toLowerCase() : name.toLowerCase(), // Chain类型
          chainId: chainId || chain_id, // blockchain chainId
          host: host ? host : domains[0], // hostname
          port: port ? port : 80, // 端口, 默认为80
          protocol: protocol ? protocol : 'http' // 协议, 默认为 http
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

export { Network as http, Tool as util, EOS as Eos, Cosmos }
