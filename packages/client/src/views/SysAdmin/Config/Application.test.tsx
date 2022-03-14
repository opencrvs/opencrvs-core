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

const { store, history } = createStore()
const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock
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
                fileName: mockConfigResponse.config.COUNTRY_LOGO.fileName,
                file: mockConfigResponse.config.COUNTRY_LOGO.file
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

describe('country logo update test', () => {
  beforeEach(() => {
    jest.spyOn(referenceApi, 'loadConfig').mockImplementationOnce(() =>
      Promise.resolve({
        ...mockConfigResponse,
        config: {
          ...mockConfigResponse.config,
          COUNTRY_LOGO: { fileName: 'logo.png', file: 'hhhjhkjhk' }
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
  it('should close the modal if click on cancel button', async () => {
    testComponent.find('#changeGovtLogo').hostNodes().first().simulate('click')
    testComponent.find('#modal_cancel').hostNodes().first().simulate('click')
    expect(testComponent.find('#changeGovtLogoModal').hostNodes()).toHaveLength(
      0
    )
  })
})
