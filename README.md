# meet-js-sdk

更好的 Typescript 支持, 更好的类型提示, 更友好的 API 接口

## Introduction

### ClientResponse

客户端回调统一格式:

```js
ClientResponse = {
  /** 状态码, 0为成功; 998为超时, 999为用户取消 */
  code: number
  /** 类型值, 已弃用 */
  type: number
  /** 客户端返回的数据 */
  data: object
}
```

### Common Module

#### appInfo():Promise<AppInfoResponse>

#### navigate(target: string, options?: object | undefined): Promise<ClientResponse>

#### network(): Promise<NetworkInfo>

#### shareText(title: string, description: string): Promise<ClientResponse>

#### shareImage(url: string): Promise<ClientResponse>

#### shareLink(url: string, title?: string): Promise<ClientResponse>

#### webview(url: string, title?: string | undefined): Promise<ClientResponse>

#### webviewMenu(rightTitle: string, callback: () => any): void

### EOS Module

#### prototype

- account:
  - authority: string /\*_ 账户信息 _/
  - chainType: string /\*_ 区块链类型 _/
  - publicKey: any /\*_ 公钥 _/
  - isHardware: boolean /\*_ 是否为硬件钱包 _/
  - kyc: boolean /\*_ 兼容 Scatter _/
  - name: string /\*_ 账户名 _/

#### sign(signData: string)

#### getIdentity()

获取当前账号信息, 初始化 EOS 模块时会默认调用

#### getEos(eosOptions?: EosConfig):Eosjs

获取`Eosjs`实例对象,这个实例对象的 signProvider 由客户端接管，对`Eosjs`所有操作进行签名。

More detail about `EosConfig`,Please see https://github.com/EOSIO/eosjs/tree/v16.0.9#configuration

TODO: 目前还只支持 `eosjs16+`,之后会支持`eosjs20+`

#### transfer(to:string, amount: number, memo = '', oderInfo = '', options?: {tokenName: string, contract: string, precision: number}):Promise<ClientResponse>

发起转账交易,由客户端与链上进行交互

#### transaction(actions=[], description='', options = {broadcast: true})

Web 应用发起事务,由客户端与链上进行交互

## Contribute Guide

### Run Unit Test

```
cd meet-js-sdk/
npm run test:watch
```

### Run E2E Test

```
cd meet-js-sdk/
npm run start && npx http-server -o -c-1
```

## CHANGE LOG

- 1.0.0
  - 库进行超时判断,如果客户端没有响应,则默认返回一个超时信息(`ErrorMessage:{code: 998, type: 998, data: {message: '操作超时'}}`)
  -
