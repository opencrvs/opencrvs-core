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

import { useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import {
  ActionDocument,
  ActionType,
  CertificateTemplateConfig,
  EventConfig,
  EventDocument,
  EventState,
  FieldType,
  getCurrentEventState,
  isMinioUrl,
  LanguageConfig,
  Location,
  PrintCertificateAction,
  UserOrSystem
} from '@opencrvs/commons/client'
import {
  addFontsToSvg,
  compileSvg,
  printAndDownloadPdf,
  svgToPdfTemplate
} from '@client/v2-events/features/events/actions/print-certificate/pdfUtils'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { getOfflineData } from '@client/offline/selectors'
import { useEventConfiguration } from '../features/events/useEventConfiguration'
import { hasStringFilename } from '../utils'

async function replaceMinioUrlWithBase64(
  declaration: EventState,
  config: EventConfig
) {
  // Clone to avoid mutating the original declaration
  const declarationClone = cloneDeep(declaration)

  const fileFieldIds = config.declaration.pages
    .flatMap((page) => page.fields)
    .filter((field) => field.type === FieldType.FILE)
    .map((field) => field.id)

  for (const fieldId of fileFieldIds) {
    const field = declarationClone[fieldId]

    if (hasStringFilename(field) && isMinioUrl(field.filename)) {
      // TypeScript now knows `field` has a `filename` property of type string
      field.filename = await fetchImageAsBase64(field.filename)
    }
  }

  return declarationClone
}

export const usePrintableCertificate = ({
  event,
  config,
  locations,
  users,
  certificateConfig,
  language
}: {
  event: EventDocument
  config: EventConfig
  locations: Location[]
  users: UserOrSystem[]
  certificateConfig?: CertificateTemplateConfig
  language?: LanguageConfig
}) => {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { config: appConfig } = useSelector(getOfflineData)
  const { declaration, ...metadata } = getCurrentEventState(
    event,
    eventConfiguration
  )

  /// We should take into account if template used was v1 version of the same certificate
  const normalizeId = (id?: string) => id?.replace(/^v2\./, '') ?? ''

  const copiesPrintedForTemplate = event.actions.filter(
    (action) =>
      action.type === ActionType.PRINT_CERTIFICATE &&
      normalizeId((action as PrintCertificateAction).content?.templateId) ===
        normalizeId(certificateConfig?.id)
  ).length

  const modifiedMetadata = {
    ...metadata,
    // Temporarily add `modifiedAt` to the last action's data to display
    // the current certification date in the certificate preview on the review page.
    modifiedAt: new Date().toISOString(),
    // Since 'modifiedDate' represents the last action's 'createdAt' date, and when
    // we actually print certificate, in this particular case, last action is PRINT_CERTIFICATE
    copiesPrintedForTemplate
  }

  if (!language || !certificateConfig?.svg) {
    return { svgCode: null }
  }

  const adminLevels = appConfig.ADMIN_STRUCTURE

  const certificateFonts = certificateConfig.fonts ?? {}

  const svgWithoutFonts = compileSvg({
    templateString: certificateConfig.svg,
    $metadata: modifiedMetadata,
    $declaration: declaration,
    $actions: event.actions as ActionDocument[],
    review: true,
    locations,
    users,
    language,
    config,
    adminLevels
  })

  const svgCode = addFontsToSvg(svgWithoutFonts, certificateFonts)

  /**
   * NOTE: We have separated the preparing and printing of the PDF certificate. Without the separation, user is already unassigned from the event and cache is cleared. We end up losing the images in the PDF unless we run actions in correct order.
   * 1. Prepare 2. Trigger print action 3. Open the PDF in a new window 4. Redirect user to workqueue.
   *
   * Prepares the PDF certificate by resolving image urls to base64 and compiles them into SVG template.
   * @returns function that opens a new window with the PDF certificate
   */
  const preparePdfCertificate = async (updatedEvent: EventDocument) => {
    const { declaration: updatedDeclaration, ...updatedMetadata } =
      getCurrentEventState(updatedEvent, eventConfiguration)
    const declarationWithResolvedImages = await replaceMinioUrlWithBase64(
      updatedDeclaration,
      config
    )

    const compiledSvg = compileSvg({
      templateString: certificateConfig.svg,
      $metadata: {
        ...updatedMetadata,
        // Temporarily add `modifiedAt` to the last action's data to display
        // the current certification date in the certificate preview on the review page.
        modifiedAt: new Date().toISOString(),
        copiesPrintedForTemplate
      },
      $declaration: declarationWithResolvedImages,
      $actions: event.actions as ActionDocument[],
      locations,
      review: false,
      users,
      language,
      config,
      adminLevels
    })

    const compiledSvgWithFonts = addFontsToSvg(compiledSvg, certificateFonts)
    const pdfTemplate = await svgToPdfTemplate(
      compiledSvgWithFonts,
      certificateFonts
    )

    return () => printAndDownloadPdf(pdfTemplate, event.id)
  }

  return {
    svgCode,
    preparePdfCertificate
  }
}
