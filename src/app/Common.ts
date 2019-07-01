/*
 * App Client JS-SDK
 * @Author: JohnTrump
 * @Date: 2019-06-21 11:39:18
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-26 10:26:58
 */
import PostMessageModule from './PostMessageModule'
import { NodeInfoResponse, Config, ClientResponse, AppInfoResponse } from './Interface'
import Network from '../util/Network'
import Tool from '../util/Tool'

export default class Common {
  bridge: PostMessageModule
  http: Network

  constructor(config?: Config) {
    this.bridge = new PostMessageModule(config)
    this.http = new Network()
  }

  /**
   * 获取当前APP客户端信息
   */
  getAppInfo(): Promise<AppInfoResponse> {
    // 我们的客户端都会在URL上注入相关的版本信息,所以可以不通过协议来实现获取当前APP客户端信息
    // @ts-ignore
    return Promise.race([
      this.bridge.generate('app/info', {}),
      // 这是为了兼容旧版本, 旧版本没有这个协议,所以需要模拟
      new Promise((resolve, reject) => {
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
            // TODO: 设置更长的时间
          }, 1 * 1000)
        } else {
          reject()
        }
      })
    ])
  }

  navigate(target: string, options?: object | undefined): Promise<ClientResponse> {
    return this.bridge.generate('app/navigate', { target, options })
  }

  /**
   * Get current wallet node network information
   */
  getNodeInfo(): Promise<NodeInfoResponse> {
    return this.bridge.generate('eos/network', {})
  }

  /**
   * 分享文本
   * @param title 分享标题
   * @param description 分享内容
   */
  shareText(title: string, description: string): Promise<ClientResponse> {
    return this.bridge.generate('app/share', {
      shareType: 1,
      title,
      description
    })
  }

  /**
   * 分享图片
   * @param url 图片的URL地址
   */
  shareImage(url: string): Promise<ClientResponse> {
    return this.bridge.generate('app/share', {
      shareType: 2,
      imgUrl: url
    })
  }

  /**
   * 分享连接
   * @param url 分享的连接地址
   * @param title 分享的标题
   */
  shareLink(url: string, title?: string): Promise<ClientResponse> {
    return this.bridge.generate('app/share', {
      shareType: 3,
      title,
      link: url
    })
  }

  /**
   * Open a webview in client
   * @param url 要跳转的目标地址
   */
  webview(url: string, title?: string | undefined): Promise<ClientResponse> {
    return this.bridge.generate('app/webview', { url, title })
  }

  /**
   * Define the webview menu(right button) and callback
   * @param rightTitle 自定义菜单名称
   * @param callback 点击菜单回调函数
   */
  webviewMenu(rightTitle: string, callback: () => any): void {
    this.bridge.generate(
      'app/webview/right_menu',
      { right: rightTitle },
      { callback, callbackId: 'meet_callback_webview_right_menu' }
    )
  }

  // 一些协议设想
  // close() 关闭当前页面(页面堆栈的最顶层pop)
  // back() 后退操作
  // fullScreen() 全屏显示页面
  // rollHorizontal(horizontal: boolean = false) 旋转显示
  // popGestureRecognizerEnable(enable: boolean = true) 禁止iOS自带的左滑手势返回，据说Android无效?是因为Andorid实现上有困难吗
  // forwardNavigationGesturesEnable(enable: boolean = true) 禁止webview自带的左滑手势触发goback,据说Android无效?是因为Andorid实现上有困难吗
}
