/*
 * App Client JS-SDK
 * @Author: JohnTrump
 * @Date: 2019-06-21 11:39:18
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-07-03 11:34:23
 */
import PostMessageModule from './PostMessageModule'
import { NodeInfoResponse, Config, ClientResponse } from './Interface'
import Network from '../util/Network'

export default class Common {
  bridge: PostMessageModule
  http: Network

  constructor(config?: Config) {
    this.bridge = new PostMessageModule(config)
    this.http = new Network()
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
   * @param description 分享内容
   */
  shareText(description: string): Promise<ClientResponse> {
    return this.bridge.generate('app/share', {
      shareType: 1,
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
   * @param description 分享描述
   */
  shareLink(url: string, title?: string, description?: string): Promise<ClientResponse> {
    return this.bridge.generate('app/share', {
      shareType: 3,
      title,
      description,
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
