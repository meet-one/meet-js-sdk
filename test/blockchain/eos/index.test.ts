/*
 * EOS Module test
 * @Author: JohnTrump
 * @Date: 2019-06-23 21:25:49
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-24 19:18:51
 */

import { EOS } from '../../../src/blockchain/eos/eos'
import { MeetWallet } from '../../../src'
import { Blockchains } from '../../../src/blockchain/SupportBlockchain'
const CUSTOM_TIMEOUT = 10 * 1000

let meetwallet = new MeetWallet({ timeout: CUSTOM_TIMEOUT, isDebug: false })

describe('EOS Module', () => {
  let eosModule = new EOS(meetwallet)
  test('chain type: eos', () => {
    expect(eosModule.chain === Blockchains.EOS).toBeTruthy()
  })

  test('export eosjs', () => {
    // need e2e test
  })
})
