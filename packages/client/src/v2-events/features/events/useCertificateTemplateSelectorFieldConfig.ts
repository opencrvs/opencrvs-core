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

import {
  areConditionsMet,
  EventState,
  FieldConfig,
  FieldType
} from '@opencrvs/commons/client'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'

export const CERT_TEMPLATE_ID = 'certificateTemplateId'
export const useCertificateTemplateSelectorFieldConfig = (
  eventType: string,
  declation: EventState
): FieldConfig => {
  const { certificateTemplates } = useAppConfig()
  return {
    id: CERT_TEMPLATE_ID,
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type',
      description: 'This is the label for the field',
      id: 'v2.event.default.action.certificate.template.type.label'
    },
    defaultValue: certificateTemplates.find(
      (x) => x.event === eventType && x.isDefault
    )?.id,
    options: certificateTemplates
      .filter((x) => x.event === eventType)
      .filter((x) => {
        if (x.conditionals) {
          return areConditionsMet(x.conditionals, declation)
        }
        return true
      })
      .map((x) => ({ label: x.label, value: x.id }))
  }
}
