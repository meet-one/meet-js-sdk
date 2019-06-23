import { MeetWallet } from '../index'

export default class Blockchian {
  /** chain name */
  chain: string
  wallet: MeetWallet
  constructor(chain = '', wallet: MeetWallet) {
    this.chain = chain
    this.wallet = wallet
  }
}
