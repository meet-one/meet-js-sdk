interface ClientResponse {
  /** 状态码, 0为成功 */
  code: number
  /** 类型值, 已弃用 */
  type: number
}

interface NetworkInfo extends ClientResponse {
  /** 客户端回调回来的业务数据 */
  data: {
    /** 当前客户端选中的钱包类型 */
    blockchain: string
    /** 当前客户端返回的`chainid` */
    chianId: string
    /** 当前客户端连接的节点Host地址 */
    host: string
    /** 当前客户端连接的节点端口号 */
    port: number
    /** 当前客户端连接的节点协议名称 */
    protocal: string
  }
}

export { NetworkInfo, ClientResponse }
