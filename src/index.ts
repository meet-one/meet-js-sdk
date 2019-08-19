/*
 * The Meet JS SDK Library for Meet.ONE Client
 * This library is used to assist in generating the protcol URI of the client, and encapsulates some common protocols and methods.
 * @Author: JohnTrump
 * @Date: 2019-06-19 14:26:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-08-16 10:31:11
 */

import Common from './app/Common'
import { Config, AppInfo, NodeInfo, AppInfoResponse } from './app/Interface'
import { defaultConfig, version } from './app/DefaultConfig'

import Network from './util/Network'
import Tool from './util/Tool'

import { EOS } from './blockchain/eos/eos'
import { Cosmos } from './blockchain/cosmos/cosmos'
import Blockchian from './blockchain/BlockChain'

/** The Meet JS SDK Library for MEET.ONE Client */
export class MeetWallet extends Common {
  /** current js-sdk version */
  config: Config = defaultConfig
  /** 当前应用信息 */
  appInfo!: AppInfo
  /** 当前应用节点信息 */
  nodeInfo!: NodeInfo
  /** 当前链 */
  plugin: Blockchian | undefined
  /** 是否为MEETONE外部打开 */
  isExternal: boolean | undefined
  tryTimes: number
  detectIsExternalInterval: NodeJS.Timeout | undefined

  constructor(initConfig?: Config) {
    super(Object.assign({}, defaultConfig, initConfig, { version: version }))
    this.config = Object.assign({}, defaultConfig, initConfig, { version: version })
    this.tryTimes = 0
    // for browsers
    if (typeof window !== 'undefined') {
      // Notice: `window.scatter` inject will take some delay, So we need to setInterval to check `window.scatter`
      this.detectIsExternalInterval = setInterval(() => {
        // @ts-ignore
        this.isExternal = window.scatter && window.scatter.wallet === 'MEETONE' ? false : true
        this.tryTimes++
        if (this.detectIsExternalInterval && this.tryTimes >= 10) {
          clearInterval(this.detectIsExternalInterval)
          this.detectIsExternalInterval = undefined
        }
      }, 100)
      // if the event `scatterLoaded` already(make sure `window.scatter` is exists)
      // then get `window.scatter.wallet` to detect is in MEETONE wallet or not
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

  /**
   * 判断当前环境是否在MEETONE客户端内
   * 判断当前环境是否支持meet-js-sdk
   */
  isInApp(callback: (isInApp: boolean, isSupportTimeout: boolean) => this) {
    // @ts-ignore
    this.isExternal = window.scatter && window.scatter.wallet === 'MEETONE' ? false : true
    setTimeout(() => {
      // @ts-ignore
      callback(!this.isExternal, !!window.isSupportMeetoneSdk)
    }, 100)
    return this
  }

  /**
   * 获取当前APP客户端信息
   * @param forceUpdate 默认为true, 如果为false,则从当前缓存中获取
   */
  getAppInfo(forceUpdate?: boolean): Promise<AppInfoResponse> {
    if (forceUpdate === undefined) forceUpdate = true
    if (!forceUpdate && this.appInfo) {
      // 如果当前账号信息不为空, 可直接返回
      return new Promise(resolve => resolve({ code: 0, type: 0, data: this.appInfo }))
    }
    // 我们的客户端都会在URL上注入相关的版本信息,所以可以不通过协议来实现获取当前APP客户端信息
    // @ts-ignore
    return Promise.race([
      this.bridge.generate('app/info', {}),
      // 这是为了兼容旧版本, 旧版本没有这个协议,所以需要模拟
      new Promise(async (resolve, reject) => {
        if (typeof window !== 'undefined') {
          let response: AppInfoResponse = {
            code: 0,
            type: 0,
            data: {
              // 客户端在一级页面跳转二级页面后, 不会将现有的url参数(包含当前客户端的信息)带过去, 因此最好不采用这种形式获取
              // 只有在低版本(<2.6.0)没有支持`app/info`的协议下,才会尝试从URL中读取
              appVersion: Tool.getQueryString('meetone_version'),
              language: Tool.getQueryString('lang'),
              platform: Tool.getQueryString('system_name'),
              isMeetOne: Tool.getQueryString('meetone') === 'true',
              isFromUrl: true
            }
          }
          setTimeout(() => {
            resolve(response)
          }, 0.5 * 1000)
        } else {
          reject()
        }
      })
    ])
  }

  /**
   * Load Plugin
   * @param {T} plugin - Blockchain support plugin
   * @returns {Promise<{ wallet: MeetWallet; plugin: T }>}
   */
  load<T extends Blockchian>(plugin: T): Promise<{ wallet: MeetWallet; plugin: T }> {
    return new Promise(resolve => {
      document.addEventListener('meetoneLoaded', () => {
        this.plugin = plugin
        resolve({ plugin, wallet: this })
      })

      this.getChainInfo()
        .then(() => {
          plugin.init()
        })
        .catch(error => {
          alert(error)
        })
    })
  }

  /**
   * 获取客户端当前的网络信息(节点地址,节点Id, 节点端口, 节点类型)
   * @param forceUpdate 默认为false, 如果为false,则从当前缓存中获取
   * */
  getChainInfo(forceUpdate?: boolean): Promise<NodeInfo> {
    if (!forceUpdate && this.nodeInfo) {
      // 如果当前账号信息不为空, 可直接返回
      return new Promise(resolve => resolve(this.nodeInfo))
    }

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
    // 获取客户端信息
    this.getAppInfo().then(res => {
      if (res.code === 0) this.appInfo = res.data
    })

    /** 获取当前节点信息 */
    this.getChainInfo()

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
