# meet-js-sdk

更好的 Typescript 支持, 更好的类型提示, 更友好的 API 接口

<!-- TOC -->

- [meet-js-sdk](#meet-js-sdk)
  - [Quick Start](#quick-start)
    - [Browser](#browser)
  - [Common](#common)
    - [wallet.load](#walletload)
    - [wallet.getAppInfo](#walletgetappinfo)
    - [wallet.getChainInfo](#walletgetchaininfo)
    - [wallet.navigate](#walletnavigate)
    - [wallet.shareText](#walletsharetext)
    - [wallet.shareImage](#walletshareimage)
    - [wallet.shareLink](#walletsharelink)
    - [wallet.webview](#walletwebview)
    - [wallet.webviewMenu](#walletwebviewmenu)
  - [Plugin](#plugin)
    - [Eos](#eos)
      - [plugin.getEos](#plugingeteos)
      - [plugin.sign](#pluginsign)
      - [plugin.getIdentity](#plugingetidentity)
      - [plugin.transaction](#plugintransaction)
      - [plugin.transfer](#plugintransfer)
    - [Cosmos](#cosmos)
      - [plugin.requestArbitrarySignature](#pluginrequestarbitrarysignature)
        - [签名过程](#签名过程)
        - [验证签名](#验证签名)
      - [plugin.transfer](#plugintransfer-1)
  - [Contribute Guide](#contribute-guide)
    - [Run Unit Test](#run-unit-test)
    - [Run E2E Test](#run-e2e-test)
  - [Change Log](#change-log)

<!-- /TOC -->

## Quick Start

### Browser

```js
// 钱包通用SDK, 可以调用 `Common Module` 内的方法
let wallet = new MeetJS.MeetWallet({ isDebug: true })

// 下面代码展示加载 `Eos` 插件
wallet.load(new MeetJS.Eos(wallet, {})).then(({ wallet, plugin }) => {
  // callback after plugin loaded success
  let eos = plugin.getEos() // 此对象的所有签名操作将由钱包来代理
  let account = plugin.account // current wallet identity

  eos
    .transaction({
      actions: [
        {
          account: 'eosio.token',
          name: 'transfer',
          authorization: [
            {
              actor: account.name, // creator
              permission: account.authority
            }
          ],
          data: {
            from: account.name, // creator
            to: 'g.f.w',
            quantity: '0.0001 EOS',
            memo: 'meet-js-sdk signProvider'
          }
        }
      ],
      options: {
        broadcast: true
      }
    })
    .then(res => {
      // if success, you will get `res.transaction_id`
    })
})
```

## Common

### wallet.load

```
wallet.load(Plugin)
```

**Parameters**

Plugin:Object - [EOS](#eosplugin), [Cosmos](#cosmosplugin):

加载对应的插件[Plugin](#Plugin), 例如

1. [EOS](#eosplugin)

   `new MeetJS.Eos(wallet: MeetWallet, options?: { protocol: string, host: string, port: number, chainId: string })`

2. [Cosmos](#cosmosplugin)

   `new MeetJS.Cosmos(wallet: MeetWallet, options?: { protocol: string; host: string; port: number; address: string; SYSToken?: string })`

### wallet.getAppInfo

```
wallet.getAppInfo(forceUpdate)
```

获取当前 APP 客户端信息

> 初始化 SDK 会自动调用

**Parameters**

forceUpdate - boolean

- true - 每次都调用协议获取
- false - 优先从缓存中获取

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.getAppInfo(true)

Promise >>>
  {
    code: 0,
    type: 0,
    data: {
      appVersion: '2.6.0',
      isMeetOne: true,
      language: 'zh-Hans',
      platform: 'iOS'
    }
  }

// 也可以直接从wallet属性上获取
console.log(wallet.appInfo)
```

### wallet.getChainInfo

```
wallet.getChainInfo(forceUpdate?: boolean)
```

查询客户端当前所选中的网络, 节点信息

> 初始化 SDK 会自动调用, 根据协议返回的内容做了一层兼容性封装, 如果想要获取最原始的客户端返回数据, 请调用 `wallet.getNodeInfo()`

**Parameters**

forceUpdate - boolean

- true - 每次都调用协议获取
- false - 优先从缓存中获取

**Returns**

```js
this.nodeInfo = {
  blockchain: string // blockchain type
  chainId: string // blockchain chainId
  host: string // hostname
  port: number // port, 默认为80
  protocol: string // protocol, default is http
}
```

可以直接通过`wallet.nodeInfo`访问

**Example**

```js
await this.getChainInfo(true)
Promise >>>
  {
    blockchain: 'eos',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    host: 'mainnet.shareeos.com',
    port: 443,
    protocol: 'https'
  }
// 也可以直接从wallet属性上获取
console.log(wallet.nodeInfo)
```

### wallet.navigate

```
wallet.navigate(target, options)
```

跳转到指定页面中

**Parameters**

- target: string 指定的页面名称
- options?: Object 传递给页面的参数

**Returns**

``ClientResponse

**Example**

```js
// 成功跳转
await wallet.navigated('EOSNodeVoteProxyPage')

Promise >>>
  {
    code: 0,
    type: 0,
    data: {}
  }

// 找不到页面
await wallet.navigate('undefinedView', undefined)
Promise >>>
  {
    code: 404,
    type: 404,
    data: {
      message: '协议或目标找不到'
    }
  }
```

### wallet.shareText

```
wallet.shareText(content: string)
```

分享文本

**Parameters**

content: string - 分享的文本内容

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.shareText('I am the description')

// 分享成功[弹窗出来后点击对应的图标]的回调
Promise<ClientResponse> >>>
{
  code: 0,
  type: 0,
  data: {
    channel: 1 // 1 - 微信; 2 - 朋友圈; 3 - QQ; 4 - 微博; 5 - Facebook; 6 - Telegram
  }
}

// 分享取消的回调
Promise<ClientResponse> >>>
{
  code: 999,
  type: 999,
  data: {message: '操作取消'}
}

```

### wallet.shareImage

```
wallet.shareImage(url: string)
```

分享图片

**Parameters**

url - string 图片 URL 地址

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.shareImage(
  'https://static.ethte.com/meet/static/images/logo-landscape-8c94de9326b1e256dd02213449180174.png'
)

// 分享成功[弹窗出来后点击对应的图标]的回调
Promise<ClientResponse> >>>
{
  code: 0,
  type: 0,
  data: {
    channel: 1 // 1 - 微信; 2 - 朋友圈; 3 - QQ; 4 - 微博; 5 - Facebook; 6 - Telegram
  }
}

// 分享取消的回调
Promise<ClientResponse> >>>
{
  code: 999,
  type: 999,
  data: {message: '操作取消'}
}
```

### wallet.shareLink

```
wallet.shareLink(url: string, title: string, description: string)
```

分享链接

**Parameters**

url: string - 分享的链接地址
title: string - 分享的标题
description: string - 分享的描述

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.shareLink('https://meet.one', '我是标题', '我是描述')

// 分享成功[弹窗出来后点击对应的图标]的回调
Promise<ClientResponse> >>>
{
  code: 0,
  type: 0,
  data: {
    channel: 1 // 1 - 微信; 2 - 朋友圈; 3 - QQ; 4 - 微博; 5 - Facebook; 6 - Telegram
  }
}

// 分享取消的回调
Promise<ClientResponse> >>>
{
  code: 999,
  type: 999,
  data: {message: '操作取消'}
}
```

### wallet.webview

```
wallet.webview(url: string)
```

在应用内打开网页

**Parameters**

url: string - 要跳转的目标地址

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.webview('https://meet.one')
// Success
Promise<ClientResponse> >>>
{
  code: 0,
  type: 7,
  data: {}
}

```

### wallet.webviewMenu

```
wallet.webviewMenu(rightTitle: string, callback: Function)
```

自定义当前 webview 右上角菜单名称, 及点击事件

**Parameters**

rightTitle: string - 右上角自定义菜单名称
callback: Function - 当点击右上角菜单时执行的回调

**Returns**

None

**Example**

```js
wallet.webviewMenu('custom menu', () => {
  alert('you click the menu')
})
```

## Plugin

### Eos

客户端已经支持并兼容 Scatter 协议(eosjs@16.0.9, eosjs@20+)

#### plugin.getEos

```
plugin.getEos(eosOptions?: EosConfig, Eos?: Object<Eos>)
```

使用此方法获取 `Eosjs` 实例, 签名部分由客户端代理(`signProvider`), 客户端只负责对数据做签名

返回的 `Eosjs` 实例 API 请参考 [EOSIO/eosjs@16.0.9](https://github.com/EOSIO/eosjs/tree/v16.0.9)

**Parameters**

- eosOptions?: EosConfig - [配置项](https://github.com/EOSIO/eosjs/tree/v16.0.9#configuration)
- Eos?: Object<Eos> - 尝试从 `window.Eos`上读取, 如果读取不到或者需要自定义 Eos, 从这里传入

**Example**

```js
let eos = plugin.getEos();
eos.transaction({...})
```

#### plugin.sign

```
plugin.sign(signData: Object)
```

**Parameters**

signData: Object - 要签名的数据, 如果是 Object 类型的数据, 会自动进行`JSON`序列化

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await plugin.sign({message: '芝士就是力量'})
// success
Promise<ClientResponse> >>>
{data: {isOwner: true, account: "johntrump123", signature: "SIG_K1_KXbiT3zRZJYjB3FV8xv3qPYjDaBPQbfGiw8ZWwgmEpM…fg4yMazqc2iJycUa4ETtqzbza3HvqVmVBtvuacjcW77G8zgm6"}, code: 0, type: 6}
```

#### plugin.getIdentity

获取当前账号信息

> 初始化 EOS 模块时会默认调用

```
plugin.getIdentity(foreceUpdate?: boolean)
```

**Parameters**

forceUpdate - boolean

- true - 每次都调用协议获取
- false - 优先从缓存中获取

**Returns**

```ts
interface Account {
  authority: string, // 权限
  chainType: string, // EOS链类型, 支持 MEETONE\EOS\BOS..
  name: string, // EOS账号名
  publicKey: string, // 公钥地址
  isHardware: boolean, // static
  kyc: boolean // static
}

Promise<Account>
```

**Example**

```js
await plugin.getIdentity()

Promise<Account>

>>>

{
  "authority": "active",
  "chainType": "eos",
  "name": "johntrump123",
  "publicKey": "EOS7ukaArHrh4uLVXuauRC1Mjr2zbu1QTv7WQrFEV8rzbaMvv5aPd",
  "isHardware": false,
  "kyc": false
}

// 同时更新 `wallet.plugin.account`
console.log(wallet.plugin.account)
```

#### plugin.transaction

```
plugin.transaction(
  actions = [],
  description = '',
  options = { broadcast: true }
)
```

发送协议给客户端, 将组装的事务交由客户端去签名,推送到链上

**Parameters**

- actions: Action[] - 要提交的事务操作
- description?: string 对事务的描述
- options?: {broadcast: true} - 配置

**Returns**

`Promise<ClientResponse>`

`ClientResponse.data`部分由链上返回, [格式参考](https://gist.github.com/wujunchuan/ee6c5bdcda61e3903c709a2198dcb90e)

**Example**

```js
let account = plugin.account
let res = await plugin.transaction(
  [
    {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [
        {
          actor: account.name, // creator
          permission: account.authority
        }
      ],
      data: {
        from: account.name, // creator
        to: 'g.f.w',
        quantity: '0.0001 EOS',
        memo: 'js-sdk transaction'
      }
    }
  ],
  'js-sdk transaction test Description'
)
```

#### plugin.transfer

```ts
interface TransferOptions {
  /** 代币名称, 默认为`EOS` */
  tokenName: string
  /** 合约账号, 默认为 `eosio.token` */
  contract: string
  /** 精度设置, 默认为 4 */
  precision: number
}

plugin.transfer(
  to: string,
  amount: number,
  memo = '',
  orderInfo = '',
  options?: TransferOptions
)
```

发起转账协议, 由客户端签名并发送到链上

**Parameters**

- to:string - 转账给`to`目标账号
- amount: number - 转账数量
- memo?: string - 转账 Memo, 默认为空
- orderInfo?: string - 订单信息, 默认为空
- options?: TransferOptions 转账的配置项

**Returns**
`Promise<ClientResponse>`

`ClientResponse.data`部分由链上返回, [格式参考](https://gist.github.com/wujunchuan/ee6c5bdcda61e3903c709a2198dcb90e)

**Example**

```js
let res = await plugin.transfer('g.f.w', 0.0001, 'Transfer Memo', 'Order Info')
```

### Cosmos

#### plugin.requestArbitrarySignature

```
plugin.requestArbitrarySignature(signObject: any)
```

**Parameters**

**Returns**

`Promise<ClientResponse>`

**Example**

```js
let signData = 'hello world'
let res = await plugin.requestArbitrarySignature(signData)
Promise<ClientResponse> >>>

{
  code: 0,
  type: 0,
  data: {
    publicKey: 'cosmos1jwgdw55ssd3zdwfgm20sh6pc5kmwzfqdg84m4g',
    signature: 'a69d3ed83aca5af910de2b05115657bff3ed384750c1aeb7d9bfce4b5bf83f3010714584e1d5a7007db9ede5db4087724fe7c01ac273781f565bfa44d8590448'
  }
}

```

##### 签名过程

```js
const secp256k1 = require('secp256k1') // https://github.com/cryptocoinjs/secp256k1-node

const hash = crypto
  .createHash('sha256')
  .update(signData)
  .digest('hex')
const buf = Buffer.from(hash, 'hex')
// `ecpairPriv` 为私钥
let signObj = secp256k1.sign(buf, ecpairPriv)

// 签名结果
let signatureBase64 = Buffer.from(signObj.signature, 'binary').toString('hex')
```

##### 验证签名

下面以 `secp256k1-node`库为例

```js
const secp256k1 = require('secp256k1') // https://github.com/cryptocoinjs/secp256k1-node

// Public Key Byte
const pubKeyByte = secp256k1.publicKeyCreate(ecpairPriv)

// secp256k1.verify(Buffer message, Buffer signature, Buffer publicKey)
var isVerify = secp256k1.verify(
  buf,
  // signObj.signature,
  Buffer.from(
    'a69d3ed83aca5af910de2b05115657bff3ed384750c1aeb7d9bfce4b5bf83f3010714584e1d5a7007db9ede5db4087724fe7c01ac273781f565bfa44d8590448',
    'hex'
  ),
  Buffer.from(pubKeyByte, 'binary')
)

console.log(isVerify) // true
```

#### plugin.transfer

```
plugin.transfer(input: TransferArgs)
```

**Parameters**

```ts
interface TransferArgs {
  /** 转账的金额 */
  amount: number
  /** 转账代币符号, default `this.SYSToken` */
  amountDenom?: string
  /** 手续费 */
  fee: number
  /** 手续费代币符号, default `this.SYSToken` */
  feeDenom?: string
  /** Gas */
  gas: number
  /** Memo */
  memo?: string
  /** transfer to */
  to: string
  /** transfer from[option] */
  from?: string
}
```

**Returns**

https://stargate.cosmos.network/txs/A9FA53852753EC40207858F74CF08B5D91773851A22E86EAFD36F94EECE91BBF

**Example**

```js
let ratio = 1000000
let res = await plugin.transfer({
  amount: 1,
  fee: 0.0015 * ratio,
  gas: 0.04 * ratio,
  memo: 'js-sdk test',
  to: 'cosmos1yqg3xm8ftxm96trp2j3jyknfm4t7tlgwxpgtth'
})
if (res.txhash && typeof res.code === 'undefined') {
  // success(e)
}
```

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

## Change Log

- 1.0.0
  - 库进行超时判断,如果客户端没有响应,则默认返回一个超时信息(`ErrorMessage:{code: 998, type: 998, data: {message: '操作超时'}}`)
