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
import { useNavigate } from 'react-router-dom'
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
import { ColumnContentAlignment, Link } from '@opencrvs/components'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { messages } from '@client/i18n/messages/views/correction'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'
import { ROUTES } from '@client/v2-events/routes'
import { hasFieldChanged } from '../../utils'

const CorrectionSectionTitle = styled(Text)`
  margin: 20px 0;
`

const Label = styled.label`
  margin: 0;
  padding: 0;
  ${({ theme }) => theme.fonts.bold14}
`

const TableHeader = styled.th`
  text-transform: uppercase;
  ${({ theme }) => theme.fonts.bold12}
  display: inline-block;
`

/*
 * Correction details component which is used both on the correction request summary page,
 * and the event audit history dialog/modal for 'Request correction' actions.
 *
 * This component displays a table with the correction 'annotation' details, and then
 * a table with the corrected fields.
 */
export function CorrectionDetails({
  event,
  form,
  annotation,
  requesting,
  editable = false,
  workqueue
}: {
  event: EventDocument
  form: EventState
  annotation: EventState
  requesting: boolean
  editable?: boolean
  workqueue?: string
}) {
  const intl = useIntl()
  const { eventConfiguration } = useEventConfiguration(event.type)

  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const previousFormValues = requesting ? eventIndex.declaration : annotation
  const formConfig = getDeclaration(eventConfiguration)
  const navigate = useNavigate()

  const correctionFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  const correctionDetails = correctionFormPages.flatMap((page) => {
    const pageFields = page.fields
      .filter((f) => isFieldVisible(f, { ...form, ...annotation }))
      .map((field) => {
        const valueDisplay = Output({
          field,
          value: annotation[field.id],
          showPreviouslyMissingValuesAsChanged: false
        })

        return { ...field, valueDisplay, pageId: page.id }
      })
      .filter((f) => f.valueDisplay)

    return pageFields
  })

  return (
    <>
      <Table
        key={'correction-form-table'}
        columns={[
          {
            width: 34,
            alignment: ColumnContentAlignment.LEFT,
            key: 'firstColumn'
          },
          {
            width: editable ? 52 : 64,
            alignment: ColumnContentAlignment.LEFT,
            key: 'secondColumn'
          },
          ...(editable
            ? [
                {
                  width: 12,
                  key: 'change',
                  alignment: ColumnContentAlignment.RIGHT
                }
              ]
            : [])
        ]}
        content={correctionDetails.map(
          ({ valueDisplay, label, pageId, id }) => ({
            firstColumn: <Label>{intl.formatMessage(label)}</Label>,
            secondColumn: valueDisplay,
            change: (
              <Link
                data-testid={`change-${id}`}
                font="reg14"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(
                    ROUTES.V2.EVENTS.CORRECTION.ONBOARDING.buildPath(
                      {
                        pageId,
                        eventId: event.id
                      },
                      { workqueue },
                      id ? makeFormFieldIdFormikCompatible(id) : undefined
                    )
                  )
                }}
              >
                {intl.formatMessage(messages.change)}
              </Link>
            )
          })
        )}
        hideTableBottomBorder={true}
        hideTableHeader={true}
        noPagination={true}
      ></Table>

      <CorrectionSectionTitle element="h3" variant="h3">
        {requesting
          ? intl.formatMessage(messages.correctionSectionTitle)
          : intl.formatMessage(messages.makeCorrectionSectionTitle)}
      </CorrectionSectionTitle>

      {formConfig.pages.map((page) => {
        const changedFields = page.fields
          .filter((f) => hasFieldChanged(f, form, previousFormValues))
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
                label: (
                  <TableHeader>{intl.formatMessage(page.title)}</TableHeader>
                ),
                width: 34,
                key: 'fieldLabel'
              },
              {
                label: (
                  <TableHeader>
                    {intl.formatMessage(messages.correctionSummaryOriginal)}
                  </TableHeader>
                ),
                width: 33,
                key: 'original'
              },
              {
                label: (
                  <TableHeader>
                    {intl.formatMessage(messages.correctionSummaryCorrection)}
                  </TableHeader>
                ),
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
