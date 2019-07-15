import Network from '../../src/util/Network'

const BASE_URL = 'https://mainnet.meet.one'
describe('util/Network.ts', () => {
  it('HTTP GET', async () => {
    const http = new Network({ baseURL: BASE_URL }, false)
    // let response = await Network.get(`${BASE_URL}/v1/chain/get_info`)
    let response = await http.get(`/v1/chain/get_info`, {})
    expect(
      response.data.chain_id === 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
    ).toBeTruthy()
  })

  it('HTTP GET with Params', async () => {
    const http = new Network({ baseURL: 'https://www.ethte.com' })
    let response = await http.get('/rn/token', { id: 5 })
    expect(response.data.code === 0).toBeTruthy()
  })

  it('HTTP POST', async () => {
    const http = new Network({ baseURL: BASE_URL }, false)
    const ACCOUNT_NAME = 'johntrump123'
    let response = await http.post('/v1/chain/get_account', {
      account_name: ACCOUNT_NAME
    })
    expect(response.data.account_name === ACCOUNT_NAME).toBeTruthy()
  })
})
