import { MeetWallet } from '../../index'
import BlockChain from '../BlockChain'
import { Blockchains } from '../SupportBlockchain'
import { ClientResponse } from '../../app/Interface'

export class Cosmos extends BlockChain {
  constructor(wallet: MeetWallet) {
    super(Blockchains.COSMOS, wallet)
    console.log('cosmos')
  }
}
