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
  getFileFromBase64String
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { ApplicationConfig } from '@client/views/SysAdmin/Config/Application'
import { configApplicationMutations } from './mutations'
import { waitForElement } from '@client/tests/wait-for-element'

const { store, history } = createStore()
export const validImageB64String =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
let testComponent: ReactWrapper
beforeEach(async () => {
  configApplicationMutations.mutateApplicationConfig = jest.fn(
    () =>
      new Promise((resolve) =>
        resolve({
          data: {
            updateApplicationConfig: {
              APPLICATION_NAME: 'OPENCRVS',
              NID_NUMBER_PATTERN: '/^[0-9]{10}$/',
              PHONE_NUMBER_PATTERN: '/^[0-9]{8}$/',
              CURRENCY: {
                isoCode: 'CAD',
                languagesAndCountry: ['en-CA']
              },
              BIRTH: {
                REGISTRATION_TARGET: 10,
                LATE_REGISTRATION_TARGET: 30,
                FEE: {
                  ON_TIME: 5,
                  LATE: 10,
                  DELAYED: 15
                }
              },
              DEATH: {
                REGISTRATION_TARGET: 10,
                FEE: {
                  ON_TIME: 10,
                  DELAYED: 15
                }
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
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Name of application updated')
  })
})

describe('NID Pattern update test', () => {
  it('should show the application config change modal of click on change', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    expect(
      testComponent.find('#changeNidPatternModal').hostNodes()
    ).toHaveLength(1)
  })
  it('should disable the button if nidPattern is empty', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#changeNidPatternInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPattern', value: '' }
      })
    expect(
      testComponent.find('#apply_change').hostNodes().props().disabled
    ).toBeTruthy()
  })
  it('should disable the button if nidPattern is invalid', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#changeNidPatternInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPattern', value: '^as(po$' }
      })
    expect(
      testComponent.find('#apply_change').hostNodes().props().disabled
    ).toBeTruthy()
  })
  it('should close the modal if click on cancel button', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent.find('#modal_cancel').hostNodes().first().simulate('click')
    expect(
      testComponent.find('#changeNidPatternModal').hostNodes()
    ).toHaveLength(0)
  })
  it('should change the nid Pattern if click on apply', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#changeNidPatternInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPattern', value: '^[0-9]{10}$' }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    await waitForElement(testComponent, '#nidPattern_value_container_value')
    await flushPromises()
    testComponent.update()
    expect(
      testComponent.find('#nidPattern_value_container_value').hostNodes().text()
    ).toBe('/^[0-9]{10}$/')
  })
  it('should show success notification if appliction name change', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#changeNidPatternInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPattern', value: '^[0-9]{10}$' }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    await waitForElement(testComponent, '#changeAppName')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('NID Pattern of application updated')
  })
  it('should show valid message on valid example after clicking test example button', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#changeNidPatternInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPattern', value: '^[0-9]{10}$' }
      })
    await flushPromises()
    testComponent
      .find('#changeNidPatternExampleInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPatternExample', value: '3454345678' }
      })
    await flushPromises()
    testComponent
      .find('#test-changeNidPattern-example')
      .hostNodes()
      .first()
      .simulate('click')
    await flushPromises()
    expect(
      testComponent
        .find('#changeNidPattern-example-valid-message')
        .hostNodes()
        .text()
    ).toBe('Valid')
    expect(
      testComponent.find('#changeNidPattern-example-valid-icon')
    ).toHaveLength(1)
  })
  it('should show invalid message on invalid example after clicking test example button', async () => {
    testComponent
      .find('#changeNidPattern')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#changeNidPatternInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPattern', value: '^[0-9]{8}$' }
      })
    await flushPromises()
    testComponent
      .find('#changeNidPatternExampleInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changeNidPatternExample', value: '123123123' }
      })
    await flushPromises()
    testComponent
      .find('#test-changeNidPattern-example')
      .hostNodes()
      .first()
      .simulate('click')
    await flushPromises()

    expect(
      testComponent
        .find('#changeNidPattern-example-invalid-message')
        .hostNodes()
        .text()
    ).toBe('Invalid')
    expect(
      testComponent.find('#changeNidPattern-example-invalid-icon')
    ).toHaveLength(2)
  })
})

