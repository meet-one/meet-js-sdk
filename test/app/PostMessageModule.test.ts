import PostMessageModule from '../../src/app/PostMessageModule'

let postMeesageModule = new PostMessageModule({ protocal: 'meetone://' })

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
