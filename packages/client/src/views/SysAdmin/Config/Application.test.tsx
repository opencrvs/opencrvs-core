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
import {
  createTestComponent,
  flushPromises,
  mockConfigResponse
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { ApplicationConfig } from '@client/views/SysAdmin/Config/Application'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/mutations'
import * as fetchMock from 'jest-fetch-mock'
import { waitForElement } from '@client/tests/wait-for-element'
import { referenceApi } from '@client/utils/referenceApi'

export const mockFetchConfig = {
  config: {
    API_GATEWAY_URL: 'http://localhost:7070/',
    CONFIG_API_URL: 'http://localhost:2021',
    LOGIN_URL: 'http://localhost:3020',
    AUTH_URL: 'http://localhost:4040',
    RESOURCES_URL: 'http://localhost:3040',
    APPLICATION_NAME: 'OPENCRVS',
    CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 36500,
    CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 36500,
    CERTIFICATE_PRINT_LOWEST_CHARGE: 0,
    CERTIFICATE_PRINT_HIGHEST_CHARGE: 0,
    UI_POLLING_INTERVAL: 5000,
    FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
    APPLICATION_AUDIT_LOCATIONS: 'DISTRICT',
    INFORMANT_MINIMUM_AGE: 16,
    HIDE_EVENT_REGISTER_INFORMATION: false,
    EXTERNAL_VALIDATION_WORKQUEUE: false,
    PHONE_NUMBER_PATTERN: {
      pattern: '/^0(7|9)[0-9]{1}[0-9]{7}$/',
      example: '0970545855',
      start: '0[7|9]',
      num: '10',
      mask: {
        startForm: 4,
        endBefore: 2
      }
    },
    SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
    LOGROCKET: 'opencrvs-foundation/opencrvs-zambia',
    NID_NUMBER_PATTERN: '/^[0-9]{9}$/',
    COUNTRY: 'zmb',
    LANGUAGES: 'en'
  },
  certificates: [
    {
      _id: '620bdfb896974e7de5a91624',
      svgCode:
        "<svg width='420' height='595' viewBox='0 0 420 595' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <rect width='420' height='595' fill='white'/> <rect x='16.5' y='16.5' width='387' height='562' stroke='#DEE2E4'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='210' y='445.552'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='308.828' text-anchor='middle' >{eventDate}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='287.69' text-anchor='middle'>Was born on </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='345.69' text-anchor='middle'>Place of birth </tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='12' font-weight='500' letter-spacing='0px'> <tspan x='211' y='384.004'></tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='367.828' text-anchor='middle'>{placeOfBirth}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='245.828' text-anchor='middle'>{applicantName}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='224.69' text-anchor='middle'>This is to certify that </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='1px'> <tspan x='50%' y='145.828' text-anchor='middle'>{registrationNumber}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' letter-spacing='0px'> <tspan x='50%' y='127.828' text-anchor='middle'>Birth Registration No </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='170.104' text-anchor='middle'>Date of issuance of certificate:{certificateDate}</tspan> </text> <line x1='44.9985' y1='403.75' x2='377.999' y2='401.75' stroke='#CCCFD0' stroke-width='0.5'/> <line x1='44.9985' y1='189.75' x2='377.999' y2='187.75' stroke='#CCCFD0' stroke-width='0.5'/> <rect x='188' y='51' width='46.7463' height='54' fill='url(#pattern0)'/> <path d='M135.446 524.629H284.554' stroke='#F4F4F4' stroke-width='1.22857' stroke-linecap='square' stroke-linejoin='round'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='539.552' text-anchor='middle'>{registrarName}</tspan> <tspan x='50%' y='551.552' text-anchor='middle'>({role}) </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='209.587' y='562.336'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='429.552' text-anchor='middle'>This event was registered at{registrationLocation}</tspan> </text> <rect x='139' y='465' width='142.647' height='50' fill='url(#pattern1)'/> <defs> <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image0_43_3545' transform='translate(0 -0.000358256) scale(0.0005)'/> </pattern> <pattern id='pattern1' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image1_43_3545' transform='scale(0.000818331 0.00224215)'/> </pattern> <image id='image0_43_3545' width='2000' height='2312' xlink:href='{countryLogo}'/> <image id='image1_43_3545' width='1222' height='446' xlink:href='{registrarSignature}'/> </defs></svg>",
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Birth_v1.svg',
      user: 'jonathan.campbell',
      event: 'birth',
      status: 'ACTIVE',
      svgDateUpdated: 1643292458812,
      svgDateCreated: 1640696680593
    },
    {
      _id: '620bdfb896974e7de5a91625',
      svgCode:
        "<svg width='420' height='595' viewBox='0 0 420 595' fill='none' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'> <rect width='420' height='595' fill='white'/> <rect x='16.5' y='16.5' width='387' height='562' stroke='#DEE2E4'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='210' y='445.552'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='308.828' text-anchor='middle' >{eventDate}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='287.69' text-anchor='middle'>Died on </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='345.69' text-anchor='middle'>Place of death </tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='12' font-weight='500' letter-spacing='0px'> <tspan x='211' y='384.004'></tspan> </text> <text fill='#35495D' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='367.828' text-anchor='middle'>{placeOfDeath}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='0px'> <tspan x='50%' y='245.828' text-anchor='middle'>{applicantName}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='10' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='224.69' text-anchor='middle'>This is to certify that </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' font-weight='600' letter-spacing='1px'> <tspan x='50%' y='145.828' text-anchor='middle'>{registrationNumber}</tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='12' letter-spacing='0px'> <tspan x='50%' y='127.828' text-anchor='middle'>Death Registration No </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='170.104' text-anchor='middle'>Date of issuance of certificate:{certificateDate}</tspan> </text> <line x1='44.9985' y1='403.75' x2='377.999' y2='401.75' stroke='#CCCFD0' stroke-width='0.5'/> <line x1='44.9985' y1='189.75' x2='377.999' y2='187.75' stroke='#CCCFD0' stroke-width='0.5'/> <rect x='188' y='51' width='46.7463' height='54' fill='url(#pattern0)'/> <path d='M135.446 524.629H284.554' stroke='#F4F4F4' stroke-width='1.22857' stroke-linecap='square' stroke-linejoin='round'/> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='50%' y='539.552' text-anchor='middle'>{registrarName}</tspan> <tspan x='50%' y='551.552' text-anchor='middle'>({role}) </tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans Bengali' font-size='8' font-weight='300' letter-spacing='0px'> <tspan x='209.587' y='562.336'></tspan> </text> <text fill='#292F33' xml:space='preserve' style='white-space: pre' font-family='Noto Sans' font-size='8' letter-spacing='0px'> <tspan x='50%' y='429.552' text-anchor='middle'>This event was registered at{registrationLocation}</tspan> </text> <rect x='139' y='465' width='142.647' height='50' fill='url(#pattern1)'/> <defs> <pattern id='pattern0' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image0_43_3545' transform='translate(0 -0.000358256) scale(0.0005)'/> </pattern> <pattern id='pattern1' patternContentUnits='objectBoundingBox' width='1' height='1'> <use xlink:href='#image1_43_3545' transform='scale(0.000818331 0.00224215)'/> </pattern> <image id='image0_43_3545' width='2000' height='2312' xlink:href='{countryLogo}'/> <image id='image1_43_3545' width='1222' height='446' xlink:href='{registrarSignature}'/> </defs></svg>",
      svgFilename: 'oCRVS_DefaultZambia_SingleCharacterSet_Death_v1.svg',
      user: 'jonathan.campbell',
      event: 'death',
      status: 'ACTIVE',
      svgDateUpdated: 1643292520393,
      svgDateCreated: 1640696804785
    }
  ]
}

const { store, history } = createStore()
const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock
let testComponent: ReactWrapper
beforeEach(async () => {
  configApplicationMutations.updateApplicationName = jest.fn(
    () =>
      new Promise((resolve) =>
        resolve({
          data: {
            updateApplicationConfig: {
              APPLICATION_NAME: 'OPENCRVS'
            }
          }
        })
      )
  )
  testComponent = await createTestComponent(
    <ApplicationConfig></ApplicationConfig>,
    { store, history }
  )
  testComponent.update()
})

describe('application config page test', () => {
  it('should shows birth, and death tab button', async () => {
    expect(testComponent.find('#tab_general').hostNodes().text()).toBe(
      'General'
    )
    expect(testComponent.find('#tab_birth').hostNodes().text()).toBe('Birth')
    expect(testComponent.find('#tab_death').hostNodes().text()).toBe('Death')
  })
})

describe('application name update test', () => {
  beforeEach(() => {
    jest.spyOn(referenceApi, 'loadConfig').mockImplementationOnce(() =>
      Promise.resolve({
        ...mockConfigResponse,
        config: {
          ...mockConfigResponse.config,
          APPLICATION_NAME: 'OPENCRVS'
        }
      })
    )
  })
  it('should show the application name change modal of click on change', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    expect(testComponent.find('#changeAppNameModal').hostNodes()).toHaveLength(
      1
    )
  })
  it('should disable the button if input is empty', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    expect(testComponent.find('#applicationName').hostNodes().text()).toBe('')
    expect(
      testComponent.find('#apply_change').hostNodes().props().disabled
    ).toBeTruthy()
  })
  it('should enable the button if input any text', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    testComponent
      .find('#applicationName')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationName', value: 'OPENCRVS' }
      })
    expect(
      testComponent.find('#apply_change').hostNodes().props().disabled
    ).toBeFalsy()
  })
  it('should close the modal if click on cancel button', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    testComponent.find('#modal_cancel').hostNodes().first().simulate('click')
    expect(testComponent.find('#changeAppNameModal').hostNodes()).toHaveLength(
      0
    )
  })

  it('should change the application name if click on apply', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    testComponent
      .find('#applicationName')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationName', value: 'OPENCRVS' }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    await waitForElement(testComponent, '#changeAppName')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Name-of-application_value').hostNodes().text()
    ).toBe('OPENCRVS')
  })

  it('should show success notification if appliction name change', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    testComponent
      .find('#applicationName')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationName', value: 'OPENCRVS' }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    await waitForElement(testComponent, '#changeAppName')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Name of application updated')
  })
})
