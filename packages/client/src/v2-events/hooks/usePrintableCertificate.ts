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
  FieldType,
  findActiveDrafts
} from '@opencrvs/commons/client'
import { EventState } from '@opencrvs/commons/client'
import {
  addFontsToSvg,
  compileSvg,
  printAndDownloadPdf,
  svgToPdfTemplate
} from '@client/v2-events/features/events/actions/print-certificate/pdfUtils'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { useEventConfiguration } from '../features/events/useEventConfiguration'
import { useDrafts } from '../features/drafts/useDrafts'
import { getEventDrafts } from '../features/events/components/Action/utils'

async function replaceMinioUrlWithBase64(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declaration: Record<string, any>,
  config: EventConfig
) {
  // Why a cloned copy? to avoid mutating the original declaration
  const declarationClone: Record<string, any> = JSON.parse(
    JSON.stringify(declaration)
  )

  const fileFieldIds = config.declaration.pages
    .flatMap((page) => page.fields)
    .filter((field) => field.type === FieldType.FILE)
    .map((field) => field.id)

  for (const fieldId of fileFieldIds) {
    const fieldValue = declarationClone[fieldId]
    if (
      fieldValue &&
      typeof fieldValue === 'object' &&
      'filename' in fieldValue &&
      isMinioUrl(fieldValue.filename)
    ) {
      declarationClone[fieldId].filename = await fetchImageAsBase64(
        // this should be a presigned minio url
        fieldValue.filename
      )
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
  users: User[]
  certificateConfig?: CertificateTemplateConfig
  language?: LanguageConfig
}) => {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { declaration, ...metadata } = getCurrentEventState(
    event,
    eventConfiguration
  )

  // Offline flow
  const { getLocalDraftOrDefault, getRemoteDrafts } = useDrafts()
  const drafts = getRemoteDrafts(event.id)
  const activeDraft = findActiveDrafts(event, drafts)[0]
  const localDraft = getLocalDraftOrDefault(activeDraft)

  const eventDrafts = getEventDrafts(event.id, localDraft, drafts)
  const localDeclaration = eventDrafts[0]?.action?.declaration as
    | EventState
    | undefined

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
  const isEmptyDeclaration = Object.keys(declaration).length === 0
  const declarationToUse: EventState = isEmptyDeclaration
    ? ((localDeclaration ?? declaration) as EventState)
    : declaration

  const svgWithoutFonts = compileSvg({
    templateString: certificateConfig.svg,
    $metadata: modifiedMetadata,
    $declaration: declarationToUse,
    locations,
    users,
    language,
    config
  })

  const svgCode = addFontsToSvg(svgWithoutFonts, certificateFonts)

  const handleCertify = async (updatedEvent: EventDocument) => {
    const { declaration: updatedDeclaration, ...updatedMetadata } =
      getCurrentEventState(updatedEvent, eventConfiguration)
    // Same fallback logic used for preview: if server-side declaration is empty,
    // use the local draft (declarationToUse)
    const updatedDeclarationToUse =
      Object.keys(updatedDeclaration).length === 0
        ? declarationToUse
        : updatedDeclaration

    const declarationWithResolvedImages = await replaceMinioUrlWithBase64(
      updatedDeclarationToUse,
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
