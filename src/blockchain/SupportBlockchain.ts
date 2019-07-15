/*
 * List all of the Meet.One Wallet supported chains
 * @Author: JohnTrump
 * @Date: 2019-06-20 14:45:28
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-07-01 11:21:49
 */

/**
 * Support Blockchian
 */
export const Blockchains = {
  EOS: 'eos',
  // iOS端与Android端没有统一, 所以取两个
  MEETONE: 'meet.one', // iOS
  MEETONE_2: 'meetone', // Android
  BOS: 'bos',
  ETH: 'eth',
  COSMOS: 'cosmos'
}

/**
 * BlockchiansArray
 */
export const BlockchainsArray = Object.keys(Blockchains).map(key => ({
  key,
  // @ts-ignore
  value: Blockchains[key]
}))
