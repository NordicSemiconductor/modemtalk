const { EventCategory } = require('../utils')

const ModesOfOperation = {
  PS_MODE_2: 0,
  CS_PS_MODE_1: 1,
  CS_PS_MODE_2: 2,
  PS_MODE_1: 3,
  0: 'PS mode 2',
  1: 'CS/PS mode 1',
  2: 'CS/PS mode 2',
  3: 'PS mode 1'
}

const expect = /\+CEMODE: ?([0-3]+)/

function convertResponse (resp) {
  const mode = expect.exec(resp)[1]
  if (mode) {
    return {
      id: 'modeOfOperation',
      mode: parseInt(mode, 10),
      translated: ModesOfOperation[mode],
      message: `mode of operation: ${ModesOfOperation[mode]}`,
      category: EventCategory.EVENT
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('+CEMODE', convertResponse)

  Object.assign(target.prototype, {
    ModesOfOperation,
    setModeOfOperation (mode) {
      return this.writeAT(`+CEMODE=${mode}`)
        .catch(err => Promise.reject(new Error(`setModeOfOperation() failed: ${err.message}`)))
    },
    getModeOfOperation () {
      return this.writeAT('+CEMODE?', {
        expect,
        processor: lines => convertResponse(lines.pop())
      })
        .catch(err => Promise.reject(new Error(`getModeOfOperation() failed: ${err.message}`)))
    }
  })
}
