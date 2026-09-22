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

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import QRCode from 'qrcode'
import {
  ActionDocument,
  ActionType,
  CertificateTemplateConfig,
  EventConfig,
  EventDocument,
  EventState,
  FieldType,
  getAcceptedActions,
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
  downloadAndEmbedImages,
  printAndDownloadPdf,
  svgToPdfTemplate
} from '@client/v2-events/features/events/actions/print-certificate/pdfUtils'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'
import { getOfflineData } from '@client/offline/selectors'
import { useEventConfiguration } from '../features/events/useEventConfiguration'
import { hasStringFilename } from '../utils'

/**
 * Builds the compact JSON payload embedded directly in the certificate's QR
 * code. The QR is fully self-contained (no server lookup needed).
 */
function buildQrPayload(
  eventType: string,
  metadata: {
    trackingId?: string
    legalStatuses?: {
      REGISTERED?: { registrationNumber?: string } | null
    }
  },
  declaration: EventState,
  childToPrint?: string
) {
  const isDeathEvent = eventType === 'death'
  const isAdoptionEvent = eventType === 'adoption'

  // Same dual-shape lookup used in resolveChildField / adoptionCertificateRegistrationNumber:
  // 'collector.childToPrint' may show up nested (declaration.collector.childToPrint)
  // or flat (annotation['collector.childToPrint']), depending on where in the
  // pipeline this is read from. Check both, fall back to child1.
  const selectedChild = isAdoptionEvent
    ? (childToPrint ??
      (declaration as any)?.collector?.childToPrint ??
      'child1')
    : undefined
  const namePrefix = isAdoptionEvent
    ? selectedChild
    : isDeathEvent
      ? 'deceased'
      : 'child'

  let name = declaration[`${namePrefix}.name`] as
    | { firstname?: string; middlename?: string; surname?: string }
    | undefined
  let dob = declaration[`${namePrefix}.dob`] as string | undefined

  // Legacy fallback for pre-multi-child adoption declarations that only
  // ever wrote to the unprefixed 'child.*' keys.
  if (isAdoptionEvent && (!name || !dob)) {
    name = name ?? (declaration['child.name'] as typeof name)
    dob = dob ?? (declaration['child.dob'] as string | undefined)
  }

  // Death certificates should surface the date of death, not the
  // deceased's date of birth. The date of death is captured under
  // 'eventDetails.date' in the death declaration.
  const dateLabel = isDeathEvent ? 'Date of Death' : 'Date of Birth'
  const dateValue = isDeathEvent
    ? (declaration['eventDetails.date'] as string | undefined)
    : dob
  const registrationNumberLabel = isDeathEvent ? 'DRN' : 'BRN'

  // Adoption's reg number is the selected child's own BRN from the linked
  // birth record — not metadata.legalStatuses, which isn't populated the
  // same way for adoption events.
  const registrationNumberValue = isAdoptionEvent
    ? ((declaration[`${namePrefix}.birthRegistrationNumber`] as
        | string
        | undefined) ??
      (declaration['child.birthRegistrationNumber'] as string | undefined) ??
      '')
    : (metadata.legalStatuses?.REGISTERED?.registrationNumber ?? '')

  const lines = [
    `Tracking Number: ${metadata.trackingId ?? ''}`,
    `${registrationNumberLabel}: ${registrationNumberValue}`,
    `Surname: ${name?.surname ?? ''}`,
    `First Name: ${name?.firstname ?? ''}`
  ]

  // Only show Other Names if it actually has a value — applies to
  // birth, death, and adoption certs alike
  if (name?.middlename) {
    lines.push(`Other Names: ${name.middlename}`)
  }

  lines.push(`${dateLabel}: ${dateValue ?? ''}`)

  return lines.join('\n')
}

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
  language,
  annotation // in-progress print-form answers (e.g. collector.childToPrint),
  // supplied by the review page before the PRINT_CERTIFICATE action is submitted.
}: {
  event: EventDocument
  config: EventConfig
  locations: Location[]
  users: UserOrSystem[]
  certificateConfig?: CertificateTemplateConfig
  language?: LanguageConfig
  annotation?: EventState
}) => {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const { config: appConfig } = useSelector(getOfflineData)
  const { declaration, ...metadata } = getCurrentEventState(
    event,
    eventConfiguration
  )
  const copiesPrintedForTemplate = event.actions.filter(
    (action) =>
      action.type === ActionType.PRINT_CERTIFICATE &&
      (action as PrintCertificateAction).content?.templateId ===
        certificateConfig?.id
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

  const [previewQrCode, setPreviewQrCode] = useState<string>()
  const [embeddedPreviewSvg, setEmbeddedPreviewSvg] = useState<string>()

  useEffect(() => {
    let cancelled = false

    if (!metadata.legalStatuses?.REGISTERED) {
      setPreviewQrCode(undefined)
      return
    }

    QRCode.toDataURL(
      buildQrPayload(
        event.type,
        metadata,
        declaration,
        annotation?.['collector.childToPrint'] as string | undefined
      ),
      {
        width: 200,
        margin: 1
      }
    )
      .then((dataUrl) => {
        if (!cancelled) {
          setPreviewQrCode(dataUrl)
        }
      })
      .catch(() => {
        // Non-fatal: certificate preview still renders without a QR code.
      })
    return () => {
      cancelled = true
    }
  }, [
    event.type,
    event.id,
    metadata.legalStatuses?.REGISTERED?.registrationNumber,
    annotation?.['collector.childToPrint'] // re-run when child selection changes
  ])

  const adminLevels = appConfig.ADMIN_STRUCTURE

  const certificateFonts = certificateConfig?.fonts ?? {}

  const svgCode =
    language && certificateConfig?.svg
      ? addFontsToSvg(
          compileSvg({
            templateString: certificateConfig.svg,
            $metadata: modifiedMetadata,
            $declaration: declaration,
            $actions: getAcceptedActions(event),
            review: true,
            locations,
            users,
            language,
            config,
            adminLevels,
            qrCode: previewQrCode
          }),
          certificateFonts
        )
      : null

  // Always call this hook, even when the certificate config is not ready yet.
  // This prevents React hook-order errors while the preview is loading.
  useEffect(() => {
    let cancelled = false

    if (!svgCode) {
      setEmbeddedPreviewSvg(undefined)
      return
    }

    void downloadAndEmbedImages(svgCode).then((embeddedSvg) => {
      if (!cancelled) setEmbeddedPreviewSvg(embeddedSvg)
    })

    return () => {
      cancelled = true
    }
  }, [svgCode])

  if (!svgCode || !language || !certificateConfig?.svg) {
    return { svgCode: null }
  }

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

    const lastPrintAction = updatedEvent.actions
      .filter((a) => a.type === ActionType.PRINT_CERTIFICATE)
      .at(-1) as PrintCertificateAction | undefined

    // Resolve MinIO file URLs to base64 before rendering the final PDF
    const declarationWithResolvedImages = await replaceMinioUrlWithBase64(
      updatedDeclaration,
      config
    )

    const qrCode = await QRCode.toDataURL(
      buildQrPayload(
        updatedEvent.type,
        updatedMetadata,
        declarationWithResolvedImages,
        lastPrintAction?.annotation?.['collector.childToPrint'] as
          | string
          | undefined
      ),
      { width: 200, margin: 1 }
    )

    const compiledSvg = compileSvg({
      templateString: certificateConfig.svg,
      qrCode,
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
    // Do not render the raw MinIO URLs while the fresh preview is being
    // fetched. This prevents a broken/stale image after a hard reload.
    svgCode: embeddedPreviewSvg ?? null,
    preparePdfCertificate
  }
}