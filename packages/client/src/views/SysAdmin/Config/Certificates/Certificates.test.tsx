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
import { CertificatesConfig } from './Certificates'
import { waitForElement } from '@client/tests/wait-for-element'

describe('ConfigHome page when already has uploaded certificate template', () => {
  const { store, history } = createStore()

  let testComponent: ReactWrapper
  beforeEach(async () => {
    testComponent = await createTestComponent(
      <CertificatesConfig history={history}></CertificatesConfig>,
      { store, history }
    )
    testComponent.update()
  })

  it('shows last birth certificate template updated date', async () => {
    expect(
      testComponent.find('#birth_value').hostNodes().first().text()
    ).toContain('Updated ')
  })

  it('shows last death certificate template updated date', async () => {
    expect(
      testComponent.find('#death_value').hostNodes().first().text()
    ).toContain('Updated ')
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

    it.skip('should preview certificate template when clicked on preview', async () => {
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
      await waitForElement(testComponent, '#preview_image_field')

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(1)
    })

    it.skip('should go back from preview page if click on back arrow', async () => {
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
      await flushPromises()
      testComponent.update()

      testComponent.find('#preview_back').hostNodes().simulate('click')
      testComponent.update()

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })
  })
})
