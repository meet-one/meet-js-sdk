import { MeetWallet } from '../../index'
import BlockChain from '../BlockChain'
import { SupportBlockchainsEnum } from '../SupportBlockchain'
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

// 代币
interface Coin {
  denom: string
  amount: string
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

interface CommonTransactionArgs {
  /** 手续费 */
  fee: number
  /** 手续费代币符号, default `this.SYSToken` */
  feeDenom?: string
  /** Gas */
  gas: number
  /** Memo */
  memo?: string
}

interface TransferArgs extends CommonTransactionArgs {
  /** 转账的金额 */
  amount: number
  /** 转账代币符号, default `this.SYSToken` */
  amountDenom?: string
  /** transfer to */
  to: string
  /** transfer from[option] */
  from?: string
}

interface DelegateMsgs extends CommonTransactionArgs {
  /** (取消)抵押的数量 */
  amount: number | string
  /** (取消)抵押的代币符号, default `this.SYSToken` */
  amountDenom?: string
  delegator_address: string
  validator_address: string
}

interface SubmitProposalArgs extends CommonTransactionArgs {
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 初始抵押的代币数量 */
  initialDepositAmount: number | string
  /** 初始抵押的代币符号, default `this.SYSToken` */
  initialDepositDenom?: string
  /** 提案类型, 默认为 `Text` */
  proposal_type?: string
  /** 提案人的公钥地址 */
  proposer: string // TODO: 默认可以为当前账号地址
}

/** 默认节点地址 */
const DEFAULT_RPC_URL = 'https://stargate.cosmos.network'

/**
 * 抵押转移的参数
 */
interface RedelegateArgs extends CommonTransactionArgs {
  /** (重新)抵押的数量 */
  amount: number | string
  /** (重新)抵押的代币符号, default `this.SYSToken` */
  amountDenom?: string
  /** 抵押者 */
  delegator: string
  /** 打算抵押的 validator cosmos address */
  to_validator: string
  /** 原先抵押的 validator cosmos address */
  from_validator: string
}

interface DepositArgs extends CommonTransactionArgs {
  /** deposit amount */
  amount: string | number
  /** Token symbol, default `this.SYSToken` */
  amountDenom?: string
  depositor: string
  proposal_id: string
}

export class Cosmos extends BlockChain {
  /** Network request */
  http!: Network
  address: string | undefined
  /** 当前账号 */
  account!: Account
  /** 节点信息 */
  nodeInfo!: NodeInfo
  /** Cosmos RPC Node, If it is undefined, will use the current node which client using*/
  httpEndpoint: string | undefined
  /** 默认的代币符号, 默认为 `this.SYSToken` */
  SYSToken: string
  /** 序列(签名需要, 链上获取不及时, 需要在本地做缓存, 做更新) */
  sequence!: string

  /**
   *Creates an instance of Cosmos.
   * @param {MeetWallet} wallet
   * @param {{
   *       httpEndPoint?: string
   *       protocol?: string
   *       host?: string
   *       port?: number
   *       address?: string
   *       SYSToken?: string
   *     }} [options]
   */
  constructor(
    wallet: MeetWallet,
    options?: {
      httpEndPoint?: string
      protocol?: string
      host?: string
      port?: number
      address?: string
      SYSToken?: string
    }
  ) {
    super(SupportBlockchainsEnum.COSMOS, wallet)
    if (options) {
      this.httpEndpoint = options.httpEndPoint
        ? options.httpEndPoint
        : `${options.protocol}://${options.host}:${options.port}`
    }
    this.address = options && options.address ? options.address : undefined
    this.SYSToken = options && options.SYSToken ? options.SYSToken : 'uatom'
  }

