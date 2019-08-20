/*
 * BNB module interface
 * @Author: JohnTrump
 * @Date: 2019-08-20 16:02:57
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-08-20 16:10:19
 */
import { ClientResponse } from '../../app/Interface'

export interface Account {
  /** Public key */
  address: string
  /** 账号BNB余额 */
  currencyBalance: number
  /** Public key */
  publicKey: string
}

export interface getAccountInfoResponse extends ClientResponse {
  data: {
    /** Public key */
    address: string
    /** 账号余额 */
    currencyBalance: number
    /** Public key */
    publicKey: string
  }
}
