import meetwallet from '../src/index'

describe('Singleton', () => {
  const meetwallet_inner = require('../src/index').default
  test('require / import will expose only one entrance', () => {
    expect(meetwallet_inner === meetwallet).toBeTruthy()
  })
})

describe('index.ts', () => {
  test('init meetwallet', () => {
    expect(meetwallet.version === require('../package.json').version).toBeTruthy()
    expect(meetwallet.protocal === 'meetone://').toBeTruthy()
  })
})