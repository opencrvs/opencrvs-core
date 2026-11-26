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
import { Table, ColumnContentAlignment } from '@opencrvs/components'
import {
  ActionDocument,
  EventDocument,
  getActionFormFields,
  getCurrentEventState,
  isFieldVisible
} from '@opencrvs/commons/client'
import { useEventConfigurationForRecord } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'
import { recordAnchorDate } from '@client/v2-events/utils'
import { useActionFormConditionalContext } from '@client/v2-events/hooks/useConditionalContext'

/**
 * Renders the values submitted through a core action's configured
 * confirmation-dialog form (ActionConfig.form) in the audit history dialog.
 */
export function ActionFormContent({
  event,
  action
}: {
  event: EventDocument
  action: ActionDocument
}) {
  const intl = useIntl()
  const { eventConfiguration } = useEventConfigurationForRecord(event)
  const conditionalContext = useActionFormConditionalContext(
    event,
    eventConfiguration
  )

  const originalAction =
    event.actions.find(
      (a): a is ActionDocument => a.id === action.originalActionId
    ) ?? action

  const formFields = getActionFormFields(eventConfiguration, action.type)
  const annotation = originalAction.annotation

  // These are form values, so their locations resolve at the record's form
  // anchor (date of event, falling back to creation) — not the action date.
  const eventState = getCurrentEventState(event, eventConfiguration)
  const anchor = recordAnchorDate(eventState)

  const content = formFields
    .filter(
      (f) =>
        isFieldVisible(
          f,
          { declaration: eventState.declaration, annotation: annotation ?? {} },
          conditionalContext
        ) &&
        annotation?.[f.id] != null &&
        annotation[f.id] !== ''
    )
    .map((field) => ({
      label: intl.formatMessage(field.label),
      value: (
        <Output
          anchor={anchor}
          eventConfig={eventConfiguration}
          field={field}
          value={annotation?.[field.id]}
        />
      )
    }))

  if (content.length === 0) {
    return null
  }

  return (
    <Table
      columns={[
        { width: 40, alignment: ColumnContentAlignment.LEFT, key: 'label' },
        { width: 60, alignment: ColumnContentAlignment.LEFT, key: 'value' }
      ]}
      content={content}
      hideTableHeader={true}
    />
  )
}
