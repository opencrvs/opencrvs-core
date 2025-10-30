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
import { Field, FieldProps, FormikProps, FormikTouched } from 'formik'
import { cloneDeep, isEqual, set, omit, get, compact } from 'lodash'
import styled, { keyframes } from 'styled-components'
import {
  EventState,
  EventConfig,
  FieldConfig,
  FieldType,
  FieldValue,
  AddressType,
  IndexMap,
  joinValues,
  isNonInteractiveFieldType,
  InteractiveFieldType,
  FieldReference,
  getAllUniqueFields,
  omitHiddenFields,
  isFieldEnabled,
  ValidatorContext,
  isFieldVisible
} from '@opencrvs/commons/client'
import {
  FIELD_SEPARATOR,
  makeDatesFormatted,
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '@client/v2-events/components/forms/utils'
import { useOnlineStatus } from '@client/utils'
import { handleDefaultValue } from '@client/v2-events/hooks/useDefaultValues'
import { useSystemVariables } from '@client/v2-events/hooks/useSystemVariables'
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
  errors: IndexMap<string>
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
  /**
   * If isCorrection is true, fields with configuration option 'uncorrectable' set to true will be disabled.
   */
  isCorrection?: boolean
  parentId?: string
  validatorContext: ValidatorContext
} & UsedFormikProps

/**
 * Fields are explicitly defined here to avoid confusion between what is actually used out of all the passed props.
 */
type UsedFormikProps = Pick<
  FormikProps<EventState>,
  'values' | 'setTouched' | 'setValues' | 'touched' | 'resetForm' | 'setErrors'
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

function resolveFieldReferenceValue(
  { $$field, $$subfield }: FieldReference,
  fieldValues: EventState
): FieldValue | undefined {
  const referenceKeyInFormikFormat = makeFormFieldIdFormikCompatible($$field)

  return $$subfield && $$subfield.length > 0
    ? get(fieldValues[referenceKeyInFormikFormat], $$subfield)
    : fieldValues[referenceKeyInFormikFormat]
}

/**
 * Create a reference map of visible parent fields and their their children for quick access.
 * This is used to reset the values of child fields when a parent field changes.
 *
 * @returns `Record<parentFieldId, FieldConfig[]>` mapping parent field IDs to their child fields
 */
