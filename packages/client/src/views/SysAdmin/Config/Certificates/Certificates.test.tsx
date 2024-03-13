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
import {
  createTestComponent,
  flushPromises,
  getFileFromBase64String,
  loginAsFieldAgent
} from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { CertificatesConfig } from './Certificates'
import { waitForElement } from '@client/tests/wait-for-element'
import createFetchMock from 'vitest-fetch-mock'
import * as PDFUtils from '@client/views/PrintCertificate/PDFUtils'
import { certificateTemplateMutations } from '@client/certificate/mutations'
import { SpyInstance, vi } from 'vitest'
import * as pdfRender from '@client/pdfRenderer'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/Application/mutations'
const validImageB64String =
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
const fetch = createFetchMock(vi)
fetch.enableMocks()

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
  await flushPromises()
  testComponent.update()
}

describe('ConfigHome page when already has uploaded certificate template', async () => {
  const { store, history } = createStore()
  await loginAsFieldAgent(store)
  let testComponent: ReactWrapper
  const spy = vi.spyOn(pdfRender, 'printPDF').mockImplementation(() => {})

  beforeEach(async () => {
    vi.resetAllMocks()
    configApplicationMutations.mutateApplicationConfig = vi.fn(
      () =>
        new Promise((resolve) =>
          resolve({
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
    )
    const { store, history } = createStore()

    testComponent = await createTestComponent(
      <CertificatesConfig></CertificatesConfig>,
      { store, history }
    )
    testComponent.update()
  })

  afterEach(() => {
    spy.mockReset()
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

      // wait for mocked data to load mockedProvider
      await new Promise((resolve) => {
        setTimeout(resolve, 100)
      })

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
    let printCertificateSpy: SpyInstance
    let downloadFileSpy: SpyInstance
    let updateCertificateMutationSpy: SpyInstance
    beforeEach(() => {
      //Mocking with Response(blob) dosen't work
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          blob: () => new Blob(['data'])
        } as any)
      )
      printCertificateSpy = vi.spyOn(PDFUtils, 'printCertificate')
      downloadFileSpy = vi.spyOn(PDFUtils, 'downloadFile')
      updateCertificateMutationSpy = vi.spyOn(
        certificateTemplateMutations,
        'updateCertificateTemplate'
      )
    })
    afterAll(() => {
      fetch.resetMocks()
      printCertificateSpy.mockRestore()
      downloadFileSpy.mockRestore()
    })

    afterEach(() => {
      printCertificateSpy.mockClear()
      downloadFileSpy.mockClear()
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
      testComponent.find('#upload_document').hostNodes().simulate('click')
      testComponent
        .find('#image_file_uploader_field')
        .hostNodes()
        .simulate('change', {
          target: {
            files: [
              getFileFromBase64String(
                validImageB64String,
                'certificate.svg',
                'image/svg+xml'
              )
            ]
          }
        })

      await new Promise((resolve) => {
        setTimeout(resolve, 50)
      })

      testComponent.update()
      expect(
        testComponent.find('#apply_change').hostNodes().props().disabled
      ).toBeFalsy()

      testComponent.find('#apply_change').hostNodes().simulate('click')
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
      testComponent.find('#preview_close').hostNodes().simulate('click')
      testComponent.update()

      expect(
        testComponent.find('#preview_image_field').hostNodes()
      ).toHaveLength(0)
    })

    it('should call print certificate after clicking print', async () => {
      await clickOnMenuItem(testComponent, 'birth', MENU_ITEM.PRINT)
      testComponent.update()
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
