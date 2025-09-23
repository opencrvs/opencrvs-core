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
import styled from 'styled-components'
import { defineMessages, useIntl } from 'react-intl'
import {
  applyDeclarationToEventIndex,
  EventConfig,
  EventDocument,
  EventState,
  getAcceptedActions,
  getCurrentEventState,
  getDeclaration,
  UUID
} from '@opencrvs/commons/client'
import { Table } from '@opencrvs/components/lib/Table'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { hasAnnotationChanged, hasFieldChanged } from '../../utils'
import {
  expandWithUpdateActions,
  EventHistoryActionDocument
} from '../../useActionForHistory'

const TableHeader = styled.th`
  text-transform: uppercase;
  ${({ theme }) => theme.fonts.bold12}
  display: inline-block;
`
interface BaseDeclarationComparisonTableProps {
  eventId: UUID
  eventConfig: EventConfig
  id: string
}

type DeclarationComparisonTableProps =
  | (BaseDeclarationComparisonTableProps & {
      /** When action is provided, the comparison is done between the state before the action and the state after it. */
      action: EventHistoryActionDocument
      form?: EventState
    })
  | (BaseDeclarationComparisonTableProps & {
      /** When form is provided, form is applied on top of the latest state and compared to the previous one. */
      form: EventState
      action?: EventHistoryActionDocument
    })

const messages = defineMessages({
  reviewForm: {
    defaultMessage: 'Review form',
    description: 'Review form label for update action',
    id: 'review.form.title'
  }
})

function getReviewForm(configuration: EventConfig) {
  return configuration.actions
    .filter((action) => 'review' in action)
    .map((action) => action.review)
}

function getReviewFormFields(configuration: EventConfig) {
  const reviewForms = getReviewForm(configuration)
  const allFields = reviewForms.flatMap((form) => form.fields)

  return Array.from(
    new Map(allFields.map((field) => [field.id, field])).values()
  )
}

/**
 *
 * @param action - action with the latest correction/update. Compares state before (exclusive) the action with the corrected one
 * @returns Display of differences between declaration before and after the correction/update.
 */
export function DeclarationComparisonTableComponent({
  action,
  form,
  eventId,
  eventConfig,
  id
}: DeclarationComparisonTableProps) {
  const { getEvent } = useEvents()
  const fullEventWithoutUpdatedAction = getEvent.findFromCache(eventId).data

  if (!fullEventWithoutUpdatedAction) {
    throw new Error(`Event with id ${eventId} not found`)
  }

  const acceptedActions = getAcceptedActions(fullEventWithoutUpdatedAction)
  const historyWithUpdatedActions = expandWithUpdateActions(acceptedActions)

  const fullEvent = {
    ...fullEventWithoutUpdatedAction,
    actions: historyWithUpdatedActions
  }

  const index = fullEvent.actions.findIndex((a) => a.id === action?.id)
  // When action is not found or provided, we compare the full event
  const eventBeforeUpdate =
    index === -1
      ? fullEvent
      : {
          ...fullEvent,
          actions: fullEvent.actions.slice(0, index)
        }

  const declarationConfig = getDeclaration(eventConfig)
  const reviewFormFields = getReviewFormFields(eventConfig)

  const intl = useIntl()
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)

  const currentState = getCurrentEventState(
    fullEvent as EventDocument,
    eventConfiguration
  )

  // When form is provided, we apply it on top of the current state to get the latest declaration
  const latestDeclaration = form
    ? applyDeclarationToEventIndex(currentState, form, eventConfiguration)
        .declaration
    : currentState.declaration

  const previousDeclaration = getCurrentEventState(
    eventBeforeUpdate as EventDocument,
    eventConfiguration
  ).declaration

  // Collect all changed review fields once
  const changedReviewFields = reviewFormFields
    .filter((f) => hasAnnotationChanged(f, fullEvent, index).valueHasChanged)
    .map((f) => {
      const { currentAnnotations, previousAnnotations } = hasAnnotationChanged(
        f,
        fullEvent,
        index
      )

      const previous = (
        <Output
          field={f}
          formConfig={declarationConfig}
          previousForm={previousAnnotations}
          showPreviouslyMissingValuesAsChanged={false}
          value={previousAnnotations[f.id]}
        />
      )

      const latest = (
        <Output
          field={f}
          showPreviouslyMissingValuesAsChanged={false}
          value={currentAnnotations[f.id]}
        />
      )

      return {
        fieldLabel: intl.formatMessage(f.label),
        latest,
        previous
      }
    })

  return (
    <>
      {declarationConfig.pages.map((page) => {
        const changedFields = page.fields
          .filter((f) =>
            hasFieldChanged(f, latestDeclaration, previousDeclaration)
          )
          .map((f) => {
            const previous = (
              <Output
                displayEmptyAsDash
                field={f}
                formConfig={declarationConfig}
                previousForm={previousDeclaration}
                showPreviouslyMissingValuesAsChanged={false}
                value={previousDeclaration[f.id]}
              />
            )

            const latest = (
              <Output
                displayEmptyAsDash
                field={f}
                showPreviouslyMissingValuesAsChanged={false}
                value={latestDeclaration[f.id]}
              />
            )

            return {
              fieldLabel: intl.formatMessage(f.label),
              latest,
              previous
            }
          })

        if (changedFields.length === 0) {
          return null
        }

        return (
          <Table
            key={`${id}-${page.id}`}
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
                key: 'previous'
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
                key: 'latest'
              }
            ]}
            content={changedFields}
            hideTableBottomBorder={true}
            id={`${id}-${page.id}`}
          />
        )
      })}
      {changedReviewFields.length > 0 && (
        <Table
          key={`${id}-review-fields`}
          columns={[
            {
              label: (
                <TableHeader>
                  {intl.formatMessage(messages.reviewForm)}
                </TableHeader>
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
              key: 'previous'
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
              key: 'latest'
            }
          ]}
          content={changedReviewFields}
          hideTableBottomBorder={true}
          id={`${id}-review-fields`}
        />
      )}
    </>
  )
}

export const DeclarationComparisonTable = withSuspense(
  DeclarationComparisonTableComponent
)
