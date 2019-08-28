const { rangeToArray } = require('../utils')

const expect = /\+CSRA([AC]?): ?(?:(?:\d|\([^)]*\)),(?:\d|\([^)]*\)),(?:\d|\([^)]*\)),(?:\d|\([^)]*\)),(?:\d|\([^)]*\)),(\d|\([^)]*\)),(?:\d|\([^)]*\)))/

function convertResponse (line) {
  const match = expect.exec(line)
  if (match) {
    const key = { A: 'active', C: 'current' }[match[1]] || 'test'
    const eUtranFDD = (key === '') ? rangeToArray(match[2]) : !!(parseInt(match[2], 10) === 0)
    return {
      id: 'supportedRadioAccess',
      [key]: {
        eUtranFDD
      }
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter(['+CSRAA', '+CSRAC'], convertResponse)

  Object.assign(target.prototype, {
    setSupportedRadioAccess (eUtranFDD) {
      return this.writeAT(`+CSRA=0,0,0,0,0,${eUtranFDD ? 1 : 0},0`)
        .catch(err => Promise.reject(new Error(`setSupportedRadioAccess() failed: ${err.message}`)))
    },
    getSupportedRadioAccess () {
      return this.writeAT('+CSRA?', {
        expect,
        processor: lines => lines.map(line => convertResponse(line))
      })
        .catch(err => Promise.reject(new Error(`getSupportedRadioAccess() failed: ${err.message}`)))
    },
    testSupportedRadioAccess () {
      return this.writeAT('+CSRA=?', {
        expect,
        processor: lines => lines.map(line => convertResponse(line))
      })
        .catch(err => Promise.reject(new Error(`testSupportedRadioAccess() failed: ${err.message}`)))
    }
  })
}
