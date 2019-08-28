const { EventCategory } = require('../utils')

const Functionality = {
  POWER_OFF: 0,
  NORMAL: 1,
  OFFLINE_MODE: 4,
  DISABLE_ATTACH: 10,
  ENABLE_ATTACH: 11,
  OFFLINE_MODE_UICC: 44,
  0: 'Power off',
  1: 'Normal',
  4: 'Offline mode',
  44: 'Offline mode without shutting down UICC'
}

const expect = /\+CFUN: ?([0-9]+)/

function convertResponse (resp) {
  const match = expect.exec(resp)
  if (!match) {
    return undefined
  }
  const [, fun] = match
  if (!fun) {
    return undefined
  }
  return {
    id: 'functionality',
    value: parseInt(fun, 10),
    translated: Functionality[fun],
    message: `Modem functionality ${Functionality[fun]}`,
    category: EventCategory.EVENT
  }
}

module.exports = target => {
  target.prototype.registerConverter('+CFUN', convertResponse)

  Object.assign(target.prototype, {
    Functionality,
    setFunctionality (fun) {
      return this.writeAT(`+CFUN=${fun}`)
    },
    getFunctionality () {
      return this.writeAT('+CFUN?', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    }
  })
}
