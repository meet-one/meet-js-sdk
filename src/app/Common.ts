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
import { SupportBlockchainEnums } from '../blockchain/SupportBlockchain'

export default class Common {
  bridge: PostMessageModule
  http: Network

  constructor(config?: Config) {
    this.bridge = new PostMessageModule(config)
    this.http = new Network()
  }

  /**
   * 跳转到指定页面中
   *
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
   *
   * Get current wallet node network information
   */
  getNodeInfo(): Promise<NodeInfoResponse> {
    return this.bridge.generate('eos/network', {})
  }

  /**
   * 分享文本
   *
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
   *
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
   *
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
   *
   * Open a webview in client
   * @param url 要跳转的目标地址
   * @param external 是否为外部跳转, if true, will return `{ code: 0, data: { message: 'Call the App from external' } }`
   */
  webview(url: string, external?: boolean): Promise<ClientResponse> {
    return this.bridge.generate('app/webview', { url }, { external })
  }

  /**
   * 自定义当前 webview 右上角菜单名称, 及点击事件
   *
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

  /**
   * 关闭当前浏览器页面(页面堆栈的最顶层pop)
   *
   * Close current browser
   */
  close() {
    return this.bridge.generate('web/close', {})
  }
  /**
   * 后退操作
   *
   * Back operation
   */
  back() {
    return this.bridge.generate('web/back', {})
  }

  /**
   * 控制是否为全屏显示
   *
   * Control fullscreen whether or not
   * @param isFullScreen true - fullscreen; false - not fullscreen
   */
  fullScreen(isFullScreen: boolean = false) {
    return this.bridge.generate('app/fullscreen', { isFullScreen })
  }

  /**
   * 控制 Dapps 浏览器是否水平显示
   *
   * Control Dapps browser horizontal or vertical
   * @param {boolean} [isHorizontal=false] true - display horizontal; false - display vertical(default)
   */
  horizontal(isHorizontal: boolean = false) {
    return this.bridge.generate('app/horizontal', { isHorizontal })
  }

  /**
   * 禁止当前页面手势判断操作(当前webview中有效)，客户端默认的手势的判断包括: 左滑前进, 右滑后退操作
   *
   * Disable the left-sliding gesture to forward, right-sliding gesture to back
   * @param isDisableGestures true - disable default gestures; false - enable gestures
   */
  gestures(isDisableGestures: boolean = false) {
    return this.bridge.generate('app/gestures', { isDisableGestures })
  }

  /**
   * 显示切换钱包的弹窗
   *
   * Display the popups about wallet switcher
   */
  /*
   * 应用场景： 用户打开的Dapp为COSMOS链类型，但是当前钱包为EOS链类型的， 这个时候就出问题了， 所以需要阻塞后续逻辑， 提醒用户切换钱包/导入钱包
   * 客户端逻辑:
   *   如果有指定`type`则显示指定的`type`类型的钱包列表
   *      如果指定`type`类型的钱包列表为空, 则跳转到对应`type`的钱包导入页面
   *   如果没有指定`type`类型, 则显示当前所有的类型的钱包列表
   */
  switchWallet(type: SupportBlockchainEnums) {
    let _type = type.trim().toLowerCase()
    return this.bridge.generate('app/switchwallet', { type: _type })
  }
}
