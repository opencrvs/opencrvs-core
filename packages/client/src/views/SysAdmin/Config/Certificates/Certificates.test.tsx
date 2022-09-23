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
import * as fetchMock from 'jest-fetch-mock'
import * as PDFUtils from '@client/views/PrintCertificate/PDFUtils'
import { certificateTemplateMutations } from '@client/certificate/mutations'

const fetch: fetchMock.FetchMock = fetchMock as fetchMock.FetchMock

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

  it('shows default birth certificate template text', () => {
    expect(
      testComponent.find('#birth_value').hostNodes().first().text()
    ).toContain('Default birth certificate template')
  })

  it('shows default death certificate template text', () => {
    expect(
      testComponent.find('#death_value').hostNodes().first().text()
    ).toContain('Default death certificate template')
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
    let printCertificateSpy: jest.SpyInstance
    let downloadFileSpy: jest.SpyInstance
    let updateCertificateMutationSpy: jest.SpyInstance

    beforeEach(() => {
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          blob: () => new Blob(['data'])
        })
      )
      printCertificateSpy = jest.spyOn(PDFUtils, 'printCertificate')
      downloadFileSpy = jest.spyOn(PDFUtils, 'downloadFile')
      updateCertificateMutationSpy = jest.spyOn(
        certificateTemplateMutations,
        'updateCertificateTemplate'
      )
    })
    afterAll(() => {
      fetch.resetMocks()
      printCertificateSpy.mockRestore()
      downloadFileSpy.mockRestore()
    })
    it('should show upload modal when clicked on upload', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.UPLOAD)

      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(1)
    })

    it('should call update certificate mutation on modal confirmation', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.UPLOAD)
      expect(
        testComponent.find('#withoutVerificationPrompt').hostNodes()
      ).toHaveLength(1)
      testComponent.find('#send').hostNodes().simulate('click')
      testComponent
        .find('#birth_file_uploader_field_undefined')
        .hostNodes()
        .first()
        .simulate('change', {
          target: {
            files: [new Blob(['<svg></svg>'], { type: 'image/svg+xml' })],
            id: 'birth_file_uploader_field_undefined'
          }
        })
      testComponent.update()
      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })
      expect(updateCertificateMutationSpy).toBeCalledTimes(1)
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
      testComponent.find('#preview_back').hostNodes().simulate('click')
      testComponent.update()

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })

    it('should call print certificate after clicking print', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.PRINT)
      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })
      expect(printCertificateSpy).toBeCalledTimes(1)
    })

    it('should download preview certificate', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.DOWNLOAD)
      await new Promise((resolve) => {
        setTimeout(resolve, 200)
      })
      expect(downloadFileSpy).toBeCalledTimes(1)
    })
  })
})
