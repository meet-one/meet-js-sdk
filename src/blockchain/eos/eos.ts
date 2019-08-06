import { MeetWallet } from '../../index'
import Blockchian from '../BlockChain'
import { Blockchains } from '../SupportBlockchain'
import { ClientResponse } from '../../app/Interface'
import { Buffer } from 'buffer/'

/** Eosjs signProvider params */
interface EosSignProviderArgs {
  buf: ArrayLike<number>
  transaction: Transaction
}

/** Eosjs Transaction */
interface Transaction {
  actions: object
}

/** More detail ref: `https://github.com/EOSIO/eosjs/tree/v16.0.9#configuration` */
interface EosConfig {
  /** Unique ID for the blockchain you're connecting to.  */
  chainId?: string
  /** Provides private keys used to sign transactions. */
  keyProvider?: Array<string> | string
  /** Change the public key prefix. */
  keyPrefix?: 'EOS'
  /** http or https location of a nodeosd server providing a chain API */
  httpEndpoint?: string
  /** number of seconds before the transaction will expire */
  expireInSeconds?: number
  /** post the transaction to the blockchain. */
  broadcast?: boolean
  /** verbose logging such as API activity. */
  verbose?: boolean
  /** low level debug logging (serialization). */
  debug?: boolean
  /**  sign the transaction with a private key. Leaving a transaction unsigned avoids the need to provide a private key. */
  sign?: boolean
}

/** 当前 EOS 账户信息 */
interface Account {
  /** 账户信息 */
  authority: string
  /** 区块链类型 */
  chainType: string
  /** 公钥 */
  publicKey: any
  /** 是否为硬件钱包 */
  isHardware: boolean
  /** 兼容Scatter */
  kyc: boolean
  /** 账户名 */
  name: string
}

interface TransferOptions {
  /** 代币名称, 默认为`EOS` */
  tokenName: string
  /** 合约账号, 默认为 `eosio.token` */
  contract: string
  /** 精度设置, 默认为 4 */
  precision: number
}

interface IdentityResponse extends ClientResponse {
  data: {
    account: string
    currencyBalance: string
    isActive: boolean
    isOwner: boolean
    permission: string
    publicKey: string
  }
}
interface optionsConfig {
  protocol: string
  host: string
  port: number
  chainId: string
}

export class EOS extends Blockchian {
  /** 当前账号 Current account info */
  account!: Account
  optionsConfig: optionsConfig | undefined

  constructor(wallet: MeetWallet, options?: optionsConfig) {
    super(Blockchains.EOS, wallet)
    this.optionsConfig = options
  }

  /** 插件初始化逻辑 */
  init(): this {
    // 如果当前网络非EOS类型的, 则抛出错误
    let type = this.wallet.nodeInfo.blockchain.toLowerCase()
    let supportTypes = [
      Blockchains.EOS,
      Blockchains.MEETONE,
      Blockchains.MEETONE_2,
      Blockchains.BOS
    ]
    if (!supportTypes.includes(type)) {
      // TODO: 询问用户是否切换网络[设想的 -> 切换后实现页面刷新重载]
      throw new Error(`Current Network Type is ${type}, No one of the ${supportTypes}`)
    }

    this.getIdentity().then(resolve => {
      if (resolve) {
        if (typeof window !== 'undefined') document.dispatchEvent(new CustomEvent('meetoneLoaded'))
      } else {
        // 没有登录账号
      }
    })
    return this
  }

  /**
   * SignProvider 为交易提供签名
   *
   * 流程: 前端传入交易元数据, 客户端对其签名, 返回签名数据
   */
  signProvider(buf: ArrayLike<number>, actions: object): any {
    return this.wallet.bridge.generate('eos/sign_provider', {
      buf: Array.from(buf),
      transaction: actions
    })
  }

  /**
   * 为 Eosjs (<16.x)提供签名
   *
   * @param signargs signProvider参数
   *
   * 调用`this.signProvider`, 参数由Eosjs提供(buf: ArrayLike<string>, actions: object)
   */
  eosSignProvider(signargs: EosSignProviderArgs): string {
    return this.signProvider(signargs.buf, signargs.transaction.actions).then(
      (res: { code: number; data: { signature: string } }) => {
        if (res.code === 0) {
          return res.data.signature
        } else {
          throw new Error('eos/sign_provider failed:\n' + JSON.stringify(res))
        }
      }
    )
  }

  /**
   * 为 Eosjs (>=20)提供签名
   * @param signargs signProvider参数
   */
  eosSignProvider2(signargs: any): any {
    return this.signProvider(signargs.buf, signargs.transaction.actions).then(
      (res: { code: number; data: { signature: string } }) => {
        if (res.code === 0) {
          return {
            signatures: [res.data.signature],
            serializedTransaction: Buffer.from(signargs.serializedTransaction, 'hex')
          }
        }
      }
    )
  }

  /**
   * 签名方法
   * @param signData 要签名的内容
   */
  sign(signData: Object): Promise<ClientResponse> {
    if (typeof signData === 'object') {
      signData = JSON.stringify(signData)
    }
    return this.wallet.bridge.generate('eos/signature', {
      data: signData,
      whatfor: 'what for what',
      isHash: false, // WTF: 不知道这两个参数有什么不同
      isArbitrary: false // WTF: 不知道这两个参数有什么不同
    })
  }

  /** 获取当前账号信息 - 原始信息返回 */
  identity(): Promise<IdentityResponse> {
    return this.wallet.bridge.generate('eos/account_info', {})
  }

