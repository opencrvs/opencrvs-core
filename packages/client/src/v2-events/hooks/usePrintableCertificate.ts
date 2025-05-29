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

import { Location } from '@events/service/locations/locations'
import {
  EventDocument,
  getCurrentEventState,
  isMinioUrl,
  User,
  CertificateTemplateConfig,
  LanguageConfig,
  EventConfig,
  FieldType
} from '@opencrvs/commons/client'
import {
  addFontsToSvg,
  compileSvg,
  printAndDownloadPdf,
  svgToPdfTemplate
} from '@client/v2-events/features/events/actions/print-certificate/pdfUtils'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'

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
  users: User[]
  certificateConfig?: CertificateTemplateConfig
  language?: LanguageConfig
}) => {
  const { declaration, ...metadata } = getCurrentEventState(event)
  const modifiedMetadata = {
    ...metadata,
    // Temporarily add `modifiedAt` to the last action's data to display
    // the current certification date in the certificate preview on the review page.
    modifiedAt: new Date().toISOString()
    // Since 'modifiedDate' represents the last action's 'createdAt' date, and when
    // we actually print certificate, in this particular case, last action is PRINT_CERTIFICATE
  }

  if (!language || !certificateConfig) {
    return { svgCode: null }
  }

  const certificateFonts = certificateConfig.fonts ?? {}
  const svgWithoutFonts = compileSvg({
    templateString: certificateConfig.svg,
    $metadata: modifiedMetadata,
    $declaration: declaration,
    locations,
    users,
    language,
    config
  })

  const svgCode = addFontsToSvg(svgWithoutFonts, certificateFonts)

  const handleCertify = (updatedEvent: EventDocument) => {
    const { declaration: updatedDeclaration, ...updatedMetadata } =
      getCurrentEventState(updatedEvent)

    const compiledSvg = compileSvg({
      templateString: certificateConfig.svg,
      $metadata: {
        ...updatedMetadata,
        // Temporarily add `modifiedAt` to the last action's data to display
        // the current certification date in the certificate preview on the review page.
        modifiedAt: new Date().toISOString()
      },
      $declaration: declaration,
      locations,
      users: users,
      language,
      config
    })

    const compiledSvgWithFonts = addFontsToSvg(compiledSvg, certificateFonts)
    const pdfTemplate = svgToPdfTemplate(compiledSvgWithFonts, certificateFonts)
    printAndDownloadPdf(pdfTemplate, event.id)
  }

  return {
    svgCode,
    handleCertify
  }
}
