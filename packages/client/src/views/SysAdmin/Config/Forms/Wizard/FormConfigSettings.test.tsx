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
import { createTestComponent, flushPromises } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/Application/mutations'
import { FormConfigSettings } from './FormConfigSettings'

const { store, history } = createStore()
let testComponent: ReactWrapper
beforeEach(async () => {
  configApplicationMutations.mutateApplicationConfig = jest.fn(
    () =>
      new Promise((resolve) =>
        resolve({
          data: {
            updateApplicationConfig: {
              HIDE_EVENT_REGISTER_INFORMATION: false,
              ADDRESSES: 1
            }
          }
        })
      )
  )

  testComponent = await createTestComponent(
    <FormConfigSettings></FormConfigSettings>,
    { store, history }
  )
  testComponent.update()
})

describe('Introduction page settings update test', () => {
  it('should show the introduction page settings change modal of click on change', async () => {
    testComponent
      .find('#introductionPageSettings')
      .hostNodes()
      .first()
      .simulate('click')
    expect(
      testComponent.find('#changeIntroductionPageModal').hostNodes()
    ).toHaveLength(1)
  })

  it('should close the modal if click on cancel button', async () => {
    testComponent
      .find('#introductionPageSettings')
      .hostNodes()
      .first()
      .simulate('click')
    testComponent.find('#cancel').hostNodes().first().simulate('click')
    expect(
      testComponent.find('#changeIntroductionPageModal').hostNodes()
    ).toHaveLength(0)
  })

  it('should change the HIDE_EVENT_REGISTER_INFORMATION if click on apply', async () => {
    testComponent
      .find('#introductionPageSettings')
      .hostNodes()
      .first()
      .simulate('click')
    await flushPromises()

    testComponent
      .find('#introductionPage')
      .hostNodes()
      .first()
      .simulate('change', {
        target: { id: 'checkbox', value: false }
      })
    testComponent.find('#apply').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#Introduction-page_value').hostNodes().first().text()
    ).toBe('Enabled')
  })

  it('should show success notification if appliction name change', async () => {
    testComponent
      .find('#introductionPageSettings')
      .hostNodes()
      .first()
      .simulate('click')
    await flushPromises()

    testComponent
      .find('#introductionPage')
      .hostNodes()
      .first()
      .simulate('change', {
        target: { id: 'checkbox', value: false }
      })
    testComponent.find('#apply').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#form-settings-notification').hostNodes().text()
    ).toBe('Introduction page has been Enabled')
  })
})

describe('Addresses settings update test', () => {
  it('should show the addresses settings change modal of click on change', async () => {
    testComponent
      .find('#addressesSettings')
      .hostNodes()
      .first()
      .simulate('click')
    expect(
      testComponent.find('#changeAddressesModal').hostNodes()
    ).toHaveLength(1)
  })

  it('should change the ADDRESSES if click on apply', async () => {
    testComponent
      .find('#addressesSettings')
      .hostNodes()
      .first()
      .simulate('click')
    await flushPromises()

    testComponent
      .find('#numberOfAddress')
      .hostNodes()
      .first()
      .simulate('change', {
        target: { id: 'numberOfAddresses_1', value: 1 }
      })
    testComponent.find('#apply').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#numberOfAddresses').hostNodes().first().text()
    ).toBe('1')
  })

  it('should show success notification if appliction name change', async () => {
    testComponent
      .find('#addressesSettings')
      .hostNodes()
      .first()
      .simulate('click')
    await flushPromises()

    testComponent
      .find('#numberOfAddress')
      .hostNodes()
      .first()
      .simulate('change', {
        target: { id: 'numberOfAddresses_1', value: 1 }
      })
    testComponent.find('#apply').hostNodes().simulate('click')
    testComponent.update()
    await flushPromises()
    expect(
      testComponent.find('#form-settings-notification').hostNodes().text()
    ).toBe('The number of address has been updated')
  })
})
