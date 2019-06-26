import { MeetWallet } from '../../index'
import BlockChain from '../BlockChain'
import { Blockchains } from '../SupportBlockchain'
import { ClientResponse } from '../../app/Interface'

export class Cosmos extends BlockChain {
  constructor(wallet: MeetWallet) {
    super(Blockchains.COSMOS, wallet)
  }

  // TODO:
  /**
   * 获取当前账号信息 - 原信息返回
   */
  identity(): Promise<any> {
    return this.wallet.bridge.generate('cosmos/account_info', {})
  }
}
