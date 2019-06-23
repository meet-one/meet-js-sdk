/*
 * App Client JS-SDK
 * @Author: JohnTrump
 * @Date: 2019-06-21 11:39:18
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-23 17:02:21
 */
import PostMessageModule from './PostMessageModule'
import { NetworkInfo, Config, ClientResponse } from './Interface'
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
   * Get current wallet network information
   */
  network(): Promise<NetworkInfo> {
    return this.bridge.generate('eos/network', {})
  }

  /**
   *
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
   * TODO: 分享文件
   */
  shareFile(): void {
    throw new Error('Method not implemented.')
  }

  /**
   * TODO: 分享口令
   */
  shareCode(
    appName: string,
    description: string,
    url: string,
    banner_url: string,
    icon_url: string
  ): void {
    throw new Error('Method not implemented.')
    // this.bridge.generate('app/share', {
    //   shareType: 5,
    //   description,
    //   options: {
    //     name: appName,
    //     target: url,
    //     banner: banner_url,
    //     icon: icon_url
    //   }
    // })
  }

  /**
   * Path: `app/webview`
   *
   * Open a webview in client
   *
   * @param url 要跳转的目标地址
   */
  webview(url: string, title?: string | undefined): Promise<ClientResponse> {
    return this.bridge.generate('app/webview', { url, title })
  }

  /**
   * Path: `app/webview/right_menu`:
   *
   * Define the webview menu(right button) and callback
   *
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
}
