const { EventCategory } = require('../utils')

const expect = /\+CIND: ?(?:"([^"]*)"),([0,1])/

function convertResponse (resp) {
  const match = expect.exec(resp)
  if (match) {
    const [, descriptor, value] = match
    const translation = {
      service: ['Not registered', 'Registered'],
      roam: ['Not roaming', 'Roaming'],
      message: [undefined, 'Message received']
    }
    const message = `${descriptor}: ${translation[descriptor][value]}`
    return {
      id: 'indicator',
      descriptor,
      value: parseInt(value, 10),
      message,
      category: EventCategory.EVENT
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('+CIND', convertResponse)

  Object.assign(target.prototype, {
    setIndicatorControl (service, roam, message) {
      return this.writeAT(`+CIND=${service ? 1 : 0},${roam ? 1 : 0},${message ? 1 : 0}`)
    }
  })
}
