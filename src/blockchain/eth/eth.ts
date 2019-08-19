import Blockchian from '../BlockChain'
import { MeetWallet } from '../../index'
import { SupportBlockchainsEnum } from '../SupportBlockchain'

export class Eth extends Blockchian {
  constructor(wallet: MeetWallet) {
    super(SupportBlockchainsEnum.ETH, wallet)
  }
  init(): this {
    throw new Error('Method not implemented.')
  }
  /**
   * For eth_sign, we need to sign arbitrary data:
   *
   * ref: https://metamask.github.io/metamask-docs/API_Reference/Signing_Data/Eth_Sign
   */
  signMessage() {
    throw new Error('Method not implemented.')
  }
  /**
   * For personal_sign, we need to prefix the message:
   *
   * ref: https://metamask.github.io/metamask-docs/API_Reference/Signing_Data/Personal_Sign
   */
  signPersonalMessage() {
    throw new Error('Method not implemented.')
  }

  /**
   * No implement yet(sign Typed Data)
   *
   * Just mark
   */
  signTypedData1() {
    throw new Error('Method not implemented.')
  }
  signTypedData3() {
    throw new Error('Method not implemented.')
  }
  signTypedData4() {
    throw new Error('Method not implemented.')
  }

  /**
   * Need Mock function
   *
   * 1. ethereum.enable()
   * 2. ethereum.send(options)
   * 3. ethereum.sendAsync(options, callback)
   *  -
   * 4. ethereum.autoRefreshOnNetworkChange
   * 5. ethereum.on(eventName, callback)
   *
   * Need Mock Properties
   *
   * 1. ethereum.networkVersion
   * 2. ethereum.selectedAddress
   * 3. ethereum.isMetaMask
   *
   */
}
