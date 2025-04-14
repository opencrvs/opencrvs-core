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
import { useIntl } from 'react-intl'
import {
  EventState,
  FieldConfig,
  FieldValue,
  SystemVariables
} from '@opencrvs/commons/client'

import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useUserAddress } from '@client/v2-events/hooks/useUserAddress'
import { handleDefaultValue } from '@client/v2-events/components/forms/utils'
import { getValidationErrorsForForm } from '@client/v2-events/components/forms/validation'
import {
  FormGeneratorProps,
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { FormSectionComponent } from './FormSectionComponent'

function mapFieldsToValues(
  fields: FieldConfig[],
  declaration: EventState,
  systemVariables: SystemVariables
) {
  return fields.reduce((memo, field) => {
    const fieldInitialValue = handleDefaultValue({
      field,
      declaration,
      systemVariables
    })
    return { ...memo, [field.id]: fieldInitialValue }
  }, {})
}

export const FormFieldGenerator: React.FC<FormGeneratorProps> = React.memo(
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
              // @TODO: Formik does not type errors well. Actual error message differs from the type.
              // This was previously cast on FormSectionComponent level.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errors={formikProps.errors as any}
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
