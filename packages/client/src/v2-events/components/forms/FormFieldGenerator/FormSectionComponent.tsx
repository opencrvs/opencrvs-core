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

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Field, FieldProps, FormikProps, FormikTouched } from 'formik'
import { cloneDeep, isEqual, set, groupBy, omit } from 'lodash'
import { useIntl } from 'react-intl'
import styled, { keyframes } from 'styled-components'
import {
  EventState,
  EventConfig,
  FieldConfig,
  FieldType,
  FieldValue,
  isFieldEnabled,
  isFieldVisible,
  AddressType,
  TranslationConfig,
  IndexMap
} from '@opencrvs/commons/client'
import {
  makeDatesFormatted,
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '@client/v2-events/components/forms/utils'
import {
  makeFormFieldIdsFormikCompatible,
  makeFormikFieldIdsOpenCRVSCompatible
} from './utils'
import { GeneratedInputField } from './GeneratedInputField'

type AllProps = {
  id: string
  initialValues?: EventState
  eventConfig?: EventConfig
  fields: FieldConfig[]
  className?: string
  readonlyMode?: boolean
  errors: Record<string, { errors: { message: TranslationConfig }[] }>
  /**
   * Update the form values in the non-formik state.
   */
  onChange: (values: EventState) => void
  /**
   * Update the touched values in the non-formik state.
   */
  setAllTouchedFields: (touchedFields: FormikTouched<EventState>) => void
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
} & UsedFormikProps

/**
 * Fields are explicitly defined here to avoid confusion between what is actually used out of all the passed props.
 */
type UsedFormikProps = Pick<
  FormikProps<EventState>,
  | 'values'
  | 'setTouched'
  | 'setValues'
  | 'touched'
  | 'resetForm'
  | 'setFieldValue'
  | 'setErrors'
>

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const FormItem = styled.div<{
  ignoreBottomMargin?: boolean
}>`
  animation: ${fadeIn} 500ms;
  margin-bottom: ${({ ignoreBottomMargin }) =>
    ignoreBottomMargin ? '0px' : '22px'};
`

/**
 * Given a parent field id, retrieve the ids of all its child field ids.
 * Used to reset the values of child fields when a parent field changes.
 */
function retrieveChildFieldIds(
  parentId: string,
  fieldParentMap: IndexMap<FieldConfig[]>
): string[] {
  const childFields = fieldParentMap[parentId]

  if (!childFields) {
    return []
  }

  return childFields.map((childField) => childField.id)
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
  values,
  fields: fieldsWithDotSeparator,
  touched,
  setAllTouchedFields,
  className,
  initialValues = {},
  readonlyMode,
  id,
  errors: errorsWithDotSeparator,
  eventConfig,
  setValues,
  setTouched,
  onChange,
  resetForm,
  setErrors,
  validateAllFields,
  fieldsToShowValidationErrors,
  onAllFieldsValidated
}: AllProps) {
  const intl = useIntl()
  const prevValuesRef = useRef(values)
  const prevIdRef = useRef(id)

  const fieldsWithFormikSeparator = fieldsWithDotSeparator.map((field) => ({
    ...field,
    id: makeFormFieldIdFormikCompatible(field.id)
  }))

  // Create a reference map of parent fields and their their children for quick access.
  // This is used to reset the values of child fields when a parent field changes.
  const fieldsByParentId: IndexMap<FieldConfig[]> = useMemo(
    () => groupBy(fieldsWithDotSeparator, (field) => field.parent?._fieldId),
    [fieldsWithDotSeparator]
  )

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

  const onFieldValueChange = useCallback(
    (formikFieldId: string, value: FieldValue | undefined) => {
      const updatedValues = cloneDeep(values)
      const updatedErrors = cloneDeep(errorsWithDotSeparator)

      const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)

      const childIds = retrieveChildFieldIds(ocrvsFieldId, fieldsByParentId)

      // update the value of the field that was changed
      set(updatedValues, formikFieldId, value)

      // reset the children values of the changed field. (e.g. When changing informant.relation, empty out phone number, email and others.)
      for (const childId of childIds) {
        set(updatedValues, makeFormFieldIdFormikCompatible(childId), undefined)
        set(updatedErrors, childId, { errors: [] })
      }

      // @TODO: we should not reference field id 'country' directly.
      if (formikFieldId === 'country') {
        const defaultCountry = window.config.COUNTRY || 'FAR'
        set(
          updatedValues,
          'addressType',
          value === defaultCountry
            ? AddressType.DOMESTIC
            : AddressType.INTERNATIONAL
        )
      }

      const formikChildIds = childIds.map((childId) =>
        makeFormFieldIdFormikCompatible(childId)
      )
      const updatedTouched = omit(touched, formikChildIds)

      // @TODO: Formik does not type errors well. Actual error message differs from the type.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void setErrors(updatedErrors as any)
      void setValues(updatedValues)
      void setTouched(updatedTouched)
      void setAllTouchedFields(updatedTouched)
    },
    [
      values,
      setValues,
      fieldsByParentId,
      setTouched,
      touched,
      errorsWithDotSeparator,
      setErrors,
      setAllTouchedFields
    ]
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
  // Address is the only deep value.
  const completeForm = { ...initialValues, ...form }

  const hasAnyValidationErrors = fieldsWithFormikSeparator.some((field) => {
    const fieldErrors = errors[field.id]?.errors
    const hasErrors = fieldErrors && fieldErrors.length > 0
    return isFieldVisible(field, completeForm) && hasErrors
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
      {fieldsWithFormikSeparator.map((field) => {
        if (!isFieldVisible(field, completeForm)) {
          return null
        }

        const isDisabled = !isFieldEnabled(field, completeForm)
        const visibleError = errors[field.id]?.errors[0]?.message
        const error = visibleError ? intl.formatMessage(visibleError) : ''

        return (
          <FormItem
            key={field.id}
            ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
          >
            <Field name={field.id}>
              {({ field: formikField }: FieldProps) => (
                <GeneratedInputField
                  disabled={isDisabled}
                  error={isDisabled ? '' : error}
                  eventConfig={eventConfig}
                  fieldDefinition={field}
                  form={completeForm}
                  readonlyMode={readonlyMode}
                  touched={touched[field.id] ?? false}
                  value={formikField.value}
                  onBlur={formikField.onBlur}
                  onFieldValueChange={onFieldValueChange}
                />
              )}
            </Field>
          </FormItem>
        )
      })}
    </section>
  )
}
