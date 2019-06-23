import { MeetWallet } from '../../index'
import Blockchian from '../BlockChain'
import { Blockchains } from '../SupportBlockchain'
import { ClientResponse } from '../../app/Interface'

interface EosSignProviderArgs {
  buf: ArrayLike<string>
  transaction: Transaction
}

interface Transaction {
  actions: object
}

export class EOS extends Blockchian {
  constructor(wallet: MeetWallet) {
    super(Blockchains.EOS, wallet)
  }

  /**
   * SignProvider 为交易提供签名
   *
   * 流程: 前端传入交易元数据, 客户端对其签名, 返回签名数据
   */
  signProvider(buf: ArrayLike<string>, actions: object): any {
    return this.wallet.bridge.generate('eos/sign_provider', {
      buf,
      transaction: actions
    })
  }

  /**
   * 给 EOSJS 签名
   */
  eosSignProvider(signargs: EosSignProviderArgs): any {
    return this.signProvider(signargs.buf, signargs.transaction.actions).then(
      (res: { code: number; data: { signature: string } }) => {
        if (res.code === 0) {
          return res.data.signature
        }
      }
    )
  }

  getEos(eosOptions = {}) {
    // TODO: 优先判断是否有传入Eos实例,如果没有的话,在
    // TODO: 优先判断全局变量中是否有名为EOS的变量,如果都没有的话,则报错
    // if(typeof Eos == 'undefined'){
    //   throw new Error('Eos.js not found!');
    // }
    // if(typeof this.node == 'undefined'){
    //   throw new Error('EOS chain need to initialize.');
    // }
    // @ts-ignore
    return Eos(
      Object.assign(eosOptions, {
        httpEndpoint: 'https://mainnet.meet.one',
        chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
        signProvider: this.eosSignProvider.bind(this)
      })
    )
  }

  transfer(): Promise<ClientResponse> {
    return this.wallet.bridge.generate('eos/transfer', {
      to: 'g.f.w',
      amount: '0.0001 EOS',
      tokenname: 'EOS',
      tokencontract: 'eosio.tokens',
      tokenprecision: 4,
      memo: '测试memo',
      orderinfo: '测试info'
    })
  }
}