  /**
   * 获取当前账号信息
   * @param forceUpdate 默认为false, 如果为false,则从当前缓存中获取
   *
   *  */
  getIdentity(forceUpdate?: boolean): Promise<Account> {
    if (!forceUpdate && this.account) {
      // 如果当前账号信息不为空, 可直接返回
      return new Promise(resolve => resolve(this.account))
    }
    return this.identity().then(res => {
      if (res.code === 0) {
        // 原生客户端将权限permission回传给了网页，所以这里可以不单纯的使用isOwner/isActive来设置权限了
        // 这样可以适配更多非onwer/active权限
        let authority = 'active' // 假定权限为active
        let permissions = []
        try {
          let hasActive = false
          permissions = res.data && res.data.permission.split('&&')
          if (permissions.length === 1) {
            authority = permissions[0]
          } else {
            // 判断是否有active权限
            for (let i = 0; i < permissions.length; i++) {
              if (permissions[i] === 'active') {
                hasActive = true
              }
            }
            // 缺少active权限，才会去默认取第一个权限
            if (!hasActive) {
              authority = permissions[0]
            }
          }
        } catch (error) {
          console.log(error)
        }
        let scatterIdentity = {
          authority: authority,
          chainType: this.wallet.nodeInfo.blockchain,
          name: res.data.account,
          publicKey: res.data.publicKey,
          isHardware: false,
          kyc: false
        }

        // 更新当前对象属性
        this.account = scatterIdentity

        return scatterIdentity
      } else {
        throw new Error('getIdentity failed')
      }
    })
  }

  /**
   * 获取Eosjs实例(<=16+)
   * @param Eos 获取EOSJS当前对象
   * @param eosOptions 附加的EosConfig配置[可选]
   */
  getEos(eosOptions?: EosConfig, Eos?: object) {
    // eosOptions 未定义
    if (!!!eosOptions) {
      eosOptions = {}
    }
    if (typeof Eos === 'undefined') {
      // 优先判断是否有传入Eos实例,如果没有的话,在判断全局变量中是否有名为EOS的变量,如果都没有的话,则报错
      // @ts-ignore
      if (typeof window.Eos == 'undefined') {
        throw new Error('Eos.js not found!')
      } else {
        // @ts-ignore
        Eos = window.Eos
      }
    }

    let { chainId, host, port, protocol } = this.optionsConfig
      ? this.optionsConfig
      : this.wallet.nodeInfo
    // @ts-ignore
    return Eos(
      Object.assign(
        {
          httpEndpoint: `${protocol}://${host}:${port}`,
          chainId: chainId,
          // 需要绑定上下文确保`this.eosSignProvider`指向本对象而非Eosjs
          signProvider: this.eosSignProvider.bind(this)
        },
        eosOptions
      )
    )
  }

  /**
   * 获取Eosjs实例(>=20+)
   * @param {object} [Api] https://eosio.github.io/eosjs/reference/modules/api.html
   * @param {object} [JsonRpc] https://eosio.github.io/eosjs/reference/modules/json_rpc.html
   */
  getEos2(Api?: object, JsonRpc?: object) {
    if (typeof Api === 'undefined') {
      // @ts-ignore
      if (typeof window.eosjs_api == 'undefined') {
        throw new Error('eosjs_api not found!')
      } else {
        // @ts-ignore
        Api = window.eosjs_api.Api
      }
    }

    if (typeof JsonRpc === 'undefined') {
      // @ts-ignore
      if (typeof window.eosjs_jsonrpc == 'undefined') {
        throw new Error('eosjs_jsonrpc not found!')
      } else {
        // @ts-ignore
        JsonRpc = window.eosjs_jsonrpc.JsonRpc
      }
    }

    let { host, port, protocol } = this.optionsConfig ? this.optionsConfig : this.wallet.nodeInfo
    // @ts-ignore
    const rpc = new JsonRpc(`${protocol}://${host}:${port}`, {})
    // @ts-ignore
    const api = new Api({ rpc })
    let _this = this
    let signatureProvider = {
      requiredFields: {},
      getAvailableKeys: function() {
        if (_this.identity) {
          return [_this.account.publicKey]
        }
        return []
      },
      sign: function(signargs: any) {
        let buffer = Buffer.from(signargs.serializedTransaction, 'hex')
        signargs.serializedTransaction = Buffer.from(signargs.serializedTransaction).toString('hex')
        signargs.transaction = api.deserializeTransaction(buffer)
        signargs.beta3 = true
        signargs.buf = Buffer.concat([
          new Buffer(signargs.chainId, 'hex'), // Chain ID
          buffer, // Transaction
          new Buffer(new Uint8Array(32)) // Context free actions
        ])
        return _this.eosSignProvider2(signargs)
      }
    }

    // @ts-ignore
    const eos = new Api({ rpc, signatureProvider })
    return eos
  }

  /**
   * 发起转账
   * @param {string} to 转账给`to`目标账号
   * @param {number} amount 转账数量
   * @param memo 转账Memo 默认为空
   * @param orderInfo 订单信息 默认为空
   * @param {TransferOptions} options
   */
  transfer(
    to: string,
    amount: number,
    memo = '',
    orderInfo = '',
    options?: TransferOptions
  ): Promise<ClientResponse> {
    let { tokenName = 'EOS', contract = 'eosio.token', precision = 4 } = options || {}
    return this.wallet.bridge.generate('eos/transfer', {
      to,
      amount,
      memo,
      orderInfo,
      tokenName,
      tokenContract: contract,
      tokenPrecision: precision
    })
  }

  /**
   * 发起事务
   *
   * 参考 https://github.com/EOSIO/eosjs#sending-a-transaction
   *
   * @param actions 事务
   * @param description 事务描述
   * @param options [可选] 配置选项
   * */
  transaction(
    actions = [],
    description = '',
    options = { broadcast: true }
  ): Promise<ClientResponse> {
    return this.wallet.bridge.generate('eos/transaction', {
      actions,
      description,
      options
    })
  }
}
