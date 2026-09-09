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
import { IntlShape, useIntl } from 'react-intl'
import { Table } from '@opencrvs/components/lib/Table'
import {
  EventDocument,
  CustomAction,
  getCurrentEventState,
  getCustomActionFields,
  FieldConfig,
  EventConfig,
  isFieldVisible,
  PlainDate,
  ValidatorContext
} from '@opencrvs/commons/client'
import { ColumnContentAlignment } from '@opencrvs/components'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'
import { recordAnchorDate } from '@client/v2-events/utils'

function prepareContent(
  action: CustomAction,
  customActionFields: FieldConfig[],
  eventConfiguration: EventConfig,
  validatorContext: ValidatorContext,
  anchor: PlainDate,
  intl: IntlShape
) {
  const annotation = action.annotation
  return customActionFields
    .filter(
      (f) =>
        isFieldVisible(f, annotation ?? {}, validatorContext) &&
        annotation?.[f.id] != null &&
        annotation[f.id] !== ''
    )
    .map((field) => {
      const value = (
        <Output
          anchor={anchor}
          eventConfig={eventConfiguration}
          field={field}
          value={annotation?.[field.id]}
        />
      )

      return {
        label: intl.formatMessage(field.label),
        value
      }
    })
}

export function CustomActionContent({
  event,
  action,
  validatorContext
}: {
  event: EventDocument
  action: CustomAction
  validatorContext: ValidatorContext
}) {
  const intl = useIntl()
  const { eventConfiguration } = useEventConfiguration(event.type)
  const originalAction =
    event.actions.find(
      (a): a is CustomAction => a.id === action.originalActionId
    ) ?? undefined

  if (!originalAction) {
    throw new Error('Original action not found. This should never happen.')
  }
  const customActionFields = getCustomActionFields(
    eventConfiguration,
    action.customActionType
  )
  // These are form values, so their locations resolve at the record's form
  // anchor (date of event, falling back to creation) — not the action date.
  const anchor = recordAnchorDate(
    getCurrentEventState(event, eventConfiguration)
  )
  const content = prepareContent(
    originalAction,
    customActionFields,
    eventConfiguration,
    validatorContext,
    anchor,
    intl
  )

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
      content={content}
      hideTableHeader={true}
    />
  )
}
