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
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import {
  Action,
  ActionType,
  EventDocument,
  EventState,
  getCurrentEventState,
  getDeclaration,
  isFieldVisible,
  isPageVisible,
  PageTypes,
  TranslationConfig
} from '@opencrvs/commons/client'
import { ColumnContentAlignment, Link } from '@opencrvs/components'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'
import { ROUTES } from '@client/v2-events/routes'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'
import { getLocations } from '@client/offline/selectors'
import { formattedDuration } from '@client/utils/date-formatting'
import { hasFieldChanged } from '../../utils'

const messages = defineMessages({
  correctionSubmittedBy: {
    id: 'v2.correction.submittedBy',
    defaultMessage: 'Submitter',
    description: 'Correction subbmitted by label'
  },
  correctionRequesterOffice: {
    id: 'v2.correction.requesterOffice',
    defaultMessage: 'Office',
    description: 'Correction requester office label'
  },
  correctionSubmittedOn: {
    id: 'v2.correction.submittedOn',
    defaultMessage: 'Submitted on',
    description: 'Correction subbmitted on label'
  }
})

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
  workqueue,
  correctionRequestAction
}: {
  event: EventDocument
  form: EventState
  annotation: EventState
  requesting: boolean
  correctionRequestAction?: Action
  editable?: boolean
  workqueue?: string
}) {
  const intl = useIntl()
  const { eventConfiguration } = useEventConfiguration(event.type)

  const eventIndex = getCurrentEventState(event, eventConfiguration)
  const previousFormValues = eventIndex.declaration
  const formConfig = getDeclaration(eventConfiguration)
  const navigate = useNavigate()
  const { getUser } = useUsers()
  const users = getUser.getAllCached()
  const locations = useSelector(getLocations)

  const correctionFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  const correctionDetails: {
    label: TranslationConfig
    id: string
    valueDisplay: string | React.JSX.Element | null | undefined
    pageId?: string
  }[] = correctionFormPages
    .filter((page) => isPageVisible(page, annotation))
    .flatMap((page) => {
      // For VERIFICATION pages, the recorded value is stored directly under the pageId in `annotation`
      // instead of being tied to individual field IDs. We pull it directly from `annotation[page.id]`.
      if (page.type === PageTypes.enum.VERIFICATION) {
        // value can only be boolean
        const value = !!annotation[page.id]
        return [
          {
            id: page.id,
            label: page.title,
            valueDisplay: value
              ? intl.formatMessage(correctionMessages.verifyIdentity)
              : intl.formatMessage(correctionMessages.cancelVerifyIdentity),
            pageId: page.id
          }
        ]
      }

      // Default handling for other pages: values keyed by field.id
      const pageFields = page.fields
        .filter((f) => isFieldVisible(f, { ...form, ...annotation }))
        .map((field) => {
          const valueDisplay = Output({
            field,
            value: annotation[field.id],
            showPreviouslyMissingValuesAsChanged: false
          })

          return {
            label: field.label,
            id: field.id,
            valueDisplay,
            pageId: page.id
          }
        })
        .filter((f) => f.valueDisplay)

      return pageFields
    })

  if (correctionRequestAction) {
    const user = users.find((u) => u.id === correctionRequestAction.createdBy)
    const location =
      correctionRequestAction.createdAtLocation &&
      locations[correctionRequestAction.createdAtLocation]

    correctionDetails.unshift(
      {
        label: messages.correctionSubmittedBy,
        id: 'correction.submitter',
        valueDisplay: user ? getUsersFullName(user.name, intl.locale) : ''
      },
      {
        label: messages.correctionRequesterOffice,
        id: 'correction.requesterOffice',
        valueDisplay: location?.name || ''
      },
      {
        label: messages.correctionSubmittedOn,
        id: 'correction.submittedOn',
        valueDisplay: formattedDuration(
          new Date(correctionRequestAction.createdAt)
        )
      }
    )
  }

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
                  pageId &&
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
                {intl.formatMessage(correctionMessages.change)}
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
          ? intl.formatMessage(correctionMessages.correctionSectionTitle)
          : intl.formatMessage(correctionMessages.makeCorrectionSectionTitle)}
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
                    {intl.formatMessage(
                      correctionMessages.correctionSummaryOriginal
                    )}
                  </TableHeader>
                ),
                width: 33,
                key: 'original'
              },
              {
                label: (
                  <TableHeader>
                    {intl.formatMessage(
                      correctionMessages.correctionSummaryCorrection
                    )}
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