describe('Phone Number Pattern update test', () => {
  it('should show the application config change modal of click on change', async () => {
    testComponent.find('#changePhnNum').hostNodes().first().simulate('click')
    expect(testComponent.find('#changePhnNumModal').hostNodes()).toHaveLength(1)
  })
  it('should change the Phone Number Pattern if click on apply', async () => {
    testComponent.find('#changePhnNum').hostNodes().first().simulate('click')
    testComponent
      .find('#changePhnNumInput')
      .hostNodes()
      .simulate('change', {
        target: { id: 'changePhnNum', value: '^[0-9]{8}$' }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    await waitForElement(testComponent, '#phoneNumberPattern_value_container')
    await flushPromises()
    testComponent.update()
    expect(
      testComponent
        .find('#phoneNumberPattern_value_container_value')
        .hostNodes()
        .text()
    ).toBe('/^[0-9]{8}$/')
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

describe('application birth registration target test', () => {
  it('should show the application birth registration target change modal of click on change', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    expect(
      testComponent.find('#changeBirthRegTargetModal').hostNodes()
    ).toHaveLength(1)
  })

  it('should change the birth registration target days if click on apply', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthRegTarget')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthRegTarget', value: 10 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Legally-specified_value').hostNodes().text()
    ).toContain('10')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthRegTarget')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthRegTarget', value: 10 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Birth registration target days updated')
  })
})

describe('application birth late registration target test', () => {
  it('should show the application birth late registration target change modal of click on change', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthLateRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    expect(
      testComponent.find('#changeBirthLateRegTargetModal').hostNodes()
    ).toHaveLength(1)
  })

  it('should change the birth late registration target days if click on apply', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthLateRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthLateRegTarget')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthLateRegTarget', value: 30 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Late-registration_value').hostNodes().first().text()
    ).toContain('30')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthRegTarget')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthRegTarget', value: 30 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Birth registration target days updated')
  })
})

describe('application death registration target test', () => {
  it('should show the application death late registration target change modal of click on change', async () => {
    testComponent.find('#tab_death').hostNodes().first().simulate('click')
    testComponent
      .find('#changeDeathRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    expect(
      testComponent.find('#changeDeathRegTargetModal').hostNodes()
    ).toHaveLength(1)
  })

  it('should change the death registration target days if click on apply', async () => {
    testComponent.find('#tab_death').hostNodes().first().simulate('click')
    testComponent
      .find('#changeDeathRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationDeathRegTarget')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathRegTarget', value: 5 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Legally-specified_value').hostNodes().first().text()
    ).toContain('10')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_death').hostNodes().first().simulate('click')
    testComponent
      .find('#changeDeathRegTarget')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationDeathRegTarget')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathRegTarget', value: 5 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Death registration target days updated')
  })
})

describe('application birth registration fee test', () => {
  it('should change the birth registration on time fee if click on apply', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthOnTimeFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthOnTimeFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathRegTarget', value: 5 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent
        .find('#Within-legally-specified-time_value')
        .hostNodes()
        .first()
        .text()
    ).toContain('5')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthOnTimeFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthOnTimeFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathRegTarget', value: 5 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Birth on time fee updated')
  })

  it('should change the birth registration late fee if click on apply', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthLateFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthLateFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthLateFee', value: 10 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Late-registration_value').hostNodes().first().text()
    ).toContain('10')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthLateFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthLateFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthLateFee', value: 10 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Birth late fee updated')
  })

  it('should change the birth registration delayed fee if click on apply', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthDelayedFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthDelayedFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthDelayedFee', value: 15 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Delayed-registration_value').hostNodes().at(1).text()
    ).toContain('15')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_birth').hostNodes().first().simulate('click')
    testComponent
      .find('#changeBirthDelayedFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationBirthDelayedFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationBirthDelayedFee', value: 15 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Birth delayed fee updated')
  })
})

describe('application death registration fee test', () => {
  it('should change the death registration on time fee if click on apply', async () => {
    testComponent.find('#tab_death').hostNodes().first().simulate('click')
    testComponent
      .find('#changeDeathOnTimeFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationDeathOnTimeFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathOnTimeFee', value: 10 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Late-registration_value').hostNodes().first().text()
    ).toContain('10')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_death').hostNodes().first().simulate('click')
    testComponent
      .find('#changeDeathOnTimeFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationDeathOnTimeFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathOnTimeFee', value: 10 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Death on time fee updated')
  })

  it('should change the death registration delayed fee if click on apply', async () => {
    testComponent.find('#tab_death').hostNodes().first().simulate('click')
    testComponent
      .find('#changeDeathDelayedFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationDeathDelayedFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathDelayedFee', value: 15 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Delayed-registration_value').hostNodes().at(1).text()
    ).toContain('15')
  })

  it('should show success notification if appliction config change', async () => {
    testComponent.find('#tab_death').hostNodes().first().simulate('click')
    testComponent
      .find('#changeDeathDelayedFee')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent
      .find('#applicationDeathDelayedFee')
      .hostNodes()
      .simulate('change', {
        target: { id: 'applicationDeathDelayedFee', value: 15 }
      })
    testComponent.find('#apply_change').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#print-cert-notification').hostNodes().text()
    ).toBe('Death delayed fee updated')
  })
})

describe('country logo update test', () => {
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
