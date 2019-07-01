import { MeetWallet } from '../../index'
import BlockChain from '../BlockChain'
import { Blockchains } from '../SupportBlockchain'
import Network from '../../util/Network'
import {
  node_info,
  get_tx_with_hash,
  get_validatorsets,
  get_account,
  get_account_balance,
  push_transaction
} from './rpc'
import { AxiosResponse } from 'axios'

// 事务 - 签名 部分
interface signObject {
  account_number: string
  chain_id: string
  sequence: string
  fee?: {
    amount: Coin[]
    gas: string
  }
  memo?: string
  msgs?: Array<{ type: string; value: object }>
}

interface TransferArgs {
  /** 转账的金额 */
  amount: number
  /** 转账代币符号, default `uatom` */
  amountDenom?: string
  /** 手续费 */
  fee: number
  /** 手续费代币符号, default `uatom` */
  feeDenom?: string
  /** Gas */
  gas: number
  /** Memo */
  memo?: string
  /** transfer to */
  to: string
  /** transfer from[option] */
  from?: string
}

// 代币
interface Coin {
  denom: string
  amount: string
}

interface TxQuery {
  txhash: string
  height: string
  tx: {
    type: string
    value: StdTx
  }
  gas_wanted: string
  gas_used: string
  tags: KVPair[]
}

interface KVPair {
  key: string
  value: string
}

interface StdTx {
  msg: string
  fee: {
    amount: Coin[]
    gas: string
  }
  memo: string
  signature: {
    signature: string
    pub_key: {
      type: string
      value: string
    }
    account_number: string
    sequence: string
  }
}

interface Account {
  address: string
  coins: Coin[]
  public_key: {
    type: string
    value: string
  }
  account_number: string
  sequence: string
}

interface AccountRPC extends Account {
  type: string
  value: Account
}

interface NodeInfo {
  protocol_version: {
    p2p: string
    block: string
    app: string
  }
  id: string
  listen_addr: string
  network: string
  version: string
  channels: string
  moniker: string
  other: {
    tx_index: string
    rpc_address: string
  }
}

interface DelegateMsgs {
  /** (取消)抵押的数量 */
  amount: number | string
  /** (取消)抵押的代币符号, default `uatom` */
  amountDenom?: string
  /** 手续费 */
  fee: number | string
  /** 手续费代币符号, default `uatom` */
  feeDenom: string
  /** Gas */
  gas: number | string
  /** Memo */
  memo?: string
  delegator_address: string
  validator_address: string
}

/** 默认节点地址 */
const DEFAULT_RPC_URL = 'https://stargate.cosmos.network'

export class Cosmos extends BlockChain {
  /** Network request */
  http!: Network
  address: string | undefined
  /** 当前账号 */
  account!: Account
  /** 节点信息 */
  nodeInfo!: NodeInfo

  constructor(wallet: MeetWallet, cosmosAddress?: string) {
    super(Blockchains.COSMOS, wallet)
    this.http = new Network(
      {
        baseURL: wallet.nodeInfo
          ? `${wallet.nodeInfo.protocol}://${wallet.nodeInfo.host}:${wallet.nodeInfo.port}`
          : DEFAULT_RPC_URL
      },
      this.wallet.config.isDebug
    )
    this.address = cosmosAddress ? cosmosAddress : ''
    this.getNodeInfo().then(res => {
      if (res) {
        this.getIdentity().then(res => {
          if (res) {
            if (typeof window !== 'undefined') {
              document.dispatchEvent(new CustomEvent('meetoneLoaded'))
            }
          }
        })
      }
    })
  }

  /**
   * 获取当前账号信息
   * 如果当前实例对象有地址, 则直接去链上查询
   * 如果没有指定地址,发起协议获取客户端当前的地址
   * @param foreUpdate 默认为false, 如果为false,则从当前缓存中获取
   * @returns {Account} 当前账号信息
   */
  getIdentity(foreUpdate?: false): Promise<Account> {
    if (!foreUpdate && this.account) {
      // 如果当前账号信息不为空, 可直接返回
      return new Promise(resolve => resolve(this.account))
    }

    return new Promise(resolve => {
      if (!this.address) {
        // 没有address
        this.wallet.bridge.generate('cosmos/account_info', {}).then(res => {
          if (res.code === 0) {
            this.address = res.data.address
          }
          // 链上查询
          this.getAccountInfo(this.address).then(res => {
            this.account = res.value
            resolve(this.account)
          })
        })
      } else {
        // 链上查询
        this.getAccountInfo(this.address).then(res => {
          this.account = res.value
          resolve(this.account)
        })
      }
    })
  }

