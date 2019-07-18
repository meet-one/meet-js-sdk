# meet-js-sdk

[![npm version](https://badge.fury.io/js/meet-js-sdk.svg)](https://badge.fury.io/js/meet-js-sdk)
[![js deliver](https://data.jsdelivr.com/v1/package/npm/meet-js-sdk/badge)](https://data.jsdelivr.com/v1/package/npm/meet-js-sdk/badge)

更好的 Typescript 支持, 更好的类型提示, 更友好的 API 接口

Better Typescript support, Better Intelligent code completion, Better friendly APIs

- [Detail APIs](https://meet-common.gitlab.io/fe/meet-js-sdk/index.html)

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
      - [plugin.getEos [recommend]](#plugingeteos-recommend)
      - [plugin.sign](#pluginsign)
      - [plugin.getIdentity](#plugingetidentity)
      - [plugin.transaction](#plugintransaction)
      - [plugin.transfer](#plugintransfer)
    - [Cosmos](#cosmos)
      - [Transactions](#transactions)
        - [plugin.transfer](#plugintransfer-1)
        - [plugin.delegate / plugin.undelegate](#plugindelegate--pluginundelegate)
        - [plugin.redelegate](#pluginredelegate)
        - [plugin.submitProposal](#pluginsubmitproposal)
        - [plugin.deposit](#plugindeposit)
        - [plugin.vote](#pluginvote)
      - [plugin.requestArbitrarySignature](#pluginrequestarbitrarysignature)
        - [How to sign](#how-to-sign)
        - [How to verify signature](#how-to-verify-signature)
      - [Generate Custom Msgs](#generate-custom-msgs)
  - [Contribute Guide](#contribute-guide)
    - [Run Unit Test](#run-unit-test)
    - [Run E2E Test](#run-e2e-test)
  - [Change Log](#change-log)

<!-- /TOC -->

## Quick Start

### Browser

```js
// 钱包通用SDK, 可以调用 `Common Module` 内的方法
// The wallet client common sdk, can invoking `Common Module` functions
let wallet = new MeetJS.MeetWallet({ isDebug: true })

// 下面代码展示加载 `Eos` 插件
// Following the code is showing how to load `Eos` Plugin
wallet.load(new MeetJS.Eos(wallet, {})).then(({ wallet, plugin }) => {
  // callback after plugin loaded success
  let eos = plugin.getEos() // 此对象的所有签名操作将由钱包来代理 (This object's all about signature operations will be proxied by wallet client)
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

加载对应的插件[Plugin](#Plugin), 例如:

Show how to load specific plugin, for example:

1. [EOS](#eosplugin)

   `new MeetJS.Eos(wallet: MeetWallet, options?: { protocol: string, host: string, port: number, chainId: string })`

2. [Cosmos](#cosmosplugin)

   `new MeetJS.Cosmos(wallet: MeetWallet, options?: { protocol: string; host: string; port: number; address: string; SYSToken?: string })`

### wallet.getAppInfo

```
wallet.getAppInfo(forceUpdate)
```

获取当前 APP 客户端信息

Get informations about client

> 初始化 SDK 会自动调用

**Parameters**

forceUpdate - boolean

- true - 每次都调用协议获取 attemp to update everytimes
- false - 优先从缓存中获取 get it first from cache

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
// You can get `appInfo` from `wallet` property direct
console.log(wallet.appInfo)
```

### wallet.getChainInfo

```
wallet.getChainInfo(forceUpdate?: boolean)
```

查询客户端当前所选中的网络, 节点信息

Get the current network information(about the user choosed blockchain network)

> 初始化 SDK 会自动调用, 根据协议返回的内容做了一层兼容性封装, 如果想要获取最原始的客户端返回数据, 请调用 `wallet.getNodeInfo()`

**Parameters**

forceUpdate - boolean

- true - 每次都调用协议获取 attemp to update everytimes
- false - 优先从缓存中获取 get it first from cache

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
// You can also get `nodeInfo` from `wallet` property direct
console.log(wallet.nodeInfo)
```

### wallet.navigate

```
wallet.navigate(target, options)
```

跳转到指定页面中 Jump to the specified page

**Parameters**

- target: string 指定的页面名称 (The specified page name)
- options?: Object 传递给页面的参数 (The parameters will pass to specified page)

**Returns**

``ClientResponse

**Example**

```js
// 成功跳转
// successful
await wallet.navigated('EOSNodeVoteProxyPage')

Promise >>>
  {
    code: 0,
    type: 0,
    data: {}
  }

// 找不到页面
// not found
await wallet.navigate('undefinedView', undefined)
Promise >>>
  {
    code: 404,
    type: 404,
    data: {
      message: '协议或目标找不到' // protocol or target undefined
    }
  }
```

### wallet.shareText

```
wallet.shareText(content: string)
```

分享文本 Share Text Content

**Parameters**

content: string - 分享的文本内容 The share content

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.shareText('I am the description')

// 分享成功[弹窗出来后点击对应的图标]的回调
// Share success
Promise<ClientResponse> >>>
{
  code: 0,
  type: 0,
  data: {
    channel: 1 // 1 - 微信(wechat); 2 - 朋友圈(wechat moment); 3 - QQ; 4 - 微博(weibo); 5 - Facebook; 6 - Telegram
  }
}

// 分享取消的回调
// Share canceled
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

分享图片 Share Picture

**Parameters**

url - string 图片 URL 地址 (The Picture URL)

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.shareImage(
  'https://static.ethte.com/meet/static/images/logo-landscape-8c94de9326b1e256dd02213449180174.png'
)

// 分享成功[弹窗出来后点击对应的图标]的回调
// Share success
Promise<ClientResponse> >>>
{
  code: 0,
  type: 0,
  data: {
    channel: 1 // 1 - 微信; 2 - 朋友圈; 3 - QQ; 4 - 微博; 5 - Facebook; 6 - Telegram
  }
}

// 分享取消的回调
// Share canceled
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

分享链接 Share Link

**Parameters**

url: string - 分享的链接地址 (The link about share)
title: string - 分享的标题 (The title about share)
description: string - 分享的描述 (The description about share)

**Returns**

`Promise<ClientResponse>`

**Example**

```js
await wallet.shareLink('https://meet.one', '我是标题', '我是描述')

// 分享成功[弹窗出来后点击对应的图标]的回调
// Share success
Promise<ClientResponse> >>>
{
  code: 0,
  type: 0,
  data: {
    channel: 1 // 1 - 微信; 2 - 朋友圈; 3 - QQ; 4 - 微博; 5 - Facebook; 6 - Telegram
  }
}

// 分享取消的回调
// Share canceled
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

在应用内打开网页 Open a webpage in client

**Parameters**

url: string - 要跳转的目标地址 (The webpage url)

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

Custom webview's menu button in the upper right corner

**Parameters**

rightTitle: string - 右上角自定义菜单名称 (Custom title)
callback: Function - 当点击右上角菜单时执行的回调 (after click will called)

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

MEET.ONE Wallet have already supported _Scatter Protocols[recommend]_.(eosjs@16.0.9, eosjs@20+)

#### plugin.getEos [recommend]

```
plugin.getEos(eosOptions?: EosConfig, Eos?: Object<Eos>)
```

使用此方法获取 `Eosjs` 实例, 签名部分由客户端代理(`signProvider`), 客户端只负责对数据做签名

`plugin.getEos()` will return `Eosjs` instance object. All operations which need signature will be proxied by `plugin.signProvider()` and invoke client protocol to sign

返回的 `Eosjs` 实例 API 请参考 [EOSIO/eosjs@16.0.9](https://github.com/EOSIO/eosjs/tree/v16.0.9)

`Eosjs` instance object APIs please refer to [EOSIO/eosjs@16.0.9](https://github.com/EOSIO/eosjs/tree/v16.0.9)

**Parameters**

- eosOptions?: EosConfig - [eosjs - configuration](https://github.com/EOSIO/eosjs/tree/v16.0.9#configuration)
- Eos?: Object<Eos> - 尝试从 `window.Eos`上读取, 如果读取不到或者需要自定义 Eos, 从这里传入(options, default `window.Eos`)

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

signData: Object | String - 要签名的数据, 如果是 Object 类型的数据, 会自动进行`JSON`序列化 (The object which want to sign, if the data is `Object` will JSON serialization)

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

Get current account informations

> 初始化 EOS 模块时会默认调用

```
plugin.getIdentity(foreceUpdate?: boolean)
```

**Parameters**

forceUpdate - boolean

- true - 每次都调用协议获取 attemp to update everytimes
- false - 优先从缓存中获取 get it first from cache

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

Pass the transactions and invoke client `sign` protocol, after then push the signature to blockchain

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

Invoke transfer protocol

**Parameters**

- to:string - 转账给`to`目标账号 (transfer target)
- amount: number - 转账数量 (transfer amount)
- memo?: string - 转账 Memo, 默认为空 (memo, default is '')
- orderInfo?: string - 订单信息, 默认为空 (the order description)
- options?: TransferOptions 转账的配置项 (transfer config options)

**Returns**
`Promise<ClientResponse>`

`ClientResponse.data`部分由链上返回, [格式参考](https://gist.github.com/wujunchuan/ee6c5bdcda61e3903c709a2198dcb90e)

**Example**

```js
let res = await plugin.transfer('g.f.w', 0.0001, 'Transfer Memo', 'Order Info')
```

### Cosmos

#### Transactions

封装好的事务相关操作, 只需要传入对应参数, 即可发送事务到链上

```ts
interface CommonTransactionArgs {
  /** 手续费 */
  fee: number
  /** 手续费代币符号, default `this.SYSToken` */
  feeDenom?: string
  /** Gas */
  gas: number
  /** Memo */
  memo?: string
}

interface BroadcastTxCommitResult {
  check_tx?: Object
  deliver_tx?: Object
  hash: string
  height: integer
}
```

##### plugin.transfer

type: `cosmos-sdk/MsgSend`

```
plugin.transfer(input: TransferArgs)
```

**Parameters**

```ts
interface TransferArgs extends CommonTransactionArgs {
  /** 转账的金额 */
  amount: number
  /** 转账代币符号, default `this.SYSToken` */
  amountDenom?: string
  /** transfer to */
  to: string
  /** transfer from[option] */
  from?: string
}
```

**Returns**

`BroadcastTxCommitResult`

Raw Data

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

##### plugin.delegate / plugin.undelegate

抵押与赎回

type: `cosmos-sdk/MsgDelegate`

type: `cosmos-sdk/MsgUndelegate`

```
plugin.delegate(input: DelegateMsgs)
plugin.undelegate(input: DelegateMsgs)
```

**Parameters**

```ts
interface DelegateMsgs extends CommonTransactionArgs {
  /** (取消)抵押的数量 */
  amount: number | string
  /** (取消)抵押的代币符号, default `this.SYSToken` */
  amountDenom?: string
  delegator_address: string
  validator_address: string
}
```

**Returns**

`BroadcastTxCommitResult`

Raw Data - delegate

https://stargate.cosmos.network/txs/0AA58ED1E47915703E06DF46291D664031F889AEBC7A1AA747339A015901B62C

Raw Data - undelegate

https://stargate.cosmos.network/txs/040099262917BBAA9A9AFDD54D448D51A085C4D86DDEB7CA70754E9BA9507AE4

**Example**

```js
let ratio = 1000000

/** delegate */
let res = await plugin.delegate({
  amount: 1,
  fee: 0.0015 * ratio,
  gas: 0.15 * ratio, // 150000
  memo: 'js-sdk test',
  delegator_address: meetwallet.plugin.address,
  validator_address: 'cosmosvaloper1u724thtn8z47nw9nvel367m3qh0gqnxe4g555a'
})

if (res.txhash && typeof res.code === 'undefined') {
  // success
}

/** undelegate */
let res = await plugin.undelegate({
  amount: 1,
  fee: 0.0015 * ratio,
  gas: 0.15 * ratio, // 150000
  memo: 'js-sdk test',
  delegator_address: meetwallet.plugin.address,
  validator_address: 'cosmosvaloper1u724thtn8z47nw9nvel367m3qh0gqnxe4g555a'
})

if (res.txhash && typeof res.code === 'undefined') {
  // successs
}
```

##### plugin.redelegate

type: `cosmos-sdk/MsgBeginRedelegate`,

**Parameters**

```ts
interface RedelegateArgs extends CommonTransactionArgs {
  /** (重新)抵押的数量 */
  amount: number | string
  /** (重新)抵押的代币符号, default `this.SYSToken` */
  amountDenom?: string
  /** 抵押者 */
  delegator: string
  /** 打算抵押的 validator cosmos address */
  to_validator: string
  /** 原先抵押的 validator cosmos address */
  from_validator: string
}
```

**Returns**

`BroadcastTxCommitResult`

Raw Data

https://www.mintscan.io/txs/C7BC679E8F19500D8A47E4FE33B065CD3C73D7D9F730A288B505D21D43308A4F

**Example**

```js
let ratio = 1000000
let res = await plugin.redelegate({
  amount: 1,
  fee: 0.0015 * ratio,
  gas: 0.22 * ratio, // 150000
  memo: 'js-sdk test',
  delegator: meetwallet.plugin.address,
  to_validator: 'cosmosvaloper1u724thtn8z47nw9nvel367m3qh0gqnxe4g555a',
  from_validator: 'cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c'
})

if (res.txhash && typeof res.code === 'undefined') {
  // success(e)
}
```

##### plugin.submitProposal

发起提案

Cosmos governance explain: https://blog.chorus.one/an-overview-of-cosmos-hub-governance/

type: `cosmos-sdk/MsgSubmitProposal`

**Parameters**

```ts
interface SubmitProposalArgs extends CommonTransactionArgs {
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 初始抵押的代币数量 */
  initialDepositAmount: number | string
  /** 初始抵押的代币符号, default `this.SYSToken` */
  initialDepositDenom?: string
  /** 提案类型, 默认为 `Text` */
  proposal_type?: string
  /** 提案人的公钥地址 */
  proposer: string
}
```

**Returns**

`BroadcastTxCommitResult`

Raw Data

https://www.mintscan.io/txs/6ce2f9f3457e30641fef714c2b6855d5a095522a9bf46f2aac94fc1e796797b4

**Example**

```js
let ratio = 1000000
let res = await plugin.submitProposal({
  fee: 0.0015 * ratio,
  gas: 0.06 * ratio, // 60000
  memo: 'js-sdk test',
  title: 'proposal_title',
  description: 'proposal_description',
  initialDepositAmount: 1,
  proposer: meetwallet.plugin.address
})

if (res.txhash && typeof res.code === 'undefined') {
  // success(e)
}
```

##### plugin.deposit

为提案[DepositPeriod]增加保证金

deposit for deposit period proposal

Cosmos governance explain: https://blog.chorus.one/an-overview-of-cosmos-hub-governance/

type: `cosmos-sdk/MsgDeposit`

**Parameters**

```ts
interface DepositArgs extends CommonTransactionArgs {
  /** deposit amount */
  amount: string | number
  /** Token symbol, default `this.SYSToken` */
  amountDenom?: string
  depositor: string
  proposal_id: string
}
```

**Returns**

`BroadcastTxCommitResult`

Raw Data

https://www.mintscan.io/txs/1A98D18BF5C0AB6CA09C4222EC0765DB2BB7DF1FC0FBB41F6FBC61B88AC49BDF

**Example**

```js
let ratio = 1000000
let res = await plugin.deposit({
  amount: 1,
  fee: 0.0015 * ratio,
  gas: 0.22 * ratio, // 22000
  memo: 'js-sdk test',
  depositor: meetwallet.plugin.address,
  proposal_id: 9
})

if (res.txhash && typeof res.code === 'undefined') {
  // success(e)
}
```

##### plugin.vote

type: `cosmos-sdk/MsgVote`

```
plugin.transfer(input)
```

**Parameters**

```ts
input:{
  fee: number | string
  feeDenom: string
  gas: number | string
  memo?: string
  /** options: ["Yes", "No", "No with Veto", "Abstain"] */
  option: string
  proposal_id: string | number
  voter: string
}
```

**Returns**

`BroadcastTxCommitResult`

Raw Data

https://hubble.figment.network/cosmos/chains/cosmoshub-2/transactions/5DD24DC54660D224F590D089FCEFCFDCC37FC96A9EB009F63F7A87E5D841ED6F

**Example**

```js
let ratio = 1000000
let res = await plugin.vote({
  amount: 1,
  fee: 0.0015 * ratio,
  gas: 0.025 * ratio, // 25000
  memo: 'js-sdk test',
  option: 'Yes', // must be ["Yes", "No", "No with Veto", "Abstain"]
  proposal_id: '10',
  voter: meetwallet.plugin.address
})

if (res.txhash && typeof res.code === 'undefined') {
  // success(e)
}
```

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

##### How to sign

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

##### How to verify signature

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

#### Generate Custom Msgs

尽管我们封装了大多数的[COSMOS Transactions](#transactions)便于调用, 但是可能会有一些冷门的 **Transaction**需要开发者自行组装, SDK 暴露了一些基础方法, 方便进行扩展

Even though we have provided mostly [COSMOS Transactions](#transactions) for developers to use.But some special **Transaction** generated by developers, so we export some basic functions for easy to generate custom Msgs.

下面以转账为例

Let's take the transfer as an example.

```ts
async customTransfer(input: TransferArgs) {
  let signObject = await plugin.generateMsg(
    // Set Fee & Gas config
    // fee: { amount: number | string; denom?: string; gas: number | string },
    { amount: input.fee, denom: input.feeDenom, gas: input.gas },
    // 最重要的Msgs内容组装 (The Msgs[] here)
    // msgs: Array<{ type: string; value: object }>,
    [
      {
        type: 'cosmos-sdk/MsgSend', // 类型请参考 `cosmos/go-sdk`
        value: {
          amount: [
            {
              amount: String(input.amount),
              denom: input.amountDenom || this.SYSToken
            }
          ],
          from_address: input.from || this.account.address,
          to_address: input.to
        }
      }
    ],
    // 每个事务都可以带上memo, 默认为`''`(Every transaction can bring memo, default is `''`)
    // memo?: string
    input.memo
  )
  // `plugin.signProvider` 会调用客户端协议进行签名, 并且将签名推送到链上(get signature and broadcast)
  return plugin.signProvider(signObject)
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
