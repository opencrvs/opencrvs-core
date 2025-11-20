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
  EventDocument,
  CustomAction,
  getCustomActionFields,
  FieldConfig,
  EventConfig,
  isFieldVisible,
  ValidatorContext
} from '@opencrvs/commons/client'
import { ColumnContentAlignment } from '@opencrvs/components'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { Output } from '@client/v2-events/features/events/components/Output'

function prepareContent(
  action: CustomAction,
  customActionFields: FieldConfig[],
  eventConfiguration: EventConfig,
  validatorContext: ValidatorContext
) {
  const intl = useIntl()
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

export function CustomActionDialog({
  event,
  action,
  validatorContext
}: {
  event: EventDocument
  action: CustomAction
  validatorContext: ValidatorContext
}) {
  const originalAction =
    event.actions.find(
      (a): a is CustomAction => a.id === action.originalActionId
    ) ?? undefined

  if (!originalAction) {
    throw new Error('Original action not found. This should never happen.')
  }
  const { eventConfiguration } = useEventConfiguration(event.type)
  const customActionFields = getCustomActionFields(eventConfiguration)
  const content = prepareContent(
    originalAction,
    customActionFields,
    eventConfiguration,
    validatorContext
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
