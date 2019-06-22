/** 初始化指定的参数 */
interface Config {
  /** 协议超时时间(ms)， 默认为 `60000`ms */
  timeout?: number
  /** 协议名，默认为`meetone://` */
  protocal?: string
  /** 是否设置为调试模式（调试模式会将相关信息打印出来, 包括协议与客户端返回） */
  isDebug?: boolean
  /** 当前版本 */
  version?: string
}

interface ClientResponse {
  /** 状态码, 0为成功 */
  code: number
  /** 类型值, 已弃用 */
  type: number
  /** 客户端返回的数据 */
  data: object
}

/** 包含错误信息的客户端回调 */
interface ErrorMessage extends ClientResponse {
  data: {
    /** 错误信息 */
    message: string
  }
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

export { NetworkInfo, ClientResponse, Config, ErrorMessage }
