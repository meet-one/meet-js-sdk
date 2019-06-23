import { MeetWallet } from '../src/index'

const CUSTOM_TIMEOUT = 10 * 1000
const MORE_PROTOCAL = 'more://'

let meetwallet = new MeetWallet({ timeout: CUSTOM_TIMEOUT, isDebug: true })
let morewallet = new MeetWallet({ protocal: MORE_PROTOCAL })

describe('index.ts', () => {
  test('init meetwallet', () => {
    expect(meetwallet.config.protocal === 'meetone://').toBeTruthy()
    expect(morewallet.config.protocal === MORE_PROTOCAL).toBeTruthy()
    expect(meetwallet.config.isDebug).toBeTruthy()
    expect(morewallet.bridge.config.isDebug).toBeFalsy()
  })

  test('sdk version equal to package.json', () => {
    expect(meetwallet.config.version === require('../package.json').version).toBeTruthy()
    expect(morewallet.config.version === require('../package.json').version).toBeTruthy()
  })

  test('custom timeout', () => {
    expect(meetwallet.bridge.config.timeout === CUSTOM_TIMEOUT).toBeTruthy()
  })

  test('custom protocal', () => {
    expect(morewallet.bridge.config.protocal === MORE_PROTOCAL).toBeTruthy()
  })
})
