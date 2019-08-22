/*
 * @Author: JohnTrump
 * @Date: 2019-08-19 16:33:13
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-08-20 16:18:41
 */
import Blockchian from '../BlockChain'
import { ClientResponse } from '../../app/Interface'
import { MeetWallet } from '../../index'
import { SupportBlockchainEnums } from '../SupportBlockchain'
import * as I from './interface'

export class BNB extends Blockchian {
  /** 当前账号 Current account info */
  account!: I.Account
  constructor(wallet: MeetWallet, options?: any) {
    super(SupportBlockchainEnums.BNB, wallet)
    /* TODO: options settings not handle */
  }

  init(): this {
    // 如果当前网络非BNB类型的, 则抛出错误
    let type = this.wallet.nodeInfo.blockchain.toLowerCase() as SupportBlockchainEnums
    let supportTypes = [SupportBlockchainEnums.BNB, SupportBlockchainEnums.BNB_2]
    if (!supportTypes.includes(type)) {
      // TODO: 询问用户是否切换网络[设想的 -> 切换后实现页面刷新重载]
      throw new Error(`Current Network Type is ${type}, No one of the ${supportTypes}`)
    }

    this.getAccountInfo().then(resolve => {
      if (resolve) {
        if (resolve.code == 0) {
          this.account = resolve.data
        }
        if (typeof window !== 'undefined') document.dispatchEvent(new CustomEvent('meetoneLoaded'))
      }
    })
    return this
  }

  /**
   * 授权获取账户信息
   *
   * Get current account information
   */
  getAccountInfo(): Promise<I.getAccountInfoResponse> {
    return this.wallet.bridge.generate('bnb/account_info', {})
  }
  /**
   * 获取账户余额
   *
   * Get current account balance
   *
   * @param {string} symbol symbol name, eg. `ADA.B-B63_BNB`
   */
  /*
    客户端返回：{
        "symbol":"ADA.B-B63_BNB", //单位
        "balance":"200"    //数量
    }
   */
  getBalance(symbol: string): Promise<ClientResponse> {
    return this.wallet.bridge.generate('bnb/getBalance', {
      symbol
    })
  }
  /**
   *
   * 发起交易
   *
   * request transfer token
   *
   * @param {string} symbol - token name (eg: `ADA.B-B63_BNB`)
   * @param {string} toAddress - to Address(eg: `bnb1uejer2tme2xx3ddtfcuxggnnfk2rz2l4rq9xjh`)
   * @param {string} amount - transfer amount (eg: `0.0000001`)
   * @param {string} memo - The transfer memo( <128 Bytes)
   */
  transfer(symbol: string, toAddress: string, amount: string, memo: string) {
    return this.wallet.bridge.generate('bnb/transfer', {
      symbol,
      toAddress,
      amount,
      memo
    })
  }

  /**
   *
   * 创建订单(买入&&卖出)
   *
   * Create new order
   *
   * @param {string} symbol
   * @param {string} orderType
   * @param {string} side
   * @param {string} price
   * @param {string} quantity
   * @param {string} timeInForce
   * @memberof BNB
   */
  newOrder(
    symbol: string,
    orderType: string,
    side: string,
    price: string,
    quantity: string,
    timeInForce: string
  ) {
    return this.wallet.bridge.generate('bnb/newOrder', {
      symbol,
      orderType,
      side,
      price,
      quantity,
      timeInForce
    })
  }

  /**
   *
   * 取消订单
   *
   * Cancel order
   *
   * @param {string} symbol
   * @param {string} refId
   */
  cancelOrder(symbol: string, refId: string) {
    return this.wallet.bridge.generate('bnb/cancelOrder', {
      symbol,
      refId
    })
  }

  /**
   * 发起投票请求
   *
   * request for voting
   *
   * @param {string} proposalId - the id of voting proposal(eg: `347L`)
   * @param {string} option - the voting options (eg: `1`)
   */
  requestVote(proposalId: string, option: string) {
    return this.wallet.bridge.generate('bnb/vote', {
      proposalId,
      option
    })
  }

  /**
   *
   * 请求冻结Token
   *
   * request to Freeze the token
   *
   * @param {string} symbol token name (eg: `ADA.B-B63_BNB`)
   * @param {string} amount the amount of requesting to freeze (eg: `0.000001`)
   */
  tokenFreeze(symbol: string, amount: string) {
    return this.wallet.bridge.generate('bnb/tokenFreeze', {
      symbol,
      amount
    })
  }

  /**
   * 请求解冻Token
   *
   * request to UnFreeze the token
   * @param {string} symbol token name (eg: `ADA.B-B63_BNB`)
   * @param {string} amount the amount of requesting to unfreeze (eg: `0.000001`)
   */
  tokenUnFreeze(symbol: string, amount: string) {
    return this.wallet.bridge.generate('bnb/tokenUnFreeze', {
      symbol,
      amount
    })
  }
}
