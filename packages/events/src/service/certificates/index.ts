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

/**
 * Orchestrates server-side certificate rendering: fetch the record and its
 * configuration, compile the SVG template, and render it to a PDF buffer.
 *
 * This mirrors the client's `usePrintableCertificate` hook, minus the
 * browser-only concerns (Minio-url-to-base64 image resolution, print/download).
 */
import { TokenWithBearer } from '@opencrvs/commons'
import {
  ActionType,
  getAcceptedActions,
  getCurrentEventState,
  PrintCertificateAction
} from '@opencrvs/commons/events'
import { getEventById } from '@events/service/events/events'
import { getEventConfigurationById } from '@events/service/config/config'
import {
  fetchFontDictionary,
  fetchSvgTemplate,
  getCertificateConfigs,
  selectCertificateConfig
} from './certificateConfig'
import {
  compileSvg,
  renderPdfBuffer,
  svgToPdfDefinition
} from './renderCertificate'

/** Fallback font family used when a certificate config declares no fonts. */
const DEFAULT_FONT_FAMILY = 'notosans'

export async function renderEventCertificate({
  eventId,
  eventType,
  token,
  templateId,
  /**
   * `translation id -> message`, as the client passes via `language.messages`.
   * First cut defaults to empty: the `$intl` helpers then fall back to their
   * default message. Wire this to country-config `/content` for localized
   * certificate strings.
   */
  messages = {}
}: {
  eventId: string
  eventType: string
  token: TokenWithBearer
  templateId?: string
  messages?: Record<string, string>
}): Promise<Buffer> {
  const event = await getEventById(
    eventId as Parameters<typeof getEventById>[0]
  )
  const config = await getEventConfigurationById({ token, eventType })

  const { declaration, ...metadata } = getCurrentEventState(event, config)

  const certificateConfigs = await getCertificateConfigs(token)
  const certificateConfig = selectCertificateConfig(
    certificateConfigs,
    eventType,
    templateId
  )

  const copiesPrintedForTemplate = event.actions.filter(
    (action) =>
      action.type === ActionType.PRINT_CERTIFICATE &&
      (action as PrintCertificateAction).content?.templateId ===
        certificateConfig.id
  ).length

  const svgTemplate = await fetchSvgTemplate(certificateConfig, token)

  const compiledSvg = compileSvg({
    templateString: svgTemplate,
    $declaration: declaration,
    $metadata: {
      ...metadata,
      modifiedAt: new Date().toISOString(),
      copiesPrintedForTemplate
    },
    $actions: getAcceptedActions(event),
    messages,
    review: false
  })

  const fonts = await fetchFontDictionary(certificateConfig)
  const defaultFontFamily = Object.keys(fonts)[0] ?? DEFAULT_FONT_FAMILY

  const definition = await svgToPdfDefinition(compiledSvg, defaultFontFamily)
  return renderPdfBuffer(definition, fonts)
}
