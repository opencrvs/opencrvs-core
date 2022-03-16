/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { CertificatesConfig } from './Certificates'
import { GET_ACTIVE_CERTIFICATES } from '@client/certificate/queries'
import { waitForElement } from '@client/tests/wait-for-element'

describe('ConfigHome page when already has uploaded certificate template', () => {
  const { store, history } = createStore()
  const graphqlMock = [
    {
      request: {
        query: GET_ACTIVE_CERTIFICATES
      },
      result: {
        data: {
          getActiveCertificatesSVG: [
            {
              event: 'birth',
              status: 'ACTIVE',
              svgCode:
                '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Was born on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of birth&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfBirth}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Birth Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
              svgDateCreated: '1640696680593',
              svgDateUpdated: '1644306710466',
              svgFilename: 'oCRVS_DefaultZambia_Birth_v1 (4).svg',
              user: '61d42359f1a2c25ea01beb4b',
              _id: '61cb0b68ab0cc2e187089786'
            },
            {
              event: 'death',
              status: 'ACTIVE',
              svgCode:
                '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Was born on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of birth&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfBirth}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Birth Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
              svgDateCreated: '1640696804785',
              svgDateUpdated: '1643885502999',
              svgFilename: 'oCRVS_DefaultZambia_Birth_v1.svg',
              user: '61d42359f1a2c25ea01beb4b',
              _id: '61cb0be4ab0cc2e187089787'
            }
          ]
        }
      }
    }
  ]

  let testComponent: ReactWrapper
  beforeEach(async () => {
    testComponent = await createTestComponent(
      <CertificatesConfig history={history}></CertificatesConfig>,
      { store, history, graphqlMocks: graphqlMock }
    )
    testComponent.update()
  })

  it('shows last birth certificate template updated date', async () => {
    expect(testComponent.find('#birth_value').hostNodes().text()).toBe(
      'Updated '
    )
  })

  it('shows last death certificate template updated date', async () => {
    expect(testComponent.find('#death_value').hostNodes().text()).toBe(
      'Updated '
    )
  })

  it('shows sub menu link when VerticalThreeDots is clicked', async () => {
    await waitForElement(
      testComponent,
      '#template-birth-action-menuToggleButton'
    )
    testComponent
      .find('#template-birth-action-menuToggleButton')
      .hostNodes()
      .first()
      .simulate('click')

    testComponent.update()
    expect(
      testComponent.find('#template-birth-action-menuItem0').hostNodes()
    ).toHaveLength(1)
  })

  describe('Testing sub menu item on config page', () => {
    it('should shows upload modal when clicked on upload', async () => {
      await waitForElement(
        testComponent,
        '#template-birth-action-menuToggleButton'
      )
      testComponent
        .find('#template-birth-action-menuToggleButton')
        .hostNodes()
        .first()
        .simulate('click')
      testComponent.update()

      testComponent
        .find('#template-birth-action-menuItem3')
        .hostNodes()
        .simulate('click')
      testComponent.update()

      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(1)
    })

    it('should preview certificate template when clicked on preview', async () => {
      await waitForElement(
        testComponent,
        '#template-birth-action-menuToggleButton'
      )
      testComponent
        .find('#template-birth-action-menuToggleButton')
        .hostNodes()
        .first()
        .simulate('click')
      testComponent.update()

      testComponent
        .find('#template-birth-action-menuItem0')
        .hostNodes()
        .simulate('click')
      testComponent.update()

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(1)
    })

    it('should go back from preview page if click on back arrow', async () => {
      await waitForElement(
        testComponent,
        '#template-birth-action-menuToggleButton'
      )
      testComponent
        .find('#template-birth-action-menuToggleButton')
        .hostNodes()
        .first()
        .simulate('click')
      testComponent.update()

      testComponent
        .find('#template-birth-action-menuItem0')
        .hostNodes()
        .simulate('click')
      testComponent.update()

      testComponent.find('#preview_back').hostNodes().simulate('click')
      testComponent.update()

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })
  })
})

