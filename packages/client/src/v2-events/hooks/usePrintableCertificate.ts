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

import { ActionType } from '@opencrvs/commons/client'
import {
  addFontsToSvg,
  compileSvg,
  printAndDownloadPdf,
  svgToPdfTemplate
} from '@client/v2-events/features/events/actions/print-certificate/pdfUtils'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { getUserDetails } from '@client/profile/profileSelectors'

async function replaceMinioUrlWithBase64(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declaration: Record<string, any>,
  config: EventConfig
) {
  const fileFieldIds = config.declaration.pages
    .flatMap((page) => page.fields)
    .filter((field) => field.type === FieldType.FILE)
    .map((field) => field.id)

  for (const fieldId of fileFieldIds) {
    const fieldValue = declaration[fieldId]
    if (
      fieldValue &&
      typeof fieldValue === 'object' &&
      'filename' in fieldValue &&
      isMinioUrl(fieldValue.filename)
    ) {
      declaration[fieldId].filename = await fetchImageAsBase64(
        // this should be a presigned minio url
        fieldValue.filename
      )
    }
  }
  return declaration
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
  users: User[]
  certificateConfig?: CertificateTemplateConfig
  language?: LanguageConfig
}) => {
  const currentState = getCurrentEventState(event)
  const modifiedState = {
    ...currentState,
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
    $state: modifiedState,
    $declaration: currentState.declaration,
    locations,
    users,
    language
  })

  const svgCode = addFontsToSvg(svgWithoutFonts, certificateFonts)

  const handleCertify = async (updatedEvent: EventDocument) => {
    const currentEventState = getCurrentEventState(updatedEvent)
    const base64ReplacedTemplate = await replaceMinioUrlWithBase64(
      currentEventState.declaration,
      config
    )

    const base64ReplacedUsersWithSignature = await Promise.all(
      users.map(async (user) => {
        if (user.signatureUrl && isMinioUrl(user.signatureUrl)) {
          const base64Signature = await fetchImageAsBase64(user.signatureUrl)
          return {
            ...user,
            signatureUrl: base64Signature
          }
        }
        return user
      })
    )

    const compiledSvg = compileSvg({
      templateString: certificateConfig.svg,
      $state: currentEventState,
      $declaration: {
        ...base64ReplacedTemplate,
        preview: false
      },
      locations,
      users: base64ReplacedUsersWithSignature,
      language
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
