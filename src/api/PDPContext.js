const { rangeToArray, arrayParseInt, EventCategory } = require('../utils')

const expect = /\+CGDCONT: ?(\d+),"([^"]*)","([^"]*)","([^"]*)",([^,]*),(.*)/
const convertResponse = resp => {
  const r = expect.exec(resp)
  if (r) {
    const [, cid, pdpType, apn, pdpAddr, dComp, hComp] = r
    return {
      id: 'pdpContext',
      cid: parseInt(cid, 10),
      pdpType,
      apn,
      pdpAddr,
      dComp: parseInt(dComp, 10),
      hComp: parseInt(hComp, 10),
      message: `CID: ${cid}, APN: ${apn}, Addr: ${pdpAddr}`,
      category: EventCategory.PACKET_DOMAIN
    }
  }
  return undefined
}
const secondaryExpect = /\+CGDSCONT: ?(\d+),(\d+),(\d+),(\d+),(\d+)/
const convertSecondaryResponse = resp => {
  const r = expect.exec(resp)
  if (r) {
    const [, cid, pCid, dComp, hComp, imCmSignallingFlag] = r
    return {
      id: 'secondaryPDPContext',
      cid,
      pCid,
      dComp,
      hComp,
      imCmSignallingFlag
    }
  }
  return undefined
}

const expectPDPContextStates = /\+CGACT: ?(\d+),([0,1])/
const convertPDPContextStatesResponse = resp => {
  const r = expectPDPContextStates.exec(resp)
  if (r) {
    const [, cid, st] = arrayParseInt(r)
    const state = ['deactivated', 'activated'][st]
    return {
      id: 'pdpContextState',
      cid,
      state,
      message: `CID: ${cid}, State: ${state}`,
      category: EventCategory.PACKET_DOMAIN
    }
  }
  return undefined
}

module.exports = target => {
  target.prototype.registerConverter('+CGDCONT', convertResponse)
  target.prototype.registerConverter('+CGACT', convertPDPContextStatesResponse)

  Object.assign(target.prototype, {
    setPDPContext (cid, pdpType, apn, ipv4addrAlloc, nslpi, securePCO) {
      let cmd = `+CGDCONT=${cid}`
      if (pdpType) {
        cmd += `,${pdpType}`
        if (apn) {
          cmd += `,${apn}`
          if (ipv4addrAlloc) {
            cmd += `,,,,${ipv4addrAlloc}`
            if (nslpi) {
              cmd += `,,,,${nslpi}`
              if (securePCO) {
                cmd += `,${securePCO}`
              }
            }
          }
        }
      }
      return this.writeAT(cmd)
    },
    getPDPContexts () {
      return this.writeAT('+CGDCONT?', {
        timeout: 20000,
        expect,
        processor: lines => lines.map(line => convertResponse(line))
      })
    },

    setSecondaryPDPContext (cid, pCid) {
      return this.writeAT(`+CGDSCONT=${cid},${pCid}`)
    },
    getSecondaryPDPContext () {
      return this.writeAT('+CGDSCONT?', {
        expect: secondaryExpect,
        processor: lines => lines.map(line => convertSecondaryResponse(line))
      })
    },

    getPDPContextReadDynamicParameters (aCid) {
      const rdpExpect = /\+CGCONTRDP: ?(\d+),(\d+),"([^"]*)"(?:,"([^"]*)")?/
      return this.writeAT(`+CGCONTRDP${aCid !== undefined ? `=${aCid}` : ''}`, {
        expect: rdpExpect,
        processor: lines => {
          const r = expect.exec(lines.pop())
          const [, cid, bearerId, apn, localAddrAndMask] = r
          return {
            id: 'pdnConnectionDyanmicParameters',
            cid: parseInt(cid, 10),
            bearerId: parseInt(bearerId, 10),
            apn,
            localAddrAndMask
          }
        }
      })
        .catch(err => Promise.reject(new Error(`getPDPContextReadDynamicParameters() failed: ${err.message}`)))
    },
    testPDPContextReadDynamicParameters () {
      const testRdpExpect = /\+CGCONTRDP: ?([^)]*)/
      return this.writeAT('+CGCONTRDP=?', {
        expect: testRdpExpect,
        processor: lines => rangeToArray(expect.exec(lines.pop())[1])
      })
        .catch(err => Promise.reject(new Error(`testPDPContextReadDynamicParameters() failed: ${err.message}`)))
    },

    getPDPAddresses (aCid) {
      const addrExpect = /\+CGPADDR: ?(\d+)(?:,"([^"]*)"(?:,"([^"]*)")?)?/
      const param = (typeof aCid === 'undefined') ? '' : `=${aCid}`
      return this.writeAT(`+CGPADDR${param}`, {
        expect: addrExpect,
        processor: lines => lines.map(line => {
          const r = expect.exec(line)
          const [, cid, pdpAddr1, pdpAddr2] = r
          return {
            id: 'pdnAddresses',
            cid: parseInt(cid, 10),
            pdpAddr1,
            pdpAddr2
          }
        })
      })
        .catch(err => Promise.reject(new Error(`getPDPAddresses() failed: ${err.message}`)))
    },
    testPDPAddresses () {
      const testAddrExpect = /\+CGPADDR: ?([^)]*)/
      return this.writeAT('+CGPADDR=?', {
        expect: testAddrExpect,
        processor: lines => rangeToArray(expect.exec(lines.pop())[1])
      })
        .catch(err => Promise.reject(new Error(`testPDPAddresses() failed: ${err.message}`)))
    },

    setActivatePDPContext (cid, enable) {
      return this.writeAT(`+CGACT=${cid},${enable ? 1 : 0}`)
    },
    getPDPContextStates () {
      return this.writeAT('+CGACT?', {
        expect: expectPDPContextStates,
        processor: lines => lines.map(line => convertPDPContextStatesResponse(line))
      })
    }
  })
}
