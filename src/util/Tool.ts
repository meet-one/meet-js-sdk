/*
 * 常见工具
 * @Author: JohnTrump
 * @Date: 2019-06-24 15:10:54
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-25 16:23:39
 */
class Tool {
  constructor() {}
  /**
   * 获取URL上的参数
   *
   * 注意返回的字段都是**string**类型
   *
   * eg: `getQueryString("lang")`
   *
   * @param name 需要查询的字段
   * @param url window.location.href
   *
   */
  getQueryString(name: string, url?: string): string {
    if (typeof window !== 'undefined') {
      let reg = new RegExp('[?&]' + name + '=([^&#]*)', 'i')
      // let res = window.location.href.match(reg)
      let res: string[] | null = []
      if (typeof url === 'string') {
        res = url.match(reg)
      } else {
        res = window.location.href.match(reg)
      }
      if (res && res.length > 1) {
        return decodeURIComponent(res[1])
      }
      return ''
    } else {
      // nodejs
      throw new Error('Not support nodejs')
    }
  }
  /**
   * 比较版本号
   * @param v1 版本1
   * @param v2 版本2
   * @returns {number}
   * 如果 版本1 > 版本2 则返回1
   * 如果版本1 < 版本2 则返回-1
   * 如果版本1 = 版本2 则返回0
   */
  versionCompare(v1: string, v2: string): number {
    if (typeof v1 !== 'string' || typeof v2 !== 'string') {
      throw new Error('Params Error, params(v1, v2) must be string')
    }
    const GTR = 1 // 大于
    const LSS = -1 // 小于
    const EQU = 0 // 等于
    let v1arr = String(v1)
      .split('.')
      .map(function(a) {
        return parseInt(a)
      })
    let v2arr = String(v2)
      .split('.')
      .map(function(a) {
        return parseInt(a)
      })
    let arrLen = Math.max(v1arr.length, v2arr.length)
    let result = 0

    // 循环比较版本号
    for (let i = 0; i < arrLen; i++) {
      result = compare(v1arr[i], v2arr[i])
      if (result == EQU) {
        continue
      } else {
        break
      }
    }

    return result

    function compare(n1: number, n2: number) {
      if (typeof n1 != 'number') {
        n1 = 0
      }
      if (typeof n2 != 'number') {
        n2 = 0
      }
      if (n1 > n2) {
        return GTR
      } else if (n1 < n2) {
        return LSS
      } else {
        return EQU
      }
    }
  }
}

export default new Tool()
