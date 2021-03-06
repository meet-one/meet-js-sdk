/** 初始化指定的参数 */
export interface Config {
  /** 协议超时时间(ms)， 默认为 `60000`ms */
  timeout?: number
  /** 协议名，默认为`meetone://` */
  protocol?: string
  /** 是否设置为调试模式（调试模式会将相关信息打印出来, 包括协议与客户端返回） */
  isDebug?: boolean
  /** 当前版本 */
  version?: string
}

export interface ClientResponse {
  /** 状态码, 0为成功 */
  code: number
  /** 类型值, 已弃用 */
  type: number
  /** 客户端返回的数据 */
  data?: object
}

/** 包含错误信息的客户端回调 */
export interface ErrorMessage extends ClientResponse {
  data: {
    /** 错误信息 */
    message: string
  }
}

/** 客户端的节点信息 */
export interface NodeInfo {
  /** 当前客户端选中的钱包类型 */
  blockchain: string
  /** 当前客户端连接的节点Host地址 */
  host?: string
  /** 当前客户端连接的节点端口号 */
  port?: number
  /** 当前客户端连接的节点协议名称 */
  protocol?: string
  /** 当前客户端返回的`chainid` */
  chainId?: string
}
export interface NodeInfoResponse extends ClientResponse {
  /** 客户端回调回来的业务数据 */
  data: {
    /** 当前客户端选中的钱包类型 */
    blockchain?: string
    /** 当前客户端连接的节点Host地址 */
    host?: string
    /** 当前客户端连接的节点端口号 */
    port?: number
    /** 当前客户端连接的节点协议名称 */
    protocol?: string
    /** 当前客户端返回的`chainid` */
    chainId?: string
    // 兼容低版本
    /** 当前客户端选中的钱包类型 */
    name: string
    /** 当前客户端连接的节点地址 */
    domains: Array<string>
    /** 当前客户端返回的`chainid` */
    chain_id: string
  }
}

/**
 * APP 信息
 */
export interface AppInfo {
  /** 是否为MEETONE客户端内 */
  isMeetOne: boolean
  /** 当前应用版本号 */
  appVersion: string
  /** 当前平台 */
  platform: string
  /** 当前语系 */
  language: string
  /** APP信息是否来自URL中(旧版) */
  isFromUrl?: boolean
}

export interface AppInfoResponse extends ClientResponse {
  data: AppInfo
}