  /**
   * The properties of the connected node
   * @return {NodeInfo} the properties of connected code
   * https://cosmos.network/rpc/#/ICS0/get_node_info
   */
  getNodeInfo(): Promise<NodeInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await this.http.get(node_info)
        if (res.status === 200) {
          resolve(res.data)
          this.nodeInfo = res.data
        } else {
          reject({
            code: res.status,
            message: res.statusText
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Get the account information on blockchain
   * @returns {Account} Account info
   * https://cosmos.network/rpc/#/ICS1/get_auth_accounts__address_
   * @param address Account address
   */
  getAccountInfo(address?: string): Promise<AccountRPC> {
    address = address ? address : this.address
    return new Promise(async (resolve, reject) => {
      try {
        let res = await this.http.get(`${get_account}/${address}`)
        if (res.status === 200) {
          resolve(res.data)
        } else {
          reject({
            code: res.status,
            message: res.statusText
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Get the account balance
   * @returns {Coin[]} the account balance list
   * https://cosmos.network/rpc/#/ICS20/get_bank_balances__address_
   * @param address Account address
   */
  getBalance(address: string): Promise<Coin[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await this.http.get(`${get_account_balance}/${address}`)
        if (res.status === 200) {
          resolve(res.data)
        } else {
          reject({
            code: res.status,
            message: res.statusText
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Get a Tx by hash
   * https://cosmos.network/rpc/#/ICS0/get_txs__hash_
   * @param hash Tx hash
   */
  getTransactionByHash(hash: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await this.http.get(`${get_tx_with_hash}/${hash}`)
        if (res.status === 200) {
          resolve(res.data)
        } else {
          reject({
            code: res.status,
            message: res.statusText
          })
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Push a Transaction
   * @param transaction txBroadcast (body)	The tx must be a signed StdTx.
   */
  broadcast(transaction: object): Promise<AxiosResponse> {
    return this.http.post(`${push_transaction}`, { txBroadcast: transaction })
  }

  /**
   *
   * @param signObject
   * @param modeType The supported broadcast modes include "block"(return after tx commit), "sync"(return afer CheckTx) and "async"(return right away).
   * @returns {StdTx}
   */
  async signProvider(signObject: signObject, modeType = 'sync') {
    console.info(signObject)
    let res = await this.wallet.bridge.generate('cosmos/sign_provider', {
      signObject
    })
    // 签名:
    const signedTx = {
      tx: {
        msg: signObject.msgs,
        fee: signObject.fee,
        signatures: [
          {
            // TODO: 客户端返回
            signature: res.data.signature,
            pub_key: this.account.public_key
          }
        ],
        memo: signObject.memo
      },
      mode: modeType
    }

    // broadcast
    return this.broadcast(signedTx)
  }

  /**
   * 转账交易
   * example: https://stargate.cosmos.network/txs/A9FA53852753EC40207858F74CF08B5D91773851A22E86EAFD36F94EECE91BBF
   */
  transfer(input: TransferArgs) {
    let signObject: signObject = {
      account_number: this.account.account_number,
      chain_id: this.nodeInfo.network,
      sequence: this.account.sequence,
      fee: {
        amount: [
          {
            amount: String(input.fee),
            denom: input.feeDenom || 'uatom'
          }
        ],
        gas: String(input.gas)
      },
      memo: input.memo || '',
      msgs: [
        {
          type: 'cosmos-sdk/MsgSend',
          value: [
            {
              amount: [
                {
                  amount: String(input.amount),
                  denom: input.amountDenom || 'uatom'
                }
              ],
              from_address: input.from || this.account.address,
              to_address: input.to
            }
          ]
        }
      ]
    }
    return this.signProvider(signObject)
  }

  /**
   * 抵押
   * example: https://stargate.cosmos.network/txs/0AA58ED1E47915703E06DF46291D664031F889AEBC7A1AA747339A015901B62C
   */
  delegate(input: DelegateMsgs) {
    let signObject: signObject = {
      account_number: this.account.account_number,
      chain_id: this.nodeInfo.network,
      sequence: this.account.sequence,
      fee: {
        amount: [
          {
            amount: String(input.fee),
            denom: input.feeDenom || 'uatom'
          }
        ],
        gas: String(input.gas)
      },
      memo: input.memo,
      msgs: [
        {
          type: 'cosmos-sdk/MsgDelegate',
          value: {
            amount: [
              {
                amount: String(input.amount),
                denom: input.amountDenom || 'uatom'
              }
            ],
            delegator_address: input.delegator_address,
            validator_address: input.validator_address
          }
        }
      ]
    }
    return this.signProvider(signObject)
  }

  /**
   * 取消抵押
   * example: https://stargate.cosmos.network/txs/040099262917BBAA9A9AFDD54D448D51A085C4D86DDEB7CA70754E9BA9507AE4
   */
  undelegate(input: DelegateMsgs) {
    let signObject: signObject = {
      account_number: this.account.account_number,
      chain_id: this.nodeInfo.network,
      sequence: this.account.sequence,
      fee: {
        amount: [
          {
            amount: String(input.fee),
            denom: input.feeDenom || 'uatom'
          }
        ],
        gas: String(input.gas)
      },
      memo: input.memo || '',
      msgs: [
        {
          type: 'cosmos-sdk/MsgUndelegate',
          value: {
            amount: [
              {
                amount: String(input.amount),
                denom: input.amountDenom || 'uatom'
              }
            ],
            delegator_address: input.delegator_address,
            validator_address: input.validator_address
          }
        }
      ]
    }
    return this.signProvider(signObject)
  }

  /** 保证金 */
  deposit(input: {
    amount: number | string
    amountDenom?: string
    fee: number | string
    feeDenom: string
    gas: number | string
    memo?: string
    depositor: string
    proposal_id: string
  }) {
    let signObject: signObject = {
      account_number: this.account.account_number,
      chain_id: this.nodeInfo.network,
      sequence: this.account.sequence,
      fee: {
        amount: [
          {
            amount: String(input.fee),
            denom: input.feeDenom || 'uatom'
          }
        ],
        gas: String(input.gas)
      },
      memo: input.memo || '',
      msgs: [
        {
          type: 'cosmos-sdk/MsgDeposit',
          value: {
            amount: [
              {
                amount: String(input.amount),
                denom: input.amountDenom || 'uatom'
              }
            ],
            depositor: input.depositor,
            proposal_id: String(input.proposal_id)
          }
        }
      ]
    }
    return this.signProvider(signObject)
  }

  /** 投票 */
  vote(input: {
    amount: number | string
    amountDenom?: string
    fee: number | string
    feeDenom: string
    gas: number | string
    memo?: string
    option: object
    proposal_id: string | number
    voter: string
  }) {
    let signObject: signObject = {
      account_number: this.account.account_number,
      chain_id: this.nodeInfo.network,
      sequence: this.account.sequence,
      memo: input.memo || '',
      fee: {
        amount: [
          {
            amount: String(input.fee),
            denom: input.feeDenom || 'uatom'
          }
        ],
        gas: String(input.gas)
      },
      msgs: [
        {
          type: 'cosmos-sdk/MsgVote',
          value: {
            option: input.option,
            proposal_id: String(input.proposal_id),
            voter: input.voter
          }
        }
      ]
    }
    return this.signProvider(signObject)
  }

  // cosmos-sdk/MsgBeginRedelegate
  // cosmos-sdk/MsgSubmitProposal
  // cosmos-sdk/MsgWithdrawDelegationReward

  /**
   * Get the latest validator set
   * https://cosmos.network/rpc/#/ICS0/get_validatorsets_latest
   */
  getValidators(): Promise<AxiosResponse> {
    return this.http.get(`${get_validatorsets}`)
  }
}
