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
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import { Table } from '@opencrvs/components/lib/Table'
import {
  ActionType,
  EventDocument,
  getCurrentEventState,
  getDeclaration,
  RequestedCorrectionAction
} from '@opencrvs/commons/client'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { Output } from '@client/v2-events/features/events/components/Output'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'

const CorrectionSectionTitle = styled(Text)`
  margin: 20px 0;
`

export function RequestCorrection({
  action,
  fullEvent
}: {
  action: RequestedCorrectionAction
  fullEvent: EventDocument
}) {
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)
  const intl = useIntl()

  const correctionFormPages =
    eventConfiguration.actions.find(
      (a) => a.type === ActionType.REQUEST_CORRECTION
    )?.correctionForm.pages || []

  const { annotation, declaration } = action
  const formConfig = getDeclaration(eventConfiguration)

  if (annotation === undefined) {
    return
  }

  // get event state before change
  const eventIndex = getCurrentEventState(fullEvent, eventConfiguration)

  const eventBeforeCorrectionRequest = {
    ...fullEvent,
    actions: fullEvent.actions.slice(0, fullEvent.actions.indexOf(action))
  }

  const eventIndexBeforeCorrectionRequest = getCurrentEventState(
    eventBeforeCorrectionRequest,
    eventConfiguration
  )

  return (
    <>
      {correctionFormPages.map((page) => {
        const pageFields = page.fields.map((field) => {
          // const value = annotation[field.id]
          // if (!value) {
          //   return null
          // }
          // const valueDisplay = Output({
          //   field,
          //   value, // TODO CIHAN: fix this whole thing
          //   showPreviouslyMissingValuesAsChanged: false
          // })
        })

        return (
          <Table
            key={`correction-form-table-${page.id}`}
            columns={[]}
            content={[]}
            // @TODO CIHAN: remove this
            noResultText={intl.formatMessage(page.title)}
          ></Table>
        )
      })}
      <CorrectionSectionTitle element="h3" variant="h3">
        {intl.formatMessage(correctionMessages.correctionSectionTitle)}
      </CorrectionSectionTitle>
      {formConfig.pages.map((page) => {
        const changedFields = Object.entries(declaration)
          .filter(([key, _]) => {
            const isOnPage = page.fields.some((field) => field.id === key)
            return isOnPage
          })
          .map(([key, value]) => {
            const field = page.fields.find((field) => field.id === key)

            if (!field) {
              return
            }

            const originalOutput = Output({
              field,
              value: eventIndexBeforeCorrectionRequest.declaration[key],
              showPreviouslyMissingValuesAsChanged: false
            })

            const correctionOutput = Output({
              field,
              value,
              showPreviouslyMissingValuesAsChanged: false
            })

            return {
              fieldLabel: intl.formatMessage(field.label),
              original: originalOutput ?? '-',
              correction: correctionOutput ?? '-'
            }
          })
          .filter((field) => {
            return field !== undefined
          })

        if (!changedFields.length) {
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
                label: intl.formatMessage(
                  correctionMessages.correctionSummaryOriginal
                ),
                width: 33,
                key: 'original'
              },
              {
                label: intl.formatMessage(
                  correctionMessages.correctionSummaryCorrection
                ),
                width: 33,
                key: 'correction'
              }
            ]}
            content={changedFields}
            hideTableBottomBorder={true}
          ></Table>
        )
      })}
    </>
  )
}
