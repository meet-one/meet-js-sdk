import PostMessageModule from '../../src/app/PostMessageModule'

let postMeesageModule = new PostMessageModule('meetone://')

describe('callbackid generate', () => {
  it('Start with meetjs_callback_', () => {
    let callbackid = postMeesageModule.getCallbackId()
    expect(callbackid.startsWith('meetjs_callback_')).toBeTruthy()
  })
  it('Not handle start with meet_callback_', () => {
    let callbackid = postMeesageModule.getCallbackId()
    expect(callbackid.startsWith('meet_callback')).toBeFalsy()
  })
})

describe('generateMessage & send', () => {
  let path = 'app/webview'
  let payload = { title: 'MEET.ONE Homepage', url: 'https://meet.one' }
  let message = postMeesageModule.generateMessage(path, payload)
  let message_times = postMeesageModule.generateMessage(path, payload, {
    protocal: 'moreone://',
    callbackId: 'meet_callback_times'
  })

  it('generate message', () => {
    // console.log(message)
    // console.log(message_times)
    // TODO: 判断参数 及 路由名称
  })

  it('send message', () => {
    // TODO: need e2e test
    postMeesageModule.sendMessage(message)
  })
})

describe('data handle', () => {
  let payload = { network: 'eos' }
  it('encode & decode', () => {
    let encodeData = postMeesageModule.encode(payload)
    let decodeData = postMeesageModule.decode(encodeData)
    expect(JSON.stringify(decodeData) === JSON.stringify(payload)).toBeTruthy()
  })
})

describe('generate()', () => {
  let path = 'app/webview'
  let payload = { title: 'MEET.ONE Homepage', url: 'https://meet.one' }
  it('can callback times', () => {
    const callbackId = 'can_callback_times'
    let promise_callback = postMeesageModule.generate(path, payload, {
      callbackId
    })
    expect(promise_callback instanceof Function).toBeTruthy()
    expect(typeof window[callbackId] === 'function').toBeTruthy()
  })
  it('callback once', () => {
    let promise_callback = postMeesageModule.generate(path, payload)
    expect(promise_callback instanceof Promise).toBeTruthy()
    // need e2e
    // expect(typeof window[callbackId] === 'function').toBeTruthy()
  })
})