describe('ConfigHome page when error occur during graphQL query', () => {
  const { store, history } = createStore()
  const graphqlMock = [
    {
      request: {
        query: GET_ACTIVE_CERTIFICATES,
        variables: {
          id: '460ce5e3-b495-4868-bb6a-1183ffd0fee1'
        }
      },
      result: {
        data: {
          getActiveCertificatesSVG: [
            {
              event: 'birth',
              status: 'ACTIVE',
              svgCode:
                '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Was born on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of birth&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfBirth}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Birth Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
              svgDateCreated: '1640696680593',
              svgDateUpdated: '1644306710466',
              svgFilename: 'oCRVS_DefaultZambia_Birth_v1 (4).svg',
              user: '61d42359f1a2c25ea01beb4b',
              _id: '61cb0b68ab0cc2e187089786'
            },
            {
              event: 'death',
              status: 'ACTIVE',
              svgCode:
                '<svg width="420" height="595" viewBox="0 0 420 595" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<rect width="420" height="595" fill="white"/>\n<rect x="16.5" y="16.5" width="387" height="562" stroke="#D7DCDE"/>\n<path d="M138.429 511.629H281.571" stroke="#F4F4F4" stroke-width="1.22857" stroke-linecap="square" stroke-linejoin="round"/>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="526.552" text-anchor="middle">{registrarName}&#x2028;</tspan><tspan x="50%" y="538.552" text-anchor="middle">({role}) &#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="549.336" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" font-weight="300" letter-spacing="0px"><tspan x="50%" y="445.552" text-anchor="middle">&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="429.552" text-anchor="middle">This event was registered at {registrationLocation}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="308.828" text-anchor="middle">{eventDate}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="287.69" text-anchor="middle">Was born on&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="345.69" text-anchor="middle">Place of birth&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="500" letter-spacing="0px"><tspan x="50%" y="384.004" text-anchor="middle">&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="367.828" text-anchor="middle">{placeOfBirth}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="0px"><tspan x="50%" y="245.828" text-anchor="middle">{informantName}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="10" font-weight="300" letter-spacing="0px"><tspan x="50%" y="224.69" text-anchor="middle">This is to certify that&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" font-weight="600" letter-spacing="1px"><tspan x="50%" y="145.828" text-anchor="middle">{registrationNumber}&#10;</tspan></text>\n<text fill="#35495D" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="12" letter-spacing="0px"><tspan x="50%" y="127.828" text-anchor="middle">Birth Registration No&#10;</tspan></text>\n<text fill="#292F33" xml:space="preserve" style="white-space: pre" font-family="Noto Sans" font-size="8" letter-spacing="0px"><tspan x="50%" y="170.104" text-anchor="middle">Date of issuance of certificate:  {certificateDate}</tspan></text>\n<line x1="44.9985" y1="403.75" x2="377.999" y2="401.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<line x1="44.9985" y1="189.75" x2="377.999" y2="187.75" stroke="#D7DCDE" stroke-width="0.5"/>\n<rect x="188" y="51" width="46.7463" height="54" fill="url(#pattern0)"/>\n<defs>\n<pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">\n<use xlink:href="#image0_43_3545" transform="translate(0 -0.000358256) scale(0.0005)"/>\n</pattern>\n<image id="image0_43_3545" width="2000" height="2312" xlink:href="{countryLogo}"/>\n</defs>\n</svg>\n',
              svgDateCreated: '1640696804785',
              svgDateUpdated: '1643885502999',
              svgFilename: 'oCRVS_DefaultZambia_Birth_v1.svg',
              user: '61d42359f1a2c25ea01beb4b',
              _id: '61cb0be4ab0cc2e187089787'
            }
          ]
        }
      }
    }
  ]

  let testComponent: ReactWrapper
  it('should shows error', async () => {
    const { store, history } = createStore()
    testComponent = await createTestComponent(
      <CertificatesConfig history={history}></CertificatesConfig>,
      { store, history, graphqlMocks: graphqlMock }
    )
    testComponent.update()
    expect(testComponent.find('#user_loading_error').hostNodes().text()).toBe(
      'An error occurred while loading system users'
    )
  })
})
