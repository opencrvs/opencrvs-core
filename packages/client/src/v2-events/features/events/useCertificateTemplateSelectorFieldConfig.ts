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

import formatISO from 'date-fns/formatISO'
import {
  areCertificateConditionsMet,
  EventDocument,
  EventState,
  FieldConfig,
  FieldType
} from '@opencrvs/commons/client'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'

export const CERT_TEMPLATE_ID = 'certificateTemplateId'
export const useCertificateTemplateSelectorFieldConfig = (
  eventType: string,
  declaration: EventState,
  event: EventDocument
): FieldConfig => {
  const { certificateTemplates } = useAppConfig()

  const declarationWithEventMetadata = {
    $form: declaration,
    $event: event,
    $now: formatISO(new Date(), { representation: 'date' })
  }

  // Filter out certificates that are not for the event type and are not v2 templates
  const validTemplates = certificateTemplates.filter(
    (template) =>
      template.event === eventType &&
      template.isV2Template &&
      (!template.conditionals ||
        areCertificateConditionsMet(
          template.conditionals,
          declarationWithEventMetadata
        ))
  )

  const defaultValue = validTemplates.find((template) => template.isDefault)?.id

  const options = validTemplates.map((template) => ({
    label: template.label,
    value: template.id
  }))

  return {
    id: CERT_TEMPLATE_ID,
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type',
      description: 'This is the label for the field',
      id: 'event.default.action.certificate.template.type.label'
    },
    noOptionsMessage: {
      id: 'event.default.action.certificate.template.type.notFound',
      description: 'Select certificate template options not found',
      defaultMessage: 'No template available for this event, contact Admin'
    },
    defaultValue,
    options
  }
}
