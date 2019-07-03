import { MeetWallet } from '../index'

export default abstract class Blockchian {
  /** chain name */
  chain: string
  wallet: MeetWallet
  constructor(chain = '', wallet: MeetWallet) {
    this.chain = chain
    this.wallet = wallet
  }

  /**
   * 插件初始化 - 生命周期钩子
   *
   * 调用此操作时,可以确保`wallet.nodeInfo` & `wallet.appInfo`都已经加载完成
   *
   * */
  abstract init(): Blockchian
}
