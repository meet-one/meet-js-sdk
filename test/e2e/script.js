new VConsole()

/** 每个测试用例之间等待的时间 */
const WAIT_TIMES = 5000

/** 执行文案 */
const EXECUTING = 'Executing Test',
  SUCCESS = 'Success',
  FAILED = 'Failed'

/** 测试用例之间间隔 */
const waitSeconds = () => new Promise(resolve => setTimeout(resolve, WAIT_TIMES))

/** 测试所有用例 */
runAllTests = async e => {
  const buttons = document.getElementsByTagName('button')
  for (var i = 1; i < buttons.length; i++) {
    var button = buttons[i]
    if (button.dataset.skip === '1') {
      continue
    }
    button.click()
    await waitSeconds()
  }
  return
}

/** Flag Executing */
const executing = e => {
  resultsLabel = e.target
  resultsLabel.innerText = EXECUTING
}

/** Flag Success */
const success = e => {
  resultsLabel = e.target
  resultsLabel.className = 'success'
  resultsLabel.innerText = SUCCESS
}

/** Flag failed */
const failed = e => {
  resultsLabel = e.target
  resultsLabel.className = 'failed'
  resultsLabel.innerText = FAILED
}
