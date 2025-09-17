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
  getCurrentEventState,
  isFieldVisible,
  PageTypes,
  getPrintCertificatePages
} from '@opencrvs/commons/client'
import { ColumnContentAlignment } from '@opencrvs/components'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useCertificateTemplateSelectorFieldConfig } from '@client/v2-events/features/events/useCertificateTemplateSelectorFieldConfig'
import { useAppConfig } from '@client/v2-events/hooks/useAppConfig'
import { useUserContext } from '@client/v2-events/hooks/useUserDetails'

const verifiedMessage = {
  id: 'v2.verified',
  defaultMessage: 'Verified',
  description: 'This is the label for the verification field'
}

export function PrintCertificate({
  event,
  action
}: {
  event: EventDocument
  action: PrintCertificateAction
}) {
  const { eventConfiguration } = useEventConfiguration(event.type)
  const formPages = getPrintCertificatePages(eventConfiguration)
  const intl = useIntl()
  const userContext = useUserContext()
  const eventIndex = getCurrentEventState(
    event,
    eventConfiguration,
    userContext
  )
  const annotation = deepMerge(eventIndex.declaration, action.annotation ?? {})
  const templateId = action.content?.templateId
  const { certificateTemplates } = useAppConfig()
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

  // A very similar kind of listing of "annotation" fields will be done on the correction summary and modal.
  // When we merge phase-3 branch here, we could try refactoring this to be a shared frontend module/function.
  const content = formPages.flatMap((page) => {
    const fields = page.fields
      .filter((f) => isFieldVisible(f, annotation, userContext))
      .map((field) => {
        const valueDisplay = Output({
          field,
          value: annotation[field.id],
          showPreviouslyMissingValuesAsChanged: false
        })

        return {
          label: intl.formatMessage(field.label),
          value: valueDisplay
        }
      })
      .filter((f) => f.value)

    if (page.type === PageTypes.enum.VERIFICATION) {
      const value = Output({
        field: {
          id: page.id,
          label: page.title,
          type: FieldType.CHECKBOX,
          defaultValue: false
        },
        value: annotation[page.id],
        showPreviouslyMissingValuesAsChanged: false
      })

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
