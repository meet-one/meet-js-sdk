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

  /**
   * 跳转到指定页面中
   * Open a client page
   * @param {string} target 指定的页面名称 The client page name
   * @param external 是否为外部跳转, if true, will return `{ code: 0, data: { message: 'Call the App from external' } }`
   * @param {(object | undefined)} [options] 传递给页面的参数 Options param will pass to client page
   */
  navigate(
    target: string,
    external?: boolean,
    options?: object | undefined
  ): Promise<ClientResponse> {
    return this.bridge.generate('app/navigate', { target, options }, { external })
  }

  /**
   * 获取当前客户端选中的节点网络信息
   * Get current wallet node network information
   */
  getNodeInfo(): Promise<NodeInfoResponse> {
    return this.bridge.generate('eos/network', {})
  }

  /**
   * 分享文本
   * Share text
   * @param content 分享内容 The Content which wanted to share
   */
  shareText(content: string): Promise<ClientResponse> {
    return this.bridge.generate('app/share', {
      shareType: 1,
      description: content
    })
  }

  /**
   * 分享图片
   * Share picture
   * @param url 图片的URL地址 The Picture URL which wanted to share
   */
  shareImage(url: string): Promise<ClientResponse> {
    return this.bridge.generate('app/share', {
      shareType: 2,
      imgUrl: url
    })
  }

  /**
   * 分享连接
   * Share link
   * @param url 分享的连接地址 The link which wanted to share
   * @param title 分享的标题 Link title
   * @param description 分享描述 Share description
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
   * 打开一个网页
   * Open a webview in client
   * @param url 要跳转的目标地址
   * @param external 是否为外部跳转, if true, will return `{ code: 0, data: { message: 'Call the App from external' } }`
   */
  webview(url: string, external?: boolean): Promise<ClientResponse> {
    return this.bridge.generate('app/webview', { url }, { external })
  }

  /**
   * 自定义当前 webview 右上角菜单名称, 及点击事件
   * Define the webview menu(right button) and callback
   * @param rightTitle 自定义菜单名称 The custom menu name
   * @param callback 点击菜单回调函数 The callback function when click the custom menu will triggered
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
