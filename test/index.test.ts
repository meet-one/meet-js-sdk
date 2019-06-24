import { MeetWallet } from '../src/index'
import tool from '../src/util/Tool'

const CUSTOM_TIMEOUT = 10 * 1000
const MORE_PROTOCOL = 'more://'

let meetwallet = new MeetWallet({ timeout: CUSTOM_TIMEOUT })
let morewallet = new MeetWallet({ protocol: MORE_PROTOCOL })

describe('index.ts', () => {
  test('init meetwallet', () => {
    expect(meetwallet.config.protocol === 'meetone://').toBeTruthy()
    expect(morewallet.config.protocol === MORE_PROTOCOL).toBeTruthy()
    expect(meetwallet.config.isDebug).toBeFalsy()
    expect(morewallet.bridge.config.isDebug).toBeFalsy()
  })

  test('sdk version equal to package.json', () => {
    expect(meetwallet.config.version === require('../package.json').version).toBeTruthy()
    expect(morewallet.config.version === require('../package.json').version).toBeTruthy()
  })

  test('custom timeout', () => {
    expect(meetwallet.bridge.config.timeout === CUSTOM_TIMEOUT).toBeTruthy()
  })

  test('custom protocol', () => {
    expect(morewallet.bridge.config.protocol === MORE_PROTOCOL).toBeTruthy()
  })
})

describe('util/Tool.ts', () => {
  test('versionCompare', () => {
    expect(tool.versionCompare('2.6.0', '2.5.89') == 1).toBeTruthy()
    expect(tool.versionCompare('2.4.99', '2.5.89') == -1).toBeTruthy()
    expect(tool.versionCompare('2.4.99.99', '2.4.99.99') == 0).toBeTruthy()
    expect(tool.versionCompare('2.4', '2.4') == 0).toBeTruthy()
  })
})
