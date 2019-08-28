/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

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
