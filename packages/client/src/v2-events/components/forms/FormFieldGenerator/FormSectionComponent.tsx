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

import React, { useCallback, useEffect, useRef } from 'react'
import { useFormikContext } from 'formik'
import { isEqual } from 'lodash'
import {
  EventState,
  FieldConfig,
  FieldType,
  ValidatorContext,
  isFieldVisible
} from '@opencrvs/commons/client'
import {
  makeDatesFormatted,
  makeFormFieldIdFormikCompatible
} from '@client/v2-events/components/forms/utils'
import { useOnlineStatus } from '@client/utils'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { FormItem, GeneratedInputField } from './GeneratedInputField'
import { useVisibleFields } from './opencrvsFormHooks'

interface AllProps {
  id: string
  initialValues?: EventState
  fields: FieldConfig[]
  className?: string
  /**
   * Update the form values in the non-formik state.
   */
  onChange: (values: EventState) => void
  /**
   * Update the touched values in the non-formik state.
   */
  fieldsToShowValidationErrors?: FieldConfig[]
  /**
   * When set to true, all fields will be marked as touched and any validation errors will be shown to user
   */
  validateAllFields: boolean
  /**
   * Used in conjunction with 'validateAllFields'. When validateAllFields is switched from false to true,
   * this callback is called with success true if all fields are valid, or false if there are any validation errors.
   */
  onAllFieldsValidated?: (success: boolean) => void
  validatorContext: ValidatorContext
}

function focusElementByHash() {
  const hash = window.location.hash.slice(1)
  if (!hash) {
    return
  }

  const input =
    document.querySelector<HTMLElement>(`input[id*="${hash}"]`) ??
    document.querySelector<HTMLElement>(`${window.location.hash} input`)

  input?.focus()
  window.scrollTo(0, document.documentElement.scrollTop - 100)
}

// @TODO: Clarify and unify the naming of the props. What is from formik and what is from the state.
export function FormSectionComponent({
  fields: fieldsWithDotSeparator,
  className,
  initialValues = {},
  id,
  onChange,
  validateAllFields,
  fieldsToShowValidationErrors,
  onAllFieldsValidated,
  validatorContext
}: AllProps) {
  const {
    values,
    errors: errorsWithDotSeparator,
    setTouched,
    resetForm
  } = useFormikContext<EventState>()
  // Conditionals need to be able to react to whether the user is online or not -
  useOnlineStatus()
  const prevValuesRef = useRef(values)
  const prevIdRef = useRef(id)
  const visibleFields = useVisibleFields(fieldsWithDotSeparator)

  const fieldsWithFormikSeparator = fieldsWithDotSeparator.map((field) => ({
    ...field,
    id: makeFormFieldIdFormikCompatible(field.id)
  }))

  const errors = makeFormFieldIdsFormikCompatible(errorsWithDotSeparator)
  const form = makeFormikFieldIdsOpenCRVSCompatible(
    makeDatesFormatted(fieldsWithDotSeparator, values)
  )

  const showValidationErrors = useCallback(
    (formFields: FieldConfig[]) => {
      const formattedFieldIds = formFields.map(({ id: fieldId }) =>
        makeFormFieldIdFormikCompatible(fieldId)
      )

      const touchedForm = formattedFieldIds.reduce<Record<string, boolean>>(
        (acc, fieldId) => {
          acc[fieldId] = true
          return acc
        },
        {}
      )
      void setTouched(touchedForm)
    },
    [setTouched]
  )

  useEffect(() => {
    void setTouched({})
    if (validateAllFields) {
      showValidationErrors(fieldsWithDotSeparator)
    }

    focusElementByHash()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const userChangedForm = !isEqual(values, prevValuesRef.current)
    const sectionChanged = prevIdRef.current !== id

    // Formik does not allow controlling the form state 'easily'.
    // We propagate changes to the non-formik state from formik
    if (userChangedForm) {
      onChange(values)
    }

    if (sectionChanged) {
      resetForm()

      const fieldsToValidate = validateAllFields
        ? fieldsWithDotSeparator
        : (fieldsToShowValidationErrors ?? [])

      if (fieldsToValidate.length) {
        showValidationErrors(fieldsToValidate)
      }
    }

    prevValuesRef.current = values
    prevIdRef.current = id
  }, [
    values,
    id,
    onChange,
    resetForm,
    fieldsWithDotSeparator,
    fieldsToShowValidationErrors,
    validateAllFields,
    showValidationErrors
  ])

  // @TODO: Using deepMerge here will cause e2e tests to fail without noticeable difference in the output.
  const completeForm = { ...initialValues, ...form }

  const hasAnyValidationErrors = fieldsWithFormikSeparator.some((field) => {
    const fieldErrors = errors[field.id]
    const hasErrors = fieldErrors && fieldErrors.length > 0
    return isFieldVisible(field, completeForm, validatorContext) && hasErrors
  })

  useEffect(() => {
    if (validateAllFields) {
      showValidationErrors(fieldsWithDotSeparator)
      onAllFieldsValidated?.(!hasAnyValidationErrors)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateAllFields])

  return (
    <section className={className}>
      {visibleFields.map((field) => {
        return (
          <FormItem
            key={field.id}
            ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
          >
            <GeneratedInputField
              fieldDefinition={field}
              name={makeFormFieldIdFormikCompatible(field.id)}
            />
          </FormItem>
        )
      })}
    </section>
  )
}
