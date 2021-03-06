/*
 * The communication message which between client and webview
 * Generate & Send Wrapper
 * @Author: JohnTrump
 * @Date: 2019-06-21 11:39:51
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-07-02 11:26:09
 */

import { Config, ClientResponse, ErrorMessage } from './Interface'
import { defaultConfig } from './DefaultConfig'

class PostMessage {
  private tryTimes: number = 0

  config: Config

  constructor(config?: Config) {
    this.config = config || defaultConfig
  }

  /** generate message and send to client */
  generate(
    path: string,
    payload: object,
    options?:
      | {
          protocol?: string | undefined
          callbackId?: string | undefined
          callback?: () => any
          external?: boolean
        }
      | undefined
  ): Promise<any> {
    // browser
    if (typeof window !== 'undefined') {
      // 自定义回调id情况
      if (options && options.callbackId) {
        // @ts-ignore
        window[options.callbackId] = options.callback || function() {}
        const message = this.generateMessage(path, payload, Object.assign(options))
        this.config.isDebug && console.debug(`send: ${path}`, message)
        if (options.external) {
          window && window.open(message, '_self')
        } else {
          this.sendMessage(message)
        }
        // @ts-ignore
        return window[options.callbackId]
      }

      // 非自定义回调id情况
      let that = this
      return new Promise((resolve, reject) => {
        const callbackId = (options && options.callbackId) || this.getCallbackId()
        const message = this.generateMessage(path, payload, Object.assign({ callbackId }, options))
        that.config.isDebug && console.debug(`send: ${path}`, message)

        // @ts-ignore
        window[callbackId] = function(result: ClientResponse) {
          that.config.isDebug && console.debug(`window[${callbackId}]:`, result)
          try {
            // 错误处理
            if (result.code === 998 || result.code === 404) {
              // @ts-ignore
              // throw new Error(result.data && result.data.message)
              reject(result)
            }

            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            // 接收到客户端的回调后,将绑定的回调置为null,方便垃圾回收
            // @ts-ignore
            window[callbackId] = null
          }
        }

        if (options && options.external) {
          window && window.open(message, '_self')
          // @ts-ignore
          window[callbackId]({ code: 0, data: { message: 'Call the App from external' } })
        } else {
          this.sendMessage(message)
        }

        // @ts-ignore
        if (window.isSupportMeetoneSdk) {
          // 超时时间设定, 因为不能比较好的兼容旧版本,只能在新版本发包前(>=2.6.0),往已有的JS中注入全局变量 `isSupportMeetoneSdk`来兼容
          // meet-inject set `isSupportMeetoneSdk`
          setTimeout(() => {
            // @ts-ignore
            if (typeof window[callbackId] === 'function') {
              let params: ErrorMessage = {
                code: 998,
                type: 998,
                data: { message: '操作超时' }
              }
              // @ts-ignore
              window[callbackId](params)
            }
          }, this.config.timeout)
        }
      })
    } else {
      // nodejs
      return new Promise((resolve, reject) => {})
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
    options?: { protocol?: string; callbackId?: string }
  ): string {
    let {
      protocol = this.config.protocol || defaultConfig.protocol,
      callbackId = this.getCallbackId()
    } = options || {}

    let message = ''
    let payloadData = this.encode(payload)
    message = protocol
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
          console.error('post url timeout(60 times):', url)
        }
      }
    } else {
      // nodejs
      throw new Error('Method not implemented.')
    }
  }
}

export default PostMessage
