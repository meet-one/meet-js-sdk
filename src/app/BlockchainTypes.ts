/*
 * List all of the Meet.One Wallet supported chains
 * @Author: JohnTrump
 * @Date: 2019-06-20 14:45:28
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-21 15:21:47
 */

let list = new Map()

list.set(1, 'EOS')
list.set(2, 'ETH')
list.set(3, 'COSMOS')

const BlockchainTypes = {
  // getType(id: number | string) {
  //   return list.has(id) ? list.get(id) : 'UNKNOWN'
  // },
  // getID(type: string) {
  //   type = type.toUpperCase()
  //   for (const [key, value] of list) {
  //     if (value == type) return key
  //   }
  //   return 0
  // }
}

export default BlockchainTypes
