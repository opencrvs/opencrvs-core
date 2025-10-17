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
  EventConfig,
  EventState,
  FieldConfig,
  FieldValue,
  joinValues,
  ValidatorContext
} from '@opencrvs/commons/client'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { FIELD_SEPARATOR } from '@client/v2-events/components/forms/utils'
import { getValidationErrorsForForm } from '@client/v2-events/components/forms/validation'
import { useDefaultValues } from '@client/v2-events/hooks/useDefaultValues'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { FormSectionComponent } from './FormSectionComponent'

export interface FormFieldGeneratorProps {
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
  isCorrection?: boolean
  parentId?: string // `child____name` part of `child____name____firstname`
  validatorContext: ValidatorContext
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
    onAllFieldsValidated,
    isCorrection = false,
    parentId,
    validatorContext
  }) => {
    const { setAllTouchedFields, touchedFields } = useEventFormData()
    const intl = useIntl()
    const defaultValues = useDefaultValues(fields)

    const updateTouchFields = (
      touched: Record<string, boolean | undefined>
    ) => {
      const newlyTouched =
        Object.keys(touched).length > 0 &&
        !isEqual(touched, touchedFields) &&
        Object.keys(touched).filter((key) => !(key in touchedFields))

      if (newlyTouched && newlyTouched.length > 0) {
        const newlyTouchedFields = parentId
          ? newlyTouched.reduce(
              (prev, fieldId) => ({
                ...prev,
                /**
                 * If we are touching  `firstname` from `child____name`,
                 * we mark `child____name____firstname` as dirty
                 */
                [joinValues([parentId, fieldId], FIELD_SEPARATOR)]: true
              }),
              {}
            )
          : touched

        setAllTouchedFields({
          ...touchedFields,
          ...newlyTouchedFields
        })
      }
    }

    const formikOnChange = (values: EventState) =>
      onChange(makeFormikFieldIdsOpenCRVSCompatible(values))

    const formikCompatibleInitialValues =
      makeFormFieldIdsFormikCompatible<FieldValue>({
        ...defaultValues,
        ...initialValues
      })

    return (
      <Formik<EventState>
        enableReinitialize={true}
        initialTouched={touchedFields}
        initialValues={formikCompatibleInitialValues}
        validate={(values) =>
          Object.fromEntries(
            Object.entries(
              getValidationErrorsForForm(
                fields,
                makeFormikFieldIdsOpenCRVSCompatible(values),
                validatorContext
              )
            ).map(([fieldId, errors]) => [
              fieldId,
              errors?.[0]?.message && intl.formatMessage(errors[0].message)
            ])
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
            updateTouchFields(touched)
          }, [touched])

          return (
            <FormSectionComponent
              className={className}
              errors={formikProps.errors}
              eventConfig={eventConfig}
              fields={fields}
              fieldsToShowValidationErrors={fieldsToShowValidationErrors}
              id={id}
              initialValues={initialValues}
              isCorrection={isCorrection}
              parentId={parentId}
              readonlyMode={readonlyMode}
              resetForm={formikProps.resetForm}
              setAllTouchedFields={setAllTouchedFields}
              setErrors={formikProps.setErrors}
              setTouched={formikProps.setTouched}
              setValues={formikProps.setValues}
              touched={{ ...formikProps.touched, ...touchedFields }}
              validateAllFields={validateAllFields}
              validatorContext={validatorContext}
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
