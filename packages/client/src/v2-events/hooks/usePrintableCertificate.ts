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
  CertificateTemplateConfig,
  EventConfig,
  EventDocument,
  FieldType,
  getCurrentEventState,
  isMinioUrl,
  LanguageConfig,
  User
} from '@opencrvs/commons/client'
import {
  addFontsToSvg,
  compileSvg,
  printAndDownloadPdf,
  svgToPdfTemplate
} from '@client/v2-events/features/events/actions/print-certificate/pdfUtils'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { useEventConfiguration } from '../features/events/useEventConfiguration'
import { useEvents } from '../features/events/useEvents/useEvents'

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
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { declaration, ...metadata } = getCurrentEventState(
    event,
    eventConfiguration
  )
  const { getEvent } = useEvents()
  const actions = getEvent.useSuspenseQuery(event.id)[0].actions
  const copiesPrintedForTemplate =
    actions.filter(
      (action) =>
        action.type === 'PRINT_CERTIFICATE' &&
        'templateId' in action &&
        action.templateId === certificateConfig?.id
    ).length + 1 // +1 for the current print action

  const modifiedMetadata = {
    ...metadata,
    // Temporarily add `modifiedAt` to the last action's data to display
    // the current certification date in the certificate preview on the review page.
    modifiedAt: new Date().toISOString(),
    // Since 'modifiedDate' represents the last action's 'createdAt' date, and when
    // we actually print certificate, in this particular case, last action is PRINT_CERTIFICATE
    copiesPrintedForTemplate
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

  const handleCertify = async (updatedEvent: EventDocument) => {
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
        modifiedAt: new Date().toISOString()
      },
      $declaration: declarationWithResolvedImages,
      locations,
      users,
      language,
      config
    })

    const compiledSvgWithFonts = addFontsToSvg(compiledSvg, certificateFonts)
    const pdfTemplate = await svgToPdfTemplate(
      compiledSvgWithFonts,
      certificateFonts
    )

    printAndDownloadPdf(pdfTemplate, event.id)
  }

  return {
    svgCode,
    handleCertify
  }
}
