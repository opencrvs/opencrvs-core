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
import { cloneDeep, isEqual, set, groupBy, omit, get } from 'lodash'
import { useIntl } from 'react-intl'
import styled, { keyframes } from 'styled-components'
import {
  EventState,
  EventConfig,
  FieldConfig,
  FieldType,
  FieldValue,
  AddressType,
  TranslationConfig,
  IndexMap,
  joinValues,
  isNonInteractiveFieldType,
  SystemVariables,
  InteractiveFieldType,
  FieldReference,
  getAllUniqueFields,
  isFieldVisible,
  isFieldEnabled,
  ValidatorContext
} from '@opencrvs/commons/client'
import {
  FIELD_SEPARATOR,
  handleDefaultValue,
  makeDatesFormatted,
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '@client/v2-events/components/forms/utils'
import { useOnlineStatus } from '@client/utils'
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
  /**
   * If isCorrection is true, fields with configuration option 'uncorrectable' set to true will be disabled.
   */
  isCorrection?: boolean
  systemVariables: SystemVariables
  parentId?: string
  validatorContext: ValidatorContext
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
 * Given a parent field id, retrieve all of the child configs.
 * Used to reset the values of child fields when a parent field changes.
 */
function retrieveChildFields(
  parentId: string,
  fieldParentMap: IndexMap<FieldConfig[]>
) {
  const childFields = fieldParentMap[parentId]

  if (!childFields) {
    return []
  }

  return childFields
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

function getUpdatedChildValueOnChange({
  childField,
  fieldReference,
  fieldValues,
  systemVariables
}: {
  childField: InteractiveFieldType
  fieldReference: FieldReference | undefined
  fieldValues: Record<string, FieldValue>
  systemVariables: SystemVariables
}) {
  if (!fieldReference) {
    // If there is no reference, we reset the value to the default value.
    return (
      handleDefaultValue({
        field: childField,
        systemVariables
      }) ?? null
    )
  }

  const referenceKeyInFormikFormat = makeFormFieldIdFormikCompatible(
    fieldReference.$$field
  )

  return fieldReference.$$subfield && fieldReference.$$subfield.length > 0
    ? get(fieldValues[referenceKeyInFormikFormat], fieldReference.$$subfield)
    : fieldValues[referenceKeyInFormikFormat]
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
  systemVariables,
  parentId,
  validatorContext
}: AllProps) {
  // Conditionals need to be able to react to whether the user is online or not -
  useOnlineStatus()
  const intl = useIntl()
  const prevValuesRef = useRef(values)
  const prevIdRef = useRef(id)

  const fieldsWithFormikSeparator = fieldsWithDotSeparator.map((field) => ({
    ...field,
    id: makeFormFieldIdFormikCompatible(field.id)
  }))

  // fieldsWithDotSeparator may fallback to pageFieldsWithDotIds when eventConfig
  // isn’t loaded yet. This guarantees we always have a usable set of fields.
  // Once eventConfig is available, we derive all fields (with dot-separated IDs)
  // so parent → child relationships can be resolved consistently across pages.
  const allFieldsWithDotSeparator: FieldConfig[] = useMemo(() => {
    if (eventConfig) {
      const allConfigFields = getAllUniqueFields(eventConfig)
      return allConfigFields.map((field) => ({
        ...field,
        id: makeFormFieldIdFormikCompatible(field.id)
      }))
    }
    return fieldsWithDotSeparator
  }, [eventConfig, fieldsWithDotSeparator])

  // Create a reference map of parent fields and their their children for quick access.
  // This is used to reset the values of child fields when a parent field changes.
  const fieldsByParentId: IndexMap<FieldConfig[]> = useMemo(
    () => groupBy(allFieldsWithDotSeparator, (field) => field.parent?.$$field),
    [allFieldsWithDotSeparator]
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
  const setValuesForListenerFields = useCallback(
    (
      childField: InteractiveFieldType,
      fieldValues: Record<string, FieldValue>,
      fieldErrors: AllProps['errors']
    ) => {
      // this can be any field. Even though we call this only when parent triggers the change.

      const childFieldOcrvsId = makeFormikFieldIdOpenCRVSCompatible(
        childField.id
      )

      const referenceToAnotherField = fieldsWithDotSeparator.find(
        (f) => f.id === childFieldOcrvsId
      )?.value as FieldReference | undefined

      const childFieldFormikId = makeFormFieldIdFormikCompatible(childField.id)

      const updatedValue = getUpdatedChildValueOnChange({
        childField,
        fieldReference: referenceToAnotherField,
        fieldValues,
        systemVariables
      })

      set(fieldValues, childFieldFormikId, updatedValue)
      set(fieldErrors, childField.id, { errors: [] })
    },
    [fieldsWithDotSeparator, systemVariables]
  )

  const onFieldValueChange = useCallback(
    (formikFieldId: string, value: FieldValue | undefined) => {
      const updatedValues = cloneDeep(values)
      const updatedErrors = cloneDeep(errorsWithDotSeparator)

      const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)

      const children = retrieveChildFields(ocrvsFieldId, fieldsByParentId)

      const interactiveChildren = children.filter(
        (c): c is InteractiveFieldType => !isNonInteractiveFieldType(c)
      )

      // update the value of the field that was changed
      set(updatedValues, formikFieldId, value)

      for (const child of interactiveChildren) {
        setValuesForListenerFields(child, updatedValues, updatedErrors)
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

      const formikChildIds = children.map((child) =>
        makeFormFieldIdFormikCompatible(child.id)
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
      setAllTouchedFields,
      setValuesForListenerFields
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
      {fieldsWithFormikSeparator.map((field) => {
        if (!isFieldVisible(field, completeForm, validatorContext)) {
          return null
        }

        const isDisabled =
          !isFieldEnabled(field, completeForm, validatorContext) ||
          (isCorrection && field.uncorrectable)

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
