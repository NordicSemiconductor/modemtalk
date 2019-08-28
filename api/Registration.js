const { rangeToArray, arrayParseInt, EventCategory } = require('../utils')

const Registration = {
  DISABLE: 0,
  ENABLE: 1,
  ENABLE_WITH_LOCATION: 2,
  ENABLE_WITH_LOCATION_AND_CAUSE: 3
}

// +CEREG: [<n>,]<stat>[,<tac>,<ci>,<AcT>[,<cause_type>,<reject_cause>]]
const expect = /\+C([EG])REG: (?:(\d+),)?(\d+)(?:,"([0-9A-F]{1,4})","([0-9A-F]{1,8})"(?:,(\d)(?:,([^,]*),(.*))?)?)?/

const Stat = {
  0: 'not registered',
  1: 'registered, home network',
  2: 'not registered, searching',
  3: 'registration denied',
  4: 'unknown',
  5: 'registered, roaming',
  8: 'emergency only',
  90: 'not registered due to UICC failure'
}

function convertResponse (resp) {
  const r = expect.exec(resp)
  if (r) {
    const [, d, n0, stat0, tac0, ci0, act0, causeType0, rejectCause0] = r
    const [n, stat, AcT, causeType, rejectCause] = arrayParseInt(
      [n0, stat0, act0, causeType0, rejectCause0], 10
    )
    const tac = parseInt(tac0, 16)
    const ci = parseInt(ci0, 16)
    const domain = { E: 'eps', G: 'gprs' }[d]
    return {
      id: 'registration',
      domain,
      n,
      stat,
      status: Stat[stat],
      tac,
      ci,
      AcT,
      causeType,
      rejectCause,
      category: EventCategory.NETWORK,
      message: `${domain.toUpperCase()} registration: ${Stat[stat]}`
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('+CEREG', convertResponse)
  Object.assign(target.prototype, {
    Registration,
    setEPSRegistration (n) {
      return this.writeAT(`+CEREG=${n}`)
        .catch(err => Promise.reject(new Error(`setEPSRegistration() failed: ${err.message}`)))
    },
    getEPSRegistration () {
      return this.writeAT('+CEREG?', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
        .catch(err => Promise.reject(new Error(`getEPSRegistration() failed: ${err.message}`)))
    },
    testEPSRegistration () {
      const testExpect = /\+CEREG: ?\( ?([^)]*)\)/
      return this.writeAT('+CEREG=?', {
        expect: testExpect,
        processor: lines => rangeToArray(testExpect.exec(lines.pop())[1])
      })
        .catch(err => Promise.reject(new Error(`testEPSRegistration() failed: ${err.message}`)))
    }
  })
}
