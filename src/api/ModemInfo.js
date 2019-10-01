const {
  matchAnything: expect,
  lastLine: processor,
  EventCategory
} = require('../utils')

const SNRequest = {
  SerialNumber: 0,
  IMEI: 1,
  IMEI_and_SwVersion: 2,
  SwVersion: 3
}

const expectSnr = /\+CGSN: ?"(.*)"/

function convertResponse (resp) {
  const [, value] = expectSnr.exec(resp)
  if (value) {
    return {
      id: 'serialNumber',
      value,
      message: `SerialNumber ${value}`,
      category: EventCategory.EVENT
    }
  }
  return undefined
}

module.exports = target => {
  Object.assign(target.prototype, {
    SNRequest,
    getManufacturer () {
      return this.writeAT('+CGMI', { timeout: 5000, expect, processor })
    },
    getModel () {
      return this.writeAT('+CGMM', { timeout: 5000, expect, processor })
    },
    getRevision () {
      return this.writeAT('+CGMR', { timeout: 5000, expect, processor })
    },
    getSerialNumber (n) {
      if (typeof n === 'undefined') {
        return this.writeAT('+CGSN', { timeout: 20000, expect, processor })
      }
      return this.writeAT(`+CGSN=${n}`, {
        timeout: 20000,
        expect: expectSnr,
        processor: lines => convertResponse(lines.pop())
      })
    },
    getInternationalMobileSubscriber () {
      return this.writeAT('+CIMI', { timeout: 20000, expect, processor })
        .catch(err => Promise.reject(new Error(`getInternationalMobileSubscriber() failed: ${err.message}`)))
    }
  })
}
