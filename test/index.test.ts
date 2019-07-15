import { MeetWallet } from '../src/index'
import Tool from '../src/util/Tool'

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
    expect(Tool.versionCompare('2.6.0', '2.5.89') == 1).toBeTruthy()
    expect(Tool.versionCompare('2.4.99', '2.5.89') == -1).toBeTruthy()
    expect(Tool.versionCompare('2.4.99.99', '2.4.99.99') == 0).toBeTruthy()
    expect(Tool.versionCompare('2.4', '2.4') == 0).toBeTruthy()
  })
  test('getQueryString', () => {
    let mockurl =
      'http://192.168.8.191:8080/test/e2e/?meetone=true&meetone_version=2.5.0&system_name=iOS&lang=zh-Hans'
    expect(Tool.getQueryString('meetone', mockurl) === 'true').toBeTruthy()
    expect(Tool.getQueryString('meetone_version', mockurl) === '2.5.0').toBeTruthy()
    expect(Tool.getQueryString('system_name', mockurl).toLowerCase() === 'ios').toBeTruthy()
    expect(
      Tool.getQueryString('lang', mockurl)
        .toLowerCase()
        .split(`-`)[0] === 'zh'
    ).toBeTruthy()
  })
})
