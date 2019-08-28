const { EventCategory } = require('../utils')

const expect = /%XSIM: ?([0,1]+)/

const UiccState = {
  0: 'UICC not initialized',
  1: 'UICC init OK'
}

function convertResponse (resp) {
  const uicc = parseInt(expect.exec(resp)[1], 10)
  return {
    id: 'uiccState',
    value: uicc,
    message: UiccState[uicc],
    category: EventCategory.EVENT
  }
}

module.exports = target => {
  target.prototype.registerConverter('%XSIM', convertResponse)

  Object.assign(target.prototype, {
    setSubscribeToUiccState (enable) {
      return this.writeAT(`%XSIM=${enable ? 1 : 0}`)
    },
    getUiccState () {
      return this.writeAT('%XSIM?', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    }
  })
}
