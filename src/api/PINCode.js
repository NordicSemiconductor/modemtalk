const { EventCategory } = require('../utils')

const expect = /\+CPIN(R?): ?"?([A-Z ]+)"?(?:,([0-9]+))?/

const PINState = {
  READY: 'no PIN required',
  'SIM PIN': 'PIN code required',
  'SIM PUK': 'PUK code required',
  'SIM PIN2': 'PIN2 code required',
  'SIM PUK2': 'PUK2 code required'
}

function convertResponse (resp) {
  const r = expect.exec(resp)
  if (r) {
    const [, remaining, code, retries0] = r
    if (remaining) {
      const retries = parseInt(retries0, 10)
      return {
        id: 'pinRemaining',
        code,
        retries,
        message: `${code} remaining ${retries} retries`,
        category: EventCategory.EVENT
      }
    }
    return {
      id: 'pin',
      state: PINState[code],
      message: `${PINState[code] || code}`,
      category: EventCategory.EVENT
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter(['+CPIN', '+CPINR'], convertResponse)

  Object.assign(target.prototype, {
    enterPIN (pin, newpin) {
      const pin2 = (typeof newpin === 'undefined') ? '' : `,"${newpin}"`
      return this.writeAT(`+CPIN="${pin}"${pin2}`)
    },
    checkPIN () {
      return this.writeAT('+CPIN?', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    },
    getPINRetries () {
      return this.writeAT('+CPINR="SIM PIN"', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    }
  })
}
