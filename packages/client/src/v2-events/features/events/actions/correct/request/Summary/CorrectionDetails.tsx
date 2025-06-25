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
import * as React from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { isEqual } from 'lodash'

import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import {
  ActionType,
  EventDocument,
  EventState,
  getCurrentEventState,
  getDeclaration,
  isFieldVisible
} from '@opencrvs/commons/client'
import { ColumnContentAlignment } from '@opencrvs/components'
import { messages } from '@client/i18n/messages/views/correction'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'

const CorrectionSectionTitle = styled(Text)`
  margin: 20px 0;
`

export function CorrectionDetails({
  event,
  form,
  annotation
}: {
  event: EventDocument
  form: EventState
  annotation: EventState
}) {
  console.log('event', event)
  console.log('form', form)
  console.log('annotation', annotation)

  const intl = useIntl()
  const { eventConfiguration } = useEventConfiguration(event.type)

  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const previousFormValues = eventIndex.declaration
  const formConfig = getDeclaration(eventConfiguration)

  const correctionFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  return (
    <>
      {correctionFormPages.map((page) => {
        const pageFields = page.fields
          .filter((f) => isFieldVisible(f, { ...form, ...annotation }))
          .map((field) => {
            const valueDisplay = Output({
              field,
              value: annotation[field.id],
              showPreviouslyMissingValuesAsChanged: false
            })

            return { ...field, valueDisplay }
          })
          .filter((f) => f.valueDisplay)

        return (
          <Table
            key={`correction-form-table-${page.id}`}
            columns={[
              {
                label: intl.formatMessage(page.title),
                width: 34,
                alignment: ColumnContentAlignment.LEFT,
                key: 'firstColumn'
              },
              {
                label: '',
                width: 64,
                alignment: ColumnContentAlignment.LEFT,
                key: 'secondColumn'
              }
            ]}
            content={pageFields.map(({ valueDisplay, label }) => {
              if (label.defaultMessage) {
                return {
                  firstColumn: intl.formatMessage(label),
                  secondColumn: valueDisplay
                }
              }

              // If no label is defined for the field, we just show the value on the first column
              return { firstColumn: valueDisplay }
            })}
            hideTableBottomBorder={true}
          ></Table>
        )
      })}

      <CorrectionSectionTitle element="h3" variant="h3">
        {intl.formatMessage(messages.correctionSectionTitle)}
      </CorrectionSectionTitle>

      {formConfig.pages.map((page) => {
        const changedFields = page.fields
          .filter((f) => {
            const wasVisible = isFieldVisible(f, previousFormValues)
            const isVisible = isFieldVisible(f, form)
            const visibilityChanged = wasVisible !== isVisible
            const valueHasChanged = !isEqual(
              previousFormValues[f.id],
              form[f.id]
            )

            return isVisible && (valueHasChanged || visibilityChanged)
          })
          .map((f) => {
            const originalOutput = Output({
              field: f,
              value: previousFormValues[f.id],
              showPreviouslyMissingValuesAsChanged: false
            })

            const correctionOutput = Output({
              field: f,
              value: form[f.id],
              showPreviouslyMissingValuesAsChanged: false
            })

            return {
              fieldLabel: intl.formatMessage(f.label),
              original: originalOutput ?? '-',
              correction: correctionOutput ?? '-'
            }
          })

        if (changedFields.length === 0) {
          return
        }

        return (
          <Table
            key={`corrections-table-${page.id}`}
            columns={[
              {
                label: intl.formatMessage(page.title),
                width: 34,
                key: 'fieldLabel'
              },
              {
                label: intl.formatMessage(messages.correctionSummaryOriginal),
                width: 33,
                key: 'original'
              },
              {
                label: intl.formatMessage(messages.correctionSummaryCorrection),
                width: 33,
                key: 'correction'
              }
            ]}
            content={changedFields}
            hideTableBottomBorder={true}
            id={`corrections-table-${page.id}`}
          ></Table>
        )
      })}
    </>
  )
}
