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
import {
  ActionDocument,
  ActionType,
  CertificateTemplateConfig,
  EventConfig,
  EventDocument,
  EventState,
  FieldType,
  getCurrentEventState,
  getUUID,
  isMinioUrl,
  LanguageConfig,
  Location,
  PrintCertificateAction,
  UUID,
  UserOrSystem
} from '@opencrvs/commons/client'
import {
  addFontsToSvg,
  compileSvg,
  printAndDownloadPdf,
  svgToPdfTemplate
} from '@client/v2-events/features/events/actions/print-certificate/pdfUtils'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getOfflineData } from '@client/offline/selectors'
import { useEventConfiguration } from '../features/events/useEventConfiguration'
import { useEvents } from '../features/events/useEvents/useEvents'
import { useDrafts } from '../features/drafts/useDrafts'
import { getEventDrafts } from '../features/events/components/Action/utils'

async function replaceMinioUrlWithBase64(
  declaration: Record<string, unknown>,
  config: EventConfig
) {
  // Clone to avoid mutating the original declaration
  const declarationClone: Record<string, unknown> = JSON.parse(
    JSON.stringify(declaration)
  )

  const fileFieldIds = config.declaration.pages
    .flatMap((page) => page.fields)
    .filter((field) => field.type === FieldType.FILE)
    .map((field) => field.id)

  for (const fieldId of fileFieldIds) {
    const field = declarationClone[fieldId]

    if (
      field &&
      typeof field === 'object' &&
      'filename' in field &&
      typeof field.filename === 'string' &&
      isMinioUrl(field.filename)
    ) {
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
  const { declaration, ...metadata } = getCurrentEventState(
    event,
    eventConfiguration
  )
  const { getEvent } = useEvents()
  const userDetails = useSelector(getUserDetails)
  const { config: appConfig } = useSelector(getOfflineData)

  const adminLevels = appConfig.ADMIN_STRUCTURE

  const actions = getEvent.getFromCache(event.id).actions
  if (!userDetails) {
    throw new Error('User details are not available')
  }

  const userFromUsersList = users.find((user) => user.id === userDetails.id)
  if (!userFromUsersList) {
    throw new Error(`User with id ${userDetails.id} not found in users list`)
  }

  const actionsWithAnOptimisticPrintAction = actions.concat({
    type: ActionType.PRINT_CERTIFICATE,
    id: getUUID(),
    transactionId: getUUID(),
    createdByUserType: 'user',
    createdAt: new Date().toISOString(),
    createdBy: userFromUsersList.id,
    createdByRole: userFromUsersList.role,
    status: 'Accepted',
    declaration: {},
    annotation: null,
    originalActionId: null,
    createdBySignature: userFromUsersList.signature,
    createdAtLocation: userDetails.primaryOffice.id as UUID,
    content: {
      templateId: certificateConfig?.id
    }
  } satisfies PrintCertificateAction)

  const copiesPrintedForTemplate = actionsWithAnOptimisticPrintAction.filter(
    (action) =>
      action.type === ActionType.PRINT_CERTIFICATE &&
      (action as PrintCertificateAction).content?.templateId ===
        certificateConfig?.id
  ).length

  // Offline flow
  const { getLocalDraftOrDefault, getRemoteDraftByEventId } = useDrafts()
  const remoteDraft = getRemoteDraftByEventId(event.id)
  const eventDrafts = remoteDraft
    ? getEventDrafts(event.id, getLocalDraftOrDefault(remoteDraft), [
        remoteDraft
      ])
    : []
  const localDeclaration = eventDrafts[0]?.action?.declaration as
    | EventState
    | undefined

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

  const certificateFonts = certificateConfig.fonts ?? {}
  const isEmptyDeclaration = Object.keys(declaration).length === 0
  const declarationToUse = isEmptyDeclaration
    ? (localDeclaration ?? declaration)
    : declaration

  const svgWithoutFonts = compileSvg({
    templateString: certificateConfig.svg,
    $metadata: modifiedMetadata,
    $declaration: declarationToUse,
    $actions: actionsWithAnOptimisticPrintAction as ActionDocument[],
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
    // Same fallback logic used for preview: if server-side declaration is empty,
    // use the local draft (declarationToUse)
    const updatedDeclarationToUse =
      Object.keys(updatedDeclaration).length === 0
        ? declarationToUse
        : updatedDeclaration

    const declarationWithResolvedImages = (await replaceMinioUrlWithBase64(
      updatedDeclarationToUse,
      config
    )) as EventState

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
      $actions: actionsWithAnOptimisticPrintAction as ActionDocument[],
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
