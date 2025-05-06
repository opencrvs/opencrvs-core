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
import {
  EventConfig,
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
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { FormSectionComponent } from './FormSectionComponent'

function mapFieldsToValues(
  fields: FieldConfig[],
  systemVariables: SystemVariables
) {
  return fields.reduce((memo, field) => {
    const fieldInitialValue = handleDefaultValue({
      field,
      systemVariables
    })

    return { ...memo, [field.id]: fieldInitialValue }
  }, {})
}

interface FormFieldGeneratorProps {
  /** form id */
  id: string
  fieldsToShowValidationErrors?: FieldConfig[]
  validateAllFields?: boolean
  onChange: (values: EventState) => void
  readonlyMode?: boolean
  className?: string
  /** Which fields are generated */
  fields: FieldConfig[]
  eventConfig?: EventConfig
  /** Default field values. Might equal to declaration, when a declaration form is rendered. */
  initialValues?: EventState
  onAllFieldsValidated?: (success: boolean) => void
}

export const FormFieldGenerator: React.FC<FormFieldGeneratorProps> = React.memo(
  ({
    onChange,
    fields,
    initialValues,
    className,
    eventConfig,
    fieldsToShowValidationErrors,
    validateAllFields = false,
    readonlyMode,
    id,
    onAllFieldsValidated
  }) => {
    const { setAllTouchedFields, touchedFields: initialTouchedFields } =
      useEventFormData()

    const formikOnChange = (values: EventState) =>
      onChange(makeFormikFieldIdsOpenCRVSCompatible(values))

    const user = useUserAddress()

    const formikCompatibleInitialValues =
      makeFormFieldIdsFormikCompatible<FieldValue>({
        ...mapFieldsToValues(fields, {
          $user: user
        }),
        ...initialValues
      })

    return (
      <Formik<EventState>
        enableReinitialize={true}
        initialTouched={initialTouchedFields}
        initialValues={formikCompatibleInitialValues}
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
             * Because 'enableReinitialize' prop is set to 'true' above, whenever initialValue changes,
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
              className={className}
              // @TODO: Formik does not type errors well. Actual error message differs from the type.
              // This was previously cast on FormSectionComponent level.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              errors={formikProps.errors as any}
              eventConfig={eventConfig}
              fields={fields}
              fieldsToShowValidationErrors={fieldsToShowValidationErrors}
              id={id}
              initialValues={initialValues}
              readonlyMode={readonlyMode}
              resetForm={formikProps.resetForm}
              setAllTouchedFields={setAllTouchedFields}
              setErrors={formikProps.setErrors}
              setFieldValue={formikProps.setFieldValue}
              setTouched={formikProps.setTouched}
              setValues={formikProps.setValues}
              touched={formikProps.touched}
              validateAllFields={validateAllFields}
              values={formikProps.values}
              onAllFieldsValidated={onAllFieldsValidated}
              onChange={formikOnChange}
            />
          )
        }}
      </Formik>
    )
  }
)
