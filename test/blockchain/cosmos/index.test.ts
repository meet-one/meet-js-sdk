import { Cosmos } from '../../../src/blockchain/cosmos/cosmos'
import { MeetWallet } from '../../../src'
import { Blockchains } from '../../../src/blockchain/SupportBlockchain'

const CUSTOM_TIMEOUT = 10 * 1000

let meetwallet = new MeetWallet({ timeout: CUSTOM_TIMEOUT, isDebug: false })

/** mock */
meetwallet.nodeInfo = {
  blockchain: 'Cosmos',
  chainId: 'Cosmos-Chain-Nile',
  host: 'stargate.cosmos.network',
  port: 443,
  protocol: 'https'
}

// 测试用的地址
let test_address = 'cosmos1jwgdw55ssd3zdwfgm20sh6pc5kmwzfqdg84m4g'
// 测试节点
let test_node = 'https://lcd-do-not-abuse.cosmostation.io'

describe('COSMOS Module', () => {
  let cosmos = new Cosmos(meetwallet, {
    address: test_address,
    protocol: 'https',
    host: 'stargate.cosmos.network',
    port: 443
  }).init()

  test('chain type: cosmos', () => {
    expect(cosmos.chain === Blockchains.COSMOS).toBeTruthy()
  })

  test('cosmos get node info', async () => {
    let res = await cosmos.getNodeInfo()
    expect(res.network).toEqual('cosmoshub-2')
  })

  test('cosmos get account info', async () => {
    let res = await cosmos.getAccountInfo(test_address)
    expect(res.value.address).toEqual(test_address)
  })

  test('cosmos get account balance', async () => {
    let res = await cosmos.getBalance(test_address)
    expect(res.length > 0).toBeTruthy()
    expect(res[0].denom).toEqual('uatom')
  })

  test('cosmos get transaction by hash', async () => {
    let txid = '9ED9CDA693429AFDA7A11F8B00DD52FC112D1ED969EE015F0C292A1846728D9E'
    let res = await cosmos.getTransactionByHash(txid)
    expect(res.txhash).toEqual(txid)
  })
})
