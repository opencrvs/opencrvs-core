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
import { defineMessages, IntlShape, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import format from 'date-fns/format'
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import {
  Action,
  ActionType,
  EventDocument,
  EventState,
  isFieldVisible,
  isPageVisible,
  PageConfig,
  PageTypes,
  TranslationConfig,
  User,
  ValidatorContext
} from '@opencrvs/commons/client'
import { ColumnContentAlignment, Link } from '@opencrvs/components'
import { makeFormFieldIdFormikCompatible } from '@client/v2-events/components/forms/utils'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import {
  isEmptyValue,
  Output
} from '@client/v2-events/features/events/components/Output'
import { ROUTES } from '@client/v2-events/routes'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'
import { getLocations } from '@client/offline/selectors'
import { DeclarationComparisonTable } from './DeclarationComparisonTable'

const messages = defineMessages({
  correctionSubmittedBy: {
    id: 'correction.submittedBy',
    defaultMessage: 'Submitter',
    description: 'Correction submitted by label'
  },
  correctionRequesterOffice: {
    id: 'correction.requesterOffice',
    defaultMessage: 'Office',
    description: 'Correction requester office label'
  },
  correctionSubmittedOn: {
    id: 'correction.submittedOn',
    defaultMessage: 'Submitted on',
    description: 'Correction submitted on label'
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

/*
 * If this correction was already requested, prepend metadata about the request itself.
 * These entries (submitter, office, and submission date) are shown before the
 * field-level correction details so the reviewer immediately sees who requested it and when.
 */
function getRequestActionDetails(
  correctionRequestAction: Action,
  users: User[],
  locations: ReturnType<typeof getLocations>,
  intl: IntlShape
): CorrectionDetail[] {
  const user = users.find((u) => u.id === correctionRequestAction.createdBy)
  const location =
    correctionRequestAction.createdAtLocation &&
    locations[correctionRequestAction.createdAtLocation]

  return [
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
      valueDisplay: format(
        new Date(correctionRequestAction.createdAt),
        'MMMM dd, yyyy'
      )
    }
  ]
}

function buildCorrectionDetails(
  correctionFormPages: PageConfig[],
  annotation: EventState,
  form: EventState,
  intl: IntlShape,
  users: User[],
  locations: ReturnType<typeof getLocations>,
  validatorContext: ValidatorContext,
  correctionRequestAction?: Action
): CorrectionDetail[] {
  const details: CorrectionDetail[] = correctionFormPages
    .filter((page) => isPageVisible(page, annotation))
    .flatMap((page) => {
      if (page.type === PageTypes.enum.VERIFICATION) {
        const value = !!annotation[page.id]
        return [
          {
            id: page.id,
            label: page.title,
            valueDisplay: value ? (
              <>{intl.formatMessage(correctionMessages.verifyIdentity)}</>
            ) : (
              <>{intl.formatMessage(correctionMessages.cancelVerifyIdentity)}</>
            ),
            pageId: page.id
          }
        ]
      }
      return page.fields
        .filter((f) =>
          isFieldVisible(f, { ...form, ...annotation }, validatorContext)
        )
        .filter((f) => !isEmptyValue(f, { ...form, ...annotation }[f.id]))
        .map((field) => ({
          label: field.label,
          id: field.id,
          valueDisplay: (
            <Output
              field={field}
              showPreviouslyMissingValuesAsChanged={false}
              value={annotation[field.id]}
            />
          ),
          pageId: page.id
        }))
    })

  if (correctionRequestAction) {
    details.unshift(
      ...getRequestActionDetails(
        correctionRequestAction,
        users,
        locations,
        intl
      )
    )
  }

  return details
}

/**
 * Represents the details of a correction entry shown in the UI.
 * - `label`: i18n configuration for displaying the label
 * - `id`: unique identifier for the detail
 * - `valueDisplay`: what to render as the value (string, JSX, or nothing)
 * - `pageId`: optional page reference if detail links to another page
 */
interface CorrectionDetail {
  label: TranslationConfig
  id: string
  valueDisplay: string | React.JSX.Element | null | undefined
  pageId?: string
}

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
  correctionRequestAction,
  validatorContext
}: {
  event: EventDocument
  form: EventState
  annotation: EventState
  requesting: boolean
  correctionRequestAction?: Action
  editable?: boolean
  workqueue?: string
  validatorContext: ValidatorContext
}) {
  const intl = useIntl()
  const { eventConfiguration } = useEventConfiguration(event.type)

  const navigate = useNavigate()
  const { getUser } = useUsers()
  const users = getUser.getAllCached()
  const locations = useSelector(getLocations)

  const correctionFormPages =
    eventConfiguration.actions.find(
      (action) => action.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  const correctionDetails = buildCorrectionDetails(
    correctionFormPages,
    annotation,
    form,
    intl,
    users,
    locations,
    validatorContext,
    correctionRequestAction
  )

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
            // change button should not appear for details without pageId
            change: pageId && (
              <Link
                data-testid={`change-${id}`}
                font="reg14"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(
                    ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath(
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
      <DeclarationComparisonTable
        action={correctionRequestAction}
        eventConfig={eventConfiguration}
        form={form}
        fullEvent={event}
        id={'corrections-table'}
      />
    </>
  )
}
