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
  getFileFromBase64String,
  mockConfigResponse
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { ApplicationConfig } from '@client/views/SysAdmin/Config/Application'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/mutations'
import * as fetchMock from 'jest-fetch-mock'
import { waitForElement } from '@client/tests/wait-for-element'
import { referenceApi } from '@client/utils/referenceApi'
import { IAttachmentValue } from '@client/forms'

const { store, history } = createStore()
const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock
export const validImageB64String =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
const file: IAttachmentValue = {
  name: 'img.png',
  type: 'image/png',
  data: `data:image;base64,${validImageB64String}`
}
let testComponent: ReactWrapper
beforeEach(async () => {
  configApplicationMutations.mutateApplicationConfig = jest.fn(
    () =>
      new Promise((resolve) =>
        resolve({
          data: {
            updateApplicationConfig: {
              APPLICATION_NAME: 'OPENCRVS',
              COUNTRY_LOGO: {
                fileName: 'img.png',
                file: `data:image;base64,${validImageB64String}`
              },
              CURRENCY: {
                isoCode: 'CAD',
                languagesAndCountry: ['en-CA']
              }
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
  it('should show the application name change modal of click on change', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    expect(testComponent.find('#changeAppNameModal').hostNodes()).toHaveLength(
      1
    )
  })
  it('should disable the button if input is empty', async () => {
    testComponent.find('#changeAppName').hostNodes().first().simulate('click')
    testComponent
      .find('#applicationName')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationName', value: '' }
      })
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

describe('country logo update test', () => {
  beforeEach(() => {
    jest.spyOn(referenceApi, 'loadConfig').mockImplementationOnce(() =>
      Promise.resolve({
        ...mockConfigResponse,
        config: {
          ...mockConfigResponse.config
        }
      })
    )
  })
  it('should show the country logo change modal of click on change', async () => {
    testComponent.find('#changeGovtLogo').hostNodes().first().simulate('click')
    expect(testComponent.find('#changeGovtLogoModal').hostNodes()).toHaveLength(
      1
    )
  })
  it('should disable the button if input file is empty', async () => {
    testComponent.find('#changeGovtLogo').hostNodes().first().simulate('click')
    testComponent
      .find('#upload_document')
      .hostNodes()
      .simulate('change', {
        target: {
          file: null
        }
      })
    expect(
      testComponent.find('#apply_change').hostNodes().props().disabled
    ).toBeTruthy()
  })
  it('should close the modal if click on cancel button', async () => {
    testComponent.find('#changeGovtLogo').hostNodes().first().simulate('click')
    testComponent.find('#modal_cancel').hostNodes().first().simulate('click')
    expect(testComponent.find('#changeGovtLogoModal').hostNodes()).toHaveLength(
      0
    )
  })
  it('No error while uploading valid file', async () => {
    testComponent.find('#changeGovtLogo').hostNodes().first().simulate('click')
    testComponent.find('#upload_document').hostNodes().simulate('click')
    testComponent
      .find('#image_file_uploader_field')
      .hostNodes()
      .simulate('change', {
        target: {
          files: [
            getFileFromBase64String(validImageB64String, 'img.png', 'image/png')
          ]
        }
      })
    testComponent.update()
    await flushPromises()
    expect(testComponent.find('#field-error').hostNodes().length).toBe(0)
  })
})
describe('application currency update test', () => {
  it('should show the application currency change modal of click on change', async () => {
    testComponent.find('#changeCurrency').hostNodes().first().simulate('click')
    expect(testComponent.find('#changeCurrencyModal').hostNodes()).toHaveLength(
      1
    )
  })
  it('should change the application currency if click on apply', async () => {
    testComponent.find('#changeCurrency').hostNodes().first().simulate('click')
    testComponent
      .find('#selectCurrency')
      .hostNodes()
      .simulate('change', {
        target: { id: 'selectCurrency', value: 'en-CA-CAD' }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    await flushPromises()
    expect(testComponent.find('#Currency_value').hostNodes().text()).toBe(
      'Canadian dollar'
    )
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#changeCurrency').hostNodes().first().simulate('click')
    testComponent
      .find('#selectCurrency')
      .hostNodes()
      .simulate('change', {
        target: { id: 'selectCurrency', value: 'en-CA-CAD' }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Currency updated')
  })
})