  /** 插件初始化逻辑 */
  init(): this {
    // 如果当前网络非Cosmos类型的, 则抛出错误
    let type = this.wallet.nodeInfo.blockchain.toLowerCase() as SupportBlockchainsEnum
    let supportTypes = [SupportBlockchainsEnum.COSMOS]
    if (!supportTypes.includes(type)) {
      // 询问用户是否切换网络[设想的 -> 切换后实现页面刷新重载]
      throw new Error(`Current Network Type is ${type}, No one of the ${supportTypes}`)
    }
    let wallet = this.wallet
    this.http = new Network(
      {
        baseURL: this.httpEndpoint
          ? this.httpEndpoint
          : wallet.nodeInfo
          ? `${wallet.nodeInfo.protocol}://${wallet.nodeInfo.host}:${wallet.nodeInfo.port}`
          : DEFAULT_RPC_URL
      },
      this.wallet.config.isDebug
    )
    this.getNodeInfo().then(res => {
      if (res) {
        this.getIdentity().then(res => {
          if (res) {
            if (typeof window !== 'undefined') {
              // 初始化完成
              document.dispatchEvent(new CustomEvent('meetoneLoaded'))
            }
          }
        })
      }
    })
    return this
  }

  /**
   * 获取当前账号信息
   * 如果当前实例对象有地址, 则直接去链上查询
   * 如果没有指定地址,发起协议获取客户端当前的地址
   * @param forceUpdate 默认为false, 如果为false,则从当前缓存中获取
   * @returns {Account} 当前账号信息
   */
  getIdentity(forceUpdate?: boolean): Promise<Account> {
    if (!forceUpdate && this.account) {
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
          // 如果 `this.sequence 没有设置 或者小于链上返回的数值, 则更新(否则本地自加做缓存)`
          if (!!!this.sequence || Number(this.sequence) < Number(this.account.sequence)) {
            this.sequence = this.account.sequence
          }
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
  broadcast(transaction: { tx: object; mode: string }): Promise<AxiosResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        let res = await this.http.post(`${push_transaction}`, {
          tx: transaction.tx,
          mode: transaction.mode
        })
        if (res.status === 200) {
          if (res.data.txhash && typeof res.data.code === 'undefined') {
            this.sequence = (Number(this.sequence) + 1).toString()
          }
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
   * 生成StdMsg通用方法
   */
  async generateMsg(
    fee: { amount: number | string; denom?: string; gas: number | string },
    msgs: Array<{ type: string; value: object }>,
    memo?: string
  ): Promise<signObject> {
    // `this.account.account_number` 与 `this.account.sequence` 需要同步链上,否则签名不成功
    await this.getIdentity(true)
    return {
      account_number: this.account.account_number,
      chain_id: this.nodeInfo.network,
      sequence: this.sequence,
      memo: memo || '',
      fee: {
        amount: [
          {
            amount: String(fee.amount),
            denom: fee.denom || this.SYSToken
          }
        ],
        gas: String(fee.gas)
      },
      msgs
    }
  }

  /**
   * 签名[Transaction], 并且上链
   * @param signObject
   * @param modeType The supported broadcast modes include "block"(return after tx commit), "sync"(return afer CheckTx) and "async"(return right away).
   * @returns {StdTx}
   */
  async signProvider(signObject: signObject, modeType = 'sync') {
    console.info('signProvider:', signObject)
    let signedTx = await this.requestSignature(signObject, modeType)
    // broadcast
    return this.broadcast(signedTx)
  }

  /**
   * 不上链, 只做签名[Transaction]
   * @param signObject
   * @param modeType The supported broadcast modes include "block"(return after tx commit), "sync"(return afer CheckTx) and "async"(return right away).
   */
  async requestSignature(signObject: signObject, modeType = 'sync') {
    let res = await this.wallet.bridge.generate('cosmos/sign_provider', {
      signObject
    })
    if (res.code !== 0) {
      throw new Error('cosmos/sign_provider failed:\n' + JSON.stringify(res))
    }
    // 签名:
    const signedTx = {
      tx: {
        msg: signObject.msgs,
        fee: signObject.fee,
        signatures: [
          {
            signature: res.data.signature,
            pub_key: this.account.public_key
          }
        ],
        memo: signObject.memo
      },
      mode: modeType
    }
    return signedTx
  }

  /**
   * 签名方法
   * @param signData 要签名的内容
   */
  async requestArbitrarySignature(signData: any) {
    let payload = null
    if (typeof signData === 'object') {
      payload = JSON.stringify(signData)
    } else {
      payload = signData
    }

    let res = await this.wallet.bridge.generate('cosmos/sign_arbitrary', {
      signData: payload
    })

    if (res.code !== 0) {
      throw new Error('cosmos/sign_arbitrary failed:\n' + JSON.stringify(res))
    }

    return res
  }

  /**
   * 转账交易
   * example: https://stargate.cosmos.network/txs/A9FA53852753EC40207858F74CF08B5D91773851A22E86EAFD36F94EECE91BBF
   */
  async transfer(input: TransferArgs) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgSend',
          value: {
            amount: [
              {
                amount: String(input.amount),
                denom: input.amountDenom || this.SYSToken
              }
            ],
            from_address: input.from || this.account.address,
            to_address: input.to
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  /**
   * 抵押
   * example: https://stargate.cosmos.network/txs/0AA58ED1E47915703E06DF46291D664031F889AEBC7A1AA747339A015901B62C
   */
  async delegate(input: DelegateMsgs) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgDelegate',
          value: {
            amount: {
              amount: String(input.amount),
              denom: input.amountDenom || this.SYSToken
            },
            delegator_address: input.delegator_address,
            validator_address: input.validator_address
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  /**
   * 取消抵押
   * example: https://stargate.cosmos.network/txs/040099262917BBAA9A9AFDD54D448D51A085C4D86DDEB7CA70754E9BA9507AE4
   */
  async undelegate(input: DelegateMsgs) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgUndelegate',
          value: {
            amount: {
              amount: String(input.amount),
              denom: input.amountDenom || this.SYSToken
            },
            delegator_address: input.delegator_address,
            validator_address: input.validator_address
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  /**
   * 为提案增加保证金
   * deposit for deposit period proposal
   * Cosmos governance explain: https://blog.chorus.one/an-overview-of-cosmos-hub-governance/
   *  */
  async deposit(input: DepositArgs) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgDeposit',
          value: {
            amount: [
              {
                amount: String(input.amount),
                denom: input.amountDenom || this.SYSToken
              }
            ],
            depositor: input.depositor,
            proposal_id: String(input.proposal_id)
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  /** 投票 */
  async vote(input: {
    fee: number | string
    feeDenom: string
    gas: number | string
    memo?: string
    /** options: ["Yes", "No", "No with Veto", "Abstain"] */
    option: string
    proposal_id: string | number
    voter: string
  }) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgVote',
          value: {
            option: input.option,
            proposal_id: String(input.proposal_id),
            voter: input.voter
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  /**
   * 抵押转移
   * eg:
   * https://www.mintscan.io/txs/C7BC679E8F19500D8A47E4FE33B065CD3C73D7D9F730A288B505D21D43308A4F
   * cosmos-sdk/MsgBeginRedelegate
   * @param {RedelegateArgs} input
   */
  async redelegate(input: RedelegateArgs) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgBeginRedelegate',
          value: {
            amount: {
              amount: String(input.amount),
              denom: input.amountDenom || this.SYSToken
            },
            delegator_address: input.delegator,
            validator_dst_address: input.to_validator,
            validator_src_address: input.from_validator
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  /**
   * 提取抵押奖励
   * eg:https://www.mintscan.io/txs/8fb4c666c63e946e22fd0dde7d2101837254891bb2ddccc3bd0f37e82288ad3d
   * */
  async getReward(input: DelegateMsgs) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgWithdrawDelegationReward',
          value: {
            delegator_address: input.delegator_address,
            validator_address: input.validator_address
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  // cosmos-sdk/MsgSubmitProposal
  async submitProposal(input: SubmitProposalArgs) {
    let signObject = await this.generateMsg(
      { amount: input.fee, denom: input.feeDenom, gas: input.gas },
      [
        {
          type: 'cosmos-sdk/MsgSubmitProposal',
          value: {
            description: input.description,
            initial_deposit: [
              {
                amount: String(input.initialDepositAmount),
                denom: input.initialDepositDenom || this.SYSToken
              }
            ],
            proposal_type: input.proposal_type || 'Text',
            proposer: input.proposer,
            title: input.title
          }
        }
      ],
      input.memo
    )
    return this.signProvider(signObject)
  }

  /**
   * Get the latest validator set
   * https://cosmos.network/rpc/#/ICS0/get_validatorsets_latest
   */
  getValidators(): Promise<AxiosResponse> {
    return this.http.get(`${get_validatorsets}`)
  }
}
