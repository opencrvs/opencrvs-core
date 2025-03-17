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
import {
  EventState,
  FieldProps,
  ActionType,
  FormConfig
} from '@opencrvs/commons/client'
import { useEventConfigurationContext } from '@client/v2-events/features/events/components/Action'
import { Output } from '@client/v2-events/features/events/components/Output'

// TODO CIHAN: move this somewhere else
function getForm(forms: FormConfig[]) {
  return forms.find((f) => f.active)
}

function DataInput({
  label,
  configuration,
  formData
}: FieldProps<'DATA'> & { formData: EventState }) {
  const intl = useIntl()
  const eventConfiguration = useEventConfigurationContext()

  const declareFormConfig = eventConfiguration?.actions.find(
    (action) => action.type === ActionType.DECLARE
  )

  if (!declareFormConfig) {
    throw new Error('Declare form configuration not found')
  }

  const declareFormFields = getForm(declareFormConfig.forms)?.pages.flatMap(
    (page) => page.fields
  )

  if (!declareFormFields) {
    throw new Error('Declare form fields not found')
  }

  return (
    <div>
      <h3>{intl.formatMessage(label)}</h3>
      <h4>{intl.formatMessage(configuration.subtitle)}</h4>
      <div>
        {configuration.data.map((item) => {
          const field = declareFormFields.find((f) => f.id === item.fieldId)

          if (!field) {
            return null
          }

          return (
            <div key={item.fieldId}>
              <p>{intl.formatMessage(field.label)}</p>
              <Output
                field={field}
                showPreviouslyMissingValuesAsChanged={false}
                value={formData[item.fieldId]}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const Data = {
  Input: DataInput,
  Output: null
}
