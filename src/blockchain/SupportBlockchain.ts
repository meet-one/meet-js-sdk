/*
 * List all of the Meet.One Wallet supported chains
 * @Author: JohnTrump
 * @Date: 2019-06-20 14:45:28
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-07-01 11:21:49
 */

export enum SupportBlockchainsEnum {
  EOS = 'eos',
  MEETONE = 'meet.one',
  MEETONE_2 = 'meetone',
  BOS = 'bos',
  ETH = 'eth',
  COSMOS = 'cosmos'
}

/**
 * BlockchiansArray
 */
export const BlockchainsArray = Object.keys(SupportBlockchainsEnum).map(key => ({
  key,
  // @ts-ignore
  value: SupportBlockchainsEnum[key]
}))
