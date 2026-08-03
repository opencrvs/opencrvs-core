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
import React from 'react'
import { useIntl } from 'react-intl'
import { Table } from '@opencrvs/components/lib/Table'
import {
  PrintCertificateAction,
  deepMerge,
  EventDocument,
  FieldType,
  PageTypes,
  getPrintCertificatePages,
  getCurrentEventState,
  isFieldDisplayedOnReview,
  ValidatorContext
} from '@opencrvs/commons/client'
import { ColumnContentAlignment } from '@opencrvs/components'
import { useEventConfigurationForEvent } from '@client/v2-events/features/events/useEventConfiguration'
import {
  isEmptyValue,
  Output
} from '@client/v2-events/features/events/components/Output'
import { useCertificateTemplateSelectorFieldConfig } from '@client/v2-events/features/events/useCertificateTemplateSelectorFieldConfig'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'
import { recordAnchorDate } from '@client/v2-events/utils'

const verifiedMessage = {
  id: 'verified',
  defaultMessage: 'Verified',
  description: 'This is the label for the verification field'
}

export function PrintCertificate({
  event,
  action,
  validatorContext
}: {
  event: EventDocument
  action: PrintCertificateAction
  validatorContext: ValidatorContext
}) {
  const { eventConfiguration } = useEventConfigurationForEvent(event)
  const formPages = getPrintCertificatePages(eventConfiguration)
  const intl = useIntl()

  const { certificateTemplates } = useAppConfig()
  const eventIndex = getCurrentEventState(event, eventConfiguration)
  // These are form values, so their locations resolve at the record's form
  // anchor (date of event, falling back to creation) — not the action date.
  const anchor = recordAnchorDate(eventIndex)
  const annotation = deepMerge(eventIndex.declaration, action.annotation ?? {})
  const templateId = action.content?.templateId
  const certTemplateFieldConfig = useCertificateTemplateSelectorFieldConfig(
    event.type,
    eventIndex.declaration,
    event
  )

  const templateLabel = certificateTemplates.find(
    (c) => c.id === templateId
  )?.label

  const templateSelectorField = {
    label: intl.formatMessage(certTemplateFieldConfig.label),
    value: templateLabel ? intl.formatMessage(templateLabel) : ''
  }

  const content = formPages.flatMap((page) => {
    const fields = page.fields
      .filter((f) => isFieldDisplayedOnReview(f, annotation, validatorContext))
      .filter((f) => !isEmptyValue(f, annotation[f.id]))
      .map((field) => {
        const valueDisplay = (
          <Output
            anchor={anchor}
            eventConfig={eventConfiguration}
            field={field}
            value={annotation[field.id]}
          />
        )

        return {
          label: intl.formatMessage(field.label),
          value: valueDisplay
        }
      })

    if (page.type === PageTypes.enum.VERIFICATION) {
      const value = (
        <Output
          anchor={anchor}
          eventConfig={eventConfiguration}
          field={{
            id: page.id,
            label: page.title,
            type: FieldType.CHECKBOX,
            defaultValue: false,
            required: true
          }}
          value={annotation[page.id]}
        />
      )

      return [{ label: intl.formatMessage(verifiedMessage), value }, ...fields]
    }
    return fields
  })

  return (
    <Table
      columns={[
        {
          width: 40,
          alignment: ColumnContentAlignment.LEFT,
          key: 'label'
        },
        {
          width: 60,
          alignment: ColumnContentAlignment.LEFT,
          key: 'value'
        }
      ]}
      content={[templateSelectorField, ...content]}
      hideTableHeader={true}
    />
  )
}
