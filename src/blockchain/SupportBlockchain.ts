/*
 * List all of the Meet.One Wallet supported chains
 * @Author: JohnTrump
 * @Date: 2019-06-20 14:45:28
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-25 16:13:32
 */

/**
 * Support Blockchian
 */
export const Blockchains = {
  EOS: 'eos',
  MEETONE: 'meetone',
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
