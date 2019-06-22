/*
 * The communication message which between client and webview
 * Generate & Send Wrapper
 * @Author: JohnTrump
 * @Date: 2019-06-21 11:39:51
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-22 18:03:16
 */

import { Config } from './Interface'

interface PostMessageInterface {
  // encode the data
  // Parse Javascript Object to params String
  // JSON.stringify() -> encodeURIComponent() -> btoa()
  encode(obj: object): string
  // decode
  decode(str: string): object
  // Generate random callbackid
  getCallbackId(): string
  // PostMessage to client
  sendMessage(url: string): void
  // generate the message
  generateMessage(
    path: string,
    payload: object,
    options?: { protocal?: string; callbackId?: string }
  ): string
  // generate & send
  generate(
    path: string,
    payload: object,
    options?: { protocal?: string; callbackId?: string }
  ): Promise<any>
}

class PostMessage implements PostMessageInterface {
  private tryTimes: number = 0
  /** 协议超时时间, 默认为 `60s` */
  timeout: number
  /** 协议名,默认为`meetone://` */
  private protocal: string

  constructor(config?: Config) {
    this.protocal = (config && config.protocal) || 'meetone://'
    this.timeout = (config && config.timeout) || 60 * 1000
  }

  /** generate message and send to client */
  generate(
    path: string,
    payload: object,
    options?:
      | { protocal?: string | undefined; callbackId?: string | undefined; callback?: () => any }
      | undefined
  ): Promise<any> {
    // browser
    if (typeof window !== 'undefined') {
      // 自定义回调id情况
      if (options && options.callbackId) {
        // @ts-ignore
        window[options.callbackId] = options.callback || function() {}
        const message = this.generateMessage(path, payload, Object.assign(options))
        this.sendMessage(message)
        console.log(message)
        // @ts-ignore
        return window[options.callbackId]
      }

      // 非自定义回调id情况
      return new Promise((resolve, reject) => {
        const callbackId = (options && options.callbackId) || this.getCallbackId()
        const message = this.generateMessage(path, payload, Object.assign({ callbackId }, options))
        this.sendMessage(message)
        console.log(message)
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            // 接收到客户端的回调后,将绑定的回调置为null,方便垃圾回收
            // @ts-ignore
            window[callbackId] = null
          }
        }

        // TODO: 在客户端统一客户端都有回调callbackid前，不执行这个此操作（兼容性）
        // 具体客户端会在哪个版本解决这个问题， 还没有确切的时间表
        // if (clientVersion < '3.0.0') skip
        // 超时时间设定
        setTimeout(() => {
          // @ts-ignore
          if (typeof window[callbackId] === 'function') {
            // @ts-ignore
            window[callbackId]({ code: 998, type: 998, data: { message: '操作超时' } })
          }
        }, this.timeout)
      })
    } else {
      // nodejs
      return new Promise((resolve, reject) => {
        // TODO:
      })
    }
  }

  /**
   *
   * encode the data
   * Parse Javascript Object to params String
   * `JSON.stringify() -> encodeURIComponent() -> btoa()`
   */
  encode(obj: object): string {
    let json = JSON.stringify(obj)
    return btoa(encodeURIComponent(json))
  }

  /**
   *
   * decode the data
   * Parse url params data to string
   * `atob() -> decodeURIComponent() -> JSON.parse()`
   */
  decode(str: string): object {
    const decodeURL = atob(str)
    const jsonStr = decodeURIComponent(decodeURL)
    return JSON.parse(jsonStr)
  }

  /**
   * Generate random string, begin with `meetjs_callback_[random]`
   */
  public getCallbackId(): string {
    const random = parseInt(Math.random() * 10000 + '')
    return 'meetjs_callback_' + new Date().getTime() + random
  }

  /**
   * Generate the message
   */
  generateMessage(
    path: string,
    payload: object,
    options?: { protocal?: string; callbackId?: string }
  ): string {
    let { protocal = this.protocal, callbackId = this.getCallbackId() } = options || {}

    let message = ''
    let payloadData = this.encode(payload)
    message = protocal
      .concat(path)
      .concat('?params=')
      .concat(payloadData)
    // 如果有指定回调
    if (callbackId) {
      message = message.concat('&callbackId=' + callbackId)
    }
    return message
  }

  /**
   * Post message to client
   */
  public sendMessage(url: string): void {
    // browser
    if (typeof window !== 'undefined') {
      try {
        // @ts-ignore
        window.postMessage(url)
        // reset the tryTime to 0
        this.tryTimes = 0
      } catch (error) {
        // per second will attemp to reinvoke, failed over 60 times will never reinvoked again
        if (this.tryTimes < 60) {
          setTimeout(() => {
            this.sendMessage(url)
            this.tryTimes = ++this.tryTimes
          }, 1000)
        } else {
          // TODO: 前端监控机制
          console.error('post url timeout(60 times):', url)
        }
      }
    } else {
      // nodejs
      // TODO:
      throw new Error('Method not implemented.')
    }
  }
}

export default PostMessage