function getParentsOfListenerFields(fields: FieldConfig[]) {
  // Create a reference map of visible parent fields and their their children for quick access.
  // This is used to reset the values of child fields when a parent field changes.
  const fieldsByParentId: IndexMap<FieldConfig[]> = {}

  for (const field of fields) {
    const parents = ([] as FieldReference[]).concat(field.parent ?? [])

    for (const parent of parents) {
      const listenersParentId = parent.$$field
      ;(fieldsByParentId[listenersParentId] ||= []).push(field)
    }
  }

  return fieldsByParentId
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
  onAllFieldsValidated,
  isCorrection = false,
  parentId,
  validatorContext
}: AllProps) {
  // Conditionals need to be able to react to whether the user is online or not -
  useOnlineStatus()
  const prevValuesRef = useRef(values)
  const prevIdRef = useRef(id)

  const systemVariables = useSystemVariables()

  const fieldsWithFormikSeparator = fieldsWithDotSeparator.map((field) => ({
    ...field,
    id: makeFormFieldIdFormikCompatible(field.id)
  }))

  const allFieldsWithDotSeparator = eventConfig
    ? getAllUniqueFields(eventConfig)
    : fieldsWithDotSeparator
  const listenerFieldsByParentId = getParentsOfListenerFields(
    allFieldsWithDotSeparator
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

  /** Sets the value for fields that listen to another field via `parent` and `value` properties */
  const setValueForListenerField = useCallback(
    (
      listenerField: InteractiveFieldType,
      fieldValues: Record<string, FieldValue>,
      fieldErrors: AllProps['errors']
    ) => {
      // this can be any field. Even though we call this only when parent triggers the change.
      const listenerFieldOcrvsId = makeFormikFieldIdOpenCRVSCompatible(
        listenerField.id
      )

      const listenerFieldConfig = allFieldsWithDotSeparator.find(
        (f) => f.id === listenerFieldOcrvsId
      )

      const referencesToOtherFields = ([] as FieldReference[]).concat(
        listenerFieldConfig?.value ?? []
      )

      const listenerFieldFormikId = makeFormFieldIdFormikCompatible(
        listenerField.id
      )

      const firstNonFalsyValue = compact(
        referencesToOtherFields.map((reference) =>
          resolveFieldReferenceValue(reference, fieldValues)
        )
      )[0]

      if (firstNonFalsyValue) {
        set(fieldValues, listenerFieldFormikId, firstNonFalsyValue)
        set(fieldErrors, listenerFieldFormikId, '')
        return
      }

      const defaultValue = handleDefaultValue({
        field: listenerField,
        systemVariables
      })

      set(fieldValues, listenerFieldFormikId, defaultValue)
      set(fieldErrors, listenerFieldFormikId, '')

      return
    },
    [allFieldsWithDotSeparator, systemVariables]
  )

  const onFieldValueChange = useCallback(
    (formikFieldId: string, value: FieldValue | undefined) => {
      const updatedValues = cloneDeep(values)
      const updatedErrors = cloneDeep(errorsWithDotSeparator)

      const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)
      const listenerFields = listenerFieldsByParentId[ocrvsFieldId] ?? []
      const interactiveListenerFields = listenerFields.filter(
        (c): c is InteractiveFieldType => !isNonInteractiveFieldType(c)
      )

      // update the value of the field that was changed
      set(updatedValues, formikFieldId, value)

      for (const listenerField of interactiveListenerFields) {
        setValueForListenerField(listenerField, updatedValues, updatedErrors)
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

      const formikListenerFieldIds = listenerFields.map((child) =>
        makeFormFieldIdFormikCompatible(child.id)
      )

      const updatedTouched = omit(touched, formikListenerFieldIds)

      void setErrors(updatedErrors)
      void setValues(updatedValues)
      void setTouched(updatedTouched)
      void setAllTouchedFields(updatedTouched)
    },
    [
      values,
      setValues,
      listenerFieldsByParentId,
      setTouched,
      touched,
      errorsWithDotSeparator,
      setErrors,
      setAllTouchedFields,
      setValueForListenerField
    ]
  )

  const onBatchFieldValueChange = useCallback(
    (newValues: Array<{ name: string; value: FieldValue | undefined }>) => {
      const updatedValues = cloneDeep(values)
      const updatedErrors = cloneDeep(errorsWithDotSeparator)
      const updatedTouched = cloneDeep(touched)

      for (const { name: formikFieldId, value } of newValues) {
        set(updatedValues, formikFieldId, value)

        const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)
        const listenerFields = listenerFieldsByParentId[ocrvsFieldId] ?? []
        const interactiveListenerFields = listenerFields.filter(
          (c): c is InteractiveFieldType => !isNonInteractiveFieldType(c)
        )

        for (const listenerField of interactiveListenerFields) {
          setValueForListenerField(listenerField, updatedValues, updatedErrors)
          updatedTouched[makeFormFieldIdFormikCompatible(listenerField.id)] =
            undefined
        }
      }

      void setErrors(updatedErrors)
      void setValues(updatedValues)
      void setTouched(updatedTouched)
      void setAllTouchedFields(updatedTouched)
    },
    [
      values,
      setValues,
      listenerFieldsByParentId,
      setTouched,
      touched,
      errorsWithDotSeparator,
      setErrors,
      setAllTouchedFields,
      setValueForListenerField
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

  /*
   * For the conditional check data, we want to only include values from visible fields so values of hidden fields don’t affect them.
   *
   * You might wonder why values of hidden fields aren’t filtered out completely earlier.
   * That’s intentional — we persist their values so if the fields become visible again, the previous values are restored instead of resetting.
   */
  const declarationFields = eventConfig?.declaration.pages.flatMap(
    (p) => p.fields
  )
  const allFields = [...(declarationFields ?? []), ...fieldsWithDotSeparator]
  const visibleFieldValues = omitHiddenFields(
    allFields,
    completeForm,
    validatorContext
  )

  return (
    <section className={className}>
      {fieldsWithFormikSeparator.map((field) => {
        if (!isFieldVisible(field, visibleFieldValues, validatorContext)) {
          return null
        }

        const isDisabled =
          !isFieldEnabled(field, visibleFieldValues, validatorContext) ||
          (isCorrection && field.uncorrectable)

        const visibleError = errors[field.id]
        const error = visibleError ?? ''

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
                  touched={
                    /**
                     * We check the full path so that,
                     * touching `child____name____firstname`
                     * does not make `mother____name____firstname` dirty
                     */
                    (parentId
                      ? touched[
                          joinValues([parentId, FIELD_SEPARATOR, field.id], '')
                        ] || touched[parentId]
                      : touched[field.id]) ?? false
                  }
                  validatorContext={validatorContext}
                  value={formikField.value}
                  onBatchFieldValueChange={onBatchFieldValueChange}
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
