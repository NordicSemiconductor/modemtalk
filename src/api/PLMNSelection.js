const { arrayParseInt, EventCategory } = require('../utils')

const { filter } = require('mcc-mnc-list')

const PLMNStat = {
  0: 'unknown',
  1: 'available',
  2: 'current',
  3: 'forbidden'
}

const PLMNMode = {
  AUTOMATIC: 0,
  MANUAL: 1,
  SET_FORMAT: 3,
  0: 'automatic',
  1: 'manual',
  2: 'deregistered'
}

const PLMNFormat = {
  LONG_ALPHA: 0,
  SHORT_ALPHA: 1,
  NUMERIC: 2
}

const timeout = 60000
const expect = /\+COPS: ?(?:(\(.*?\),?)+|(([0-2])(?:,([0-2]),"([^"]*)")?))/

function convertResponse (resp) {
  const match = expect.exec(resp)
  if (!match) {
    return undefined
  }
  if (match[1]) {
    const result = {}
    const rx = /(\((\d),"([^"]*)","([^"]*)","([^"]*)"[^)]*\))+/g
    const operators = []
    for (;;) {
      const a = rx.exec(resp)
      if (a === null) break
      const [,, stat,,, mccmnc] = a
      const { operator } = (filter({ mccmnc })[0] || {})
      operators.push(operator)
      result[mccmnc] = {
        operator,
        stat: PLMNStat[stat]
      }
    }
    return {
      id: 'plmnSearch',
      result,
      message: `Available: ${operators.join(', ')}`,
      category: EventCategory.NETWORK
    }
  }
  if (match[2]) {
    const [mode, format] = arrayParseInt([match[3], match[4]])
    let mccmnc
    let operator
    if (format === 2) {
      ([,,,,, mccmnc] = match);
      ({ operator } = (filter({ mccmnc })[0] || {}))
    } else {
      ([,,,,, operator] = match)
    }
    const opmsg = operator ? `${operator} ` : ''
    return {
      id: 'plmn',
      selected: (mode < 2),
      mccmnc,
      operator,
      message: `${opmsg}[${PLMNMode[mode]}]`,
      category: EventCategory.NETWORK
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('+COPS', convertResponse)
  Object.assign(target.prototype, {
    PLMNMode,
    PLMNFormat,
    PLMNStat,
    setPLMNSelection (...args) {
      return this.writeAT(`+COPS=${args.join(',')}`, { timeout })
    },
    getPLMNSelection () {
      return this.writeAT('+COPS?', {
        timeout,
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    },
    testPLMNSelection () {
      return this.writeAT('+COPS=?', {
        timeout,
        expect,
        processor: lines => convertResponse(lines.pop())
      })
    }
  })
}
