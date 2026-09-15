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
  ActionUpdate,
  EventDocument,
  getCurrentEventState,
  getDeclarationFields,
  isFieldDisplayedOnReview,
  ValidatorContext
} from '@opencrvs/commons/client'
import { ColumnContentAlignment } from '@opencrvs/components'
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'
import { recordAnchorDate } from '@client/v2-events/utils'

const messages = defineMessages({
  title: {
    id: 'events.history.systemUpdatedFields.title',
    defaultMessage: 'Updated by the system',
    description:
      'Heading for declaration fields an external system populated when it confirmed the action'
  }
})

const SectionTitle = styled(Text)`
  margin: 20px 0;
`

const Label = styled.label`
  margin: 0;
  padding: 0;
  ${({ theme }) => theme.fonts.bold14}
`

/**
 * Lists declaration fields an external system populated when it confirmed the
 * action asynchronously — e.g. a child UIN (`child.nid`) that MOSIP creates at
 * approve time. These live on the async confirmation's own declaration and are
 * normally hidden from the review form, so the correction diff cannot show them;
 * we surface them explicitly here instead. Fields that are shown on review are
 * skipped, as they already appear in the action's own content above.
 */
export function SystemUpdatedFields({
  declaration,
  fullEvent,
  validatorContext
}: {
  declaration: ActionUpdate
  fullEvent: EventDocument
  validatorContext: ValidatorContext
}) {
  const intl = useIntl()
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)
  const fields = getDeclarationFields(eventConfiguration)
  const currentState = getCurrentEventState(fullEvent, eventConfiguration)
  const anchor = recordAnchorDate(currentState)

  const rows = Object.entries(declaration).flatMap(([id, value]) => {
    const field = fields.find((f) => f.id === id)
    if (!field || value === undefined || value === null || value === '') {
      return []
    }
    // Skip fields that already appear in the action's reviewable content.
    if (
      isFieldDisplayedOnReview(field, currentState.declaration, validatorContext)
    ) {
      return []
    }
    return [{ field, value }]
  })

  if (rows.length === 0) {
    return null
  }

  return (
    <>
      <SectionTitle element="h3" variant="h3">
        {intl.formatMessage(messages.title)}
      </SectionTitle>
      <Table
        columns={[
          {
            width: 34,
            alignment: ColumnContentAlignment.LEFT,
            key: 'label'
          },
          {
            width: 66,
            alignment: ColumnContentAlignment.LEFT,
            key: 'value'
          }
        ]}
        content={rows.map(({ field, value }) => ({
          label: <Label>{intl.formatMessage(field.label)}</Label>,
          value: <Output anchor={anchor} field={field} value={value} />
        }))}
        hideTableBottomBorder={true}
        hideTableHeader={true}
        noPagination={true}
      />
    </>
  )
}
