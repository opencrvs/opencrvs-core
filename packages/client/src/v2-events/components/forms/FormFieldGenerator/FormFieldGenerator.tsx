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

import React, { useEffect } from 'react'

import { Formik } from 'formik'
import { isEqual, noop } from 'lodash'
import { MessageDescriptor, useIntl } from 'react-intl'
import {
  EventState,
  FieldConfig,
  FieldValue,
  EventConfig,
  MetaFields
} from '@opencrvs/commons/client'

import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useUserAddress } from '@client/v2-events/hooks/useUserAddress'
import { handleDefaultValue } from '@client/v2-events/components/forms/utils'
import { getValidationErrorsForForm } from '@client/v2-events/components/forms/validation'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { FormSectionComponent } from './FormSectionComponent'

type FormData = Record<string, FieldValue>

function mapFieldsToValues(
  fields: FieldConfig[],
  formData: FormData,
  meta: MetaFields
) {
  return fields.reduce((memo, field) => {
    const fieldInitialValue = handleDefaultValue(field, formData, meta)
    return { ...memo, [field.id]: fieldInitialValue }
  }, {})
}

interface ExposedProps {
  fields: FieldConfig[]
  id: string
  fieldsToShowValidationErrors?: FieldConfig[]
  setAllFieldsDirty: boolean
  onChange: (values: EventState) => void
  formData: Record<string, FieldValue>
  requiredErrorMessage?: MessageDescriptor
  onUploadingStateChanged?: (isUploading: boolean) => void
  initialValues?: EventState
  eventConfig?: EventConfig
  declaration?: EventState
  readonlyMode?: boolean
}

export const FormFieldGenerator: React.FC<ExposedProps> = React.memo(
  (props) => {
    const { eventConfig, formData, fields, declaration } = props

    const intl = useIntl()
    const { setAllTouchedFields, touchedFields: initialTouchedFields } =
      useEventFormData()
    const nestedFormData = makeFormFieldIdsFormikCompatible(formData)

    const onChange = (values: EventState) => {
      props.onChange(makeFormikFieldIdsOpenCRVSCompatible(values))
    }
    const user = useUserAddress()

    const initialValues = makeFormFieldIdsFormikCompatible<FieldValue>({
      ...mapFieldsToValues(props.fields, nestedFormData, { $user: user }),
      ...props.initialValues
    })

    return (
      <Formik<EventState>
        enableReinitialize={true}
        initialTouched={initialTouchedFields}
        initialValues={initialValues}
        validate={(values) =>
          getValidationErrorsForForm(
            fields,
            makeFormikFieldIdsOpenCRVSCompatible(values)
          )
        }
        validateOnMount={true}
        onSubmit={noop}
      >
        {(formikProps) => {
          const { touched } = formikProps

          useEffect(() => {
            /**
             * Because 'enableReinitialize' prop is set to 'true' above, whenver initialValue changes,
             * formik lose track of touched fields. This is a workaround to save all the fields that
             * have been touched for once during the form manipulation. So that we can show validation
             * errors for all fields that have been touched.
             */
            if (
              Object.keys(touched).length > 0 &&
              !isEqual(touched, initialTouchedFields) &&
              Object.keys(touched).some((key) => !(key in initialTouchedFields))
            ) {
              setAllTouchedFields({
                ...initialTouchedFields,
                ...touched
              })
            }
          }, [touched])
          return (
            <FormSectionComponent
              {...props}
              {...formikProps}
              declaration={declaration}
              eventConfig={eventConfig}
              formData={nestedFormData}
              intl={intl}
              onChange={onChange}
            />
          )
        }}
      </Formik>
    )
  }
)
