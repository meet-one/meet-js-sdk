/*
 * EOS Module test
 * @Author: JohnTrump
 * @Date: 2019-06-23 21:25:49
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-08-19 16:28:01
 */

import { EOS } from '../../../src/blockchain'
import { MeetWallet } from '../../../src'
import { SupportBlockchainEnums } from '../../../src/blockchain/SupportBlockchain'
const CUSTOM_TIMEOUT = 10 * 1000

let meetwallet = new MeetWallet({ timeout: CUSTOM_TIMEOUT, isDebug: false })

describe('EOS Module', () => {
  let eosModule = new EOS(meetwallet)
  test('chain type: eos', () => {
    expect(eosModule.chain === SupportBlockchainEnums.EOS).toBeTruthy()
  })

  test('export eosjs', () => {
    // need e2e test
  })
})
