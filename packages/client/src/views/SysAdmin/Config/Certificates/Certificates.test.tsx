/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { createStore } from '@client/store'
import { createTestComponent, loginAsFieldAgent } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { CertificatesConfig } from './Certificates'
import { waitForElement } from '@client/tests/wait-for-element'
import * as PDFUtils from '@client/views/PrintCertificate/PDFUtils'
import { SpyInstance, vi } from 'vitest'
import * as pdfRender from '@client/pdfRenderer'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/Application/mutations'
import * as imageUtils from '@client/utils/imageUtils'

enum MENU_ITEM {
  PREVIEW,
  PRINT,
  DOWNLOAD,
  UPLOAD
}

async function clickOnMenuItem(
  testComponent: ReactWrapper,
  event: string,
  item: MENU_ITEM
) {
  await waitForElement(
    testComponent,
    `#template-${event}-action-menuToggleButton`
  )
  testComponent
    .find(`#template-${event}-action-menuToggleButton`)
    .hostNodes()
    .first()
    .simulate('click')
  testComponent.update()

  testComponent
    .find(`#template-birth-action-menuItem${item}`)
    .hostNodes()
    .simulate('click')
  testComponent.update()
}

describe('ConfigHome page when already has uploaded certificate template', async () => {
  const { store, history } = createStore()
  loginAsFieldAgent(store)

  let testComponent: ReactWrapper

  beforeAll(() => {
    vi.spyOn(imageUtils, 'fetchImageAsBase64').mockImplementation((_: string) =>
      Promise.resolve('')
    )

    vi.spyOn(
      configApplicationMutations,
      'mutateApplicationConfig'
    ).mockImplementation(() =>
      Promise.resolve({
        data: {
          updateApplicationConfig: {
            BIRTH: {
              PRINT_IN_ADVANCE: true
            },
            DEATH: {
              PRINT_IN_ADVANCE: true
            }
          }
        }
      })
    )
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  beforeEach(async () => {
    testComponent = await createTestComponent(
      <CertificatesConfig></CertificatesConfig>,
      { store, history }
    )
  })

  describe('certificate page test', () => {
    it('should show birth, death and marriage tab button', async () => {
      expect(testComponent.find('#tab_birth').hostNodes().text()).toBe('Births')
      expect(testComponent.find('#tab_death').hostNodes().text()).toBe('Deaths')
      expect(testComponent.find('#tab_marriage').hostNodes().text()).toBe(
        'Marriages'
      )
    })

    it('shows default birth certificate template text', () => {
      expect(
        testComponent.find('#birth_value').hostNodes().first().text()
      ).toContain('farajaland-birth-certificate-v3.svg')
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

    it('should toggle allow printing for birth', async () => {
      testComponent
        .find('#allow-printing-toggle')
        .hostNodes()
        .first()
        .simulate('change', { target: { checked: true } })

      testComponent.update()

      await waitForElement(testComponent, '#allow-printing-notification')

      expect(
        testComponent
          .find('#allow-printing-notification')
          .hostNodes()
          .first()
          .text()
      ).toBe('Allow printing in advance of issuance updated')
    })
  })

  describe('Testing sub menu item on config page', () => {
    let printPdfSpy: SpyInstance
    let downloadFileSpy: SpyInstance

    beforeAll(() => {
      printPdfSpy = vi.spyOn(pdfRender, 'printPDF').mockImplementation(() => {})

      downloadFileSpy = vi.spyOn(PDFUtils, 'downloadFile')
    })

    afterEach(() => {
      printPdfSpy.mockClear()
      downloadFileSpy.mockClear()
    })

    it('should show upload modal when clicked on upload', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.UPLOAD)
      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(1)
    })

    it('should render preview certificate template when clicked on preview', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.PREVIEW)

      await waitForElement(testComponent, '#preview_image_field')

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(1)
    })

    it('should go back from preview page if click on back arrow', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.PREVIEW)
      await waitForElement(testComponent, '#preview_image_field')
      testComponent.find('#preview_close').hostNodes().simulate('click')
      testComponent.update()

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })

    it('should call print certificate after clicking print', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.PRINT)
      testComponent.update()

      expect(printPdfSpy).toBeCalledTimes(1)
    })

    it('should download preview certificate', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.DOWNLOAD)
      expect(downloadFileSpy).toBeCalledTimes(1)
    })
  })
})
