import MeetWallet from '../src/index'

const CUSTOM_TIMEOUT = 10 * 1000

let meetwallet = new MeetWallet({ timeout: CUSTOM_TIMEOUT })
let morewallet = new MeetWallet({ protocal: 'more://' })

describe('index.ts', () => {
  test('init meetwallet', () => {
    expect(meetwallet.protocal === 'meetone://').toBeTruthy()
  })

  test('sdk version equal to package.json', () => {
    expect(meetwallet.version === require('../package.json').version).toBeTruthy()
  })

  test('custom timeout', () => {
    expect(meetwallet.bridge.timeout === CUSTOM_TIMEOUT).toBeTruthy()
  })

  test('custom protocal', () => {
    expect(morewallet.bridge.protocal === 'more://').toBeTruthy()
  })
})
