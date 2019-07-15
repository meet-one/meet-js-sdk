/*
 * https://github.com/axios/axios
 * @Author: JohnTrump
 * @Date: 2019-06-23 16:12:52
 * @Last Modified by: JohnTrump
 * @Last Modified time: 2019-06-23 17:08:52
 */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

class Network {
  /**
   * @param config Axios参数(整个生命周期内有效)
   * @param isDebug 是否为调试模式,默认为false
   */
  constructor(config?: AxiosRequestConfig, isDebug?: boolean) {
    if (typeof config === 'object') {
      axios.defaults = Object.assign(axios.defaults, config)
    }
    // 请求拦截
    axios.interceptors.request.use(
      config => {
        isDebug ? console.debug(config) : null
        return config
      },
      error => {
        // Do something with request error
        return Promise.reject(error)
      }
    )
    // response interceptor
    axios.interceptors.response.use(
      (response: AxiosResponse) => {
        isDebug ? console.debug(response) : null
        return response
      },
      error => {
        return Promise.reject(error)
      }
    )
  }
  /**
   * HTTP GET Request
   * @param {string} url 请求地址
   * @param {object} [params] 请求参数
   * @param {AxiosRequestConfig} [AxiosRequestConfig] Axios配置
   */
  get(url: string, params?: object, AxiosRequestConfig?: AxiosRequestConfig): Promise<any> {
    AxiosRequestConfig = Object.assign({}, AxiosRequestConfig, { params })
    return axios.get(url, AxiosRequestConfig)
  }

  /**
   * HTTP POST Request
   * @param {string} url 请求地址
   * @param {object} [payload] 请求参数
   * @param {AxiosRequestConfig} [AxiosRequestConfig] Axios配置
   */
  post(url: string, payload?: object, AxiosRequestConfig?: AxiosRequestConfig): Promise<any> {
    return axios.post(url, payload, AxiosRequestConfig)
  }
}

export default Network
