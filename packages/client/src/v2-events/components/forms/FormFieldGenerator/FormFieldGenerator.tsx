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

/** Shared between multiple components */
export interface FormFieldGeneratorProps {
  // form specific config stuff
  id: string
  fieldsToShowValidationErrors?: FieldConfig[]
  setAllFieldsDirty: boolean
  onChange: (values: EventState) => void
  requiredErrorMessage?: MessageDescriptor
  onUploadingStateChanged?: (isUploading: boolean) => void
  readonlyMode?: boolean

  // events
  fields: FieldConfig[]
  eventConfig?: EventConfig
  // See if we need all of these
  // @TODO: Remove the null from initial state
  form: EventState | null
  declaration?: EventState
  initialValues?: EventState
}

export const FormFieldGenerator: React.FC<FormFieldGeneratorProps> = React.memo(
  (props) => {
    const intl = useIntl()
    const { setAllTouchedFields, touchedFields: initialTouchedFields } =
      useEventFormData()

    // @todo: does this need to be done separately from initial values?
    const formikCompatibleForm = makeFormFieldIdsFormikCompatible(
      props.form ?? {}
    )

    const formikOnChange = (values: EventState) => {
      props.onChange(makeFormikFieldIdsOpenCRVSCompatible(values))
    }

    const user = useUserAddress()

    const formikCompatibleInitialValues =
      makeFormFieldIdsFormikCompatible<FieldValue>({
        ...mapFieldsToValues(props.fields, formikCompatibleForm, {
          $user: user
        }),
        ...props.initialValues
      })

    return (
      <Formik<EventState>
        enableReinitialize={true}
        initialTouched={initialTouchedFields}
        initialValues={formikCompatibleInitialValues}
        validate={(values) =>
          getValidationErrorsForForm(
            props.fields,
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
              declaration={props.declaration}
              // @TODO: Formik does not type errors well. Actual error message differs from the type.
              // This was previously cast on FormSectionComponent level.
              errors={formikProps.errors as any}
              eventConfig={props.eventConfig}
              fields={props.fields}
              id={props.id}
              intl={intl}
              resetForm={formikProps.resetForm}
              setAllFieldsDirty={props.setAllFieldsDirty}
              setAllTouchedFields={setAllTouchedFields}
              setFieldValue={formikProps.setFieldValue}
              setTouched={formikProps.setTouched}
              setValues={formikProps.setValues}
              touched={formikProps.touched}
              values={formikProps.values}
              onChange={formikOnChange}
            />
          )
        }}
      </Formik>
    )
  }
)
