/* global describe, it, expect, test */

const { ModemPort } = require('..')
const os = require('os')

describe('port', () => {
  if (os.type() !== 'Windows_NT') {
    test.only('skipped', () => {
      console.warn('skipping tests (OS is not Windows)')
    })
  }
  const port = new ModemPort('COM00')

  it('open', () => expect(port.open()).resolves.toBeUndefined())

  it('SupportedCommands', () => expect(
    port.testSupportedCommands()
      .then(() => port.getSupportedCommands())
  ).resolves.toEqual(expect.arrayContaining(['LIST', 'OF', 'TEST', 'COMMANDS'])))

  it('ErrorReporting', () => expect(
    port.testErrorReporting()
      .then(() => port.getErrorReporting())
      .then(() => port.setErrorReporting(port.ErrorReporting.VERBOSE))
  ).resolves.toBeUndefined())

  it('NetworkErrorReporting', () => expect(
    port.testNetworkErrorReporting()
      .then(() => port.getNetworkErrorReporting())
      .then(() => port.setNetworkErrorReporting(24))
      .catch(err => {
        expect(err.message).toEqual('testNetworkErrorReporting() failed: unknown')
        return []
      })
  ).resolves.toBeUndefined())

  it('Identification', () => expect(
    port.getManufacturer()
      .then(() => port.getModel())
      .then(() => port.getRevision())
      .then(() => port.getSerialNumber())
      .then(() => port.getInternationalMobileSubscriber()
        .catch(err => {
          expect(err.message).toEqual('getInternationalMobileSubscriber() failed: SIM NOT INSERTED')
          return []
        })
      )
  ).resolves.toEqual(expect.arrayContaining([])))

  it('PacketDomainEvents', () => expect(
    port.testPacketDomainEvents()
      .then(() => port.getPacketDomainEvents())
      .then(() => port.setPacketDomainEvents(port.PacketDomainEvents.DISCARD_THEN_FORWARD))
  ).resolves.toBeUndefined())

  it('Functionality', () => expect(
    port.getFunctionality()
      .then(() => port.setFunctionality(port.Functionality.NORMAL))
  ).resolves.toBeUndefined())

  it('PLMNSelection', () => expect(
    port.getPLMNSelection()
  ).resolves.toEqual(expect.arrayContaining([])))

  it('PDPContext', () => expect(
    port.getPDPContexts()
  ).resolves.toEqual(expect.arrayContaining([])))

  it('EPSRegistration', () => expect(
    port.testEPSRegistration()
      .then(() => port.setEPSRegistration(port.Registration.ENABLE_WITH_LOCATION))
      .then(() => port.getEPSRegistration())
  ).resolves.toMatchObject({
    id: 'registration'
  }))

  it('ExtendedSignalQuality', () => expect(
    port.testExtendedSignalQuality()
      .then(() => port.getExtendedSignalQuality())
  ).resolves.toMatchObject({
    id: 'extendedSignalQuality'
  }))

  it('close', () => {
    port.close()
  })
})
