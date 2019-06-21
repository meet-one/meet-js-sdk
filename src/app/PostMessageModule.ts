/*
 * The communication message which between client and webview
 * Generate & Send Wrapper
 * @Author: JohnTrump
 * @Date: 2019-06-21 11:39:51
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-21 17:31:30
 */
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
  protocal: string

  constructor(protocal?: string) {
    this.protocal = protocal || 'meetone://'
  }

  /** generate message and send to client */
  generate(
    path: string,
    payload: object,
    options?:
      | { protocal?: string | undefined; callbackId?: string | undefined; callback?: () => any }
      | undefined
  ): Promise<any> {
    if (typeof window !== 'undefined') {
      if (options && options.callbackId) {
        // @ts-ignore
        window[options.callbackId] = options.callback || function() {}
        const message = this.generateMessage(path, payload, Object.assign(options))
        console.log(message)
        this.sendMessage(message)
        // @ts-ignore
        return window[options.callbackId]
      }

      // browser
      return new Promise((resolve, reject) => {
        const callbackId = (options && options.callbackId) || this.getCallbackId()
        const message = this.generateMessage(path, payload, Object.assign({ callbackId }, options))
        console.log(message)
        this.sendMessage(message)
        // @ts-ignore
        window[callbackId] = function(result) {
          try {
            resolve(result)
          } catch (error) {
            reject(error)
          } finally {
            if (options && options.callbackId) {
              // 接收到客户端的回调后,将绑定的回调置为null,方便垃圾回收
              // @ts-ignore
              window[callbackId] = null
            } else {
              // 自定义callbackid 不执行上面操作
            }
          }
        }
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
