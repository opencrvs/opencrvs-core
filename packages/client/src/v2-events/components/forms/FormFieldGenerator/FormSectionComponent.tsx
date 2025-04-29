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
  declaration?: EventState
  eventConfig?: EventConfig
  fields: FieldConfig[]
  className?: string
  readonlyMode?: boolean
  errors: Record<string, { errors: { message: TranslationConfig }[] }>
  onChange: (values: EventState) => void
  setAllFieldsDirty: boolean
  setAllTouchedFields: (touchedFields: FormikTouched<EventState>) => void
  fieldsToShowValidationErrors?: FieldConfig[]
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

function getFieldChildIds(
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

export function FormSectionComponent({
  values,
  fields: fieldsWithDotSeparator,
  touched,
  setAllTouchedFields,
  className,
  declaration,
  readonlyMode,
  id,
  errors: errorsWithDotSeparator,
  eventConfig,
  setValues,
  setTouched,
  onChange,
  resetForm,
  setErrors,
  setAllFieldsDirty,
  fieldsToShowValidationErrors
}: AllProps) {
  const intl = useIntl()
  const prevValuesRef = useRef(values)
  const prevIdRef = useRef(id)

  const fieldsWithFormikSeparator = fieldsWithDotSeparator.map((field) => ({
    ...field,
    id: makeFormFieldIdFormikCompatible(field.id)
  }))

  const fieldsByParentId: IndexMap<FieldConfig[]> = useMemo(
    () => groupBy(fieldsWithDotSeparator, (field) => field.parent?._fieldId),
    [fieldsWithDotSeparator]
  )

  const errors = makeFormFieldIdsFormikCompatible(errorsWithDotSeparator)
  const form = makeFormikFieldIdsOpenCRVSCompatible(
    makeDatesFormatted(fieldsWithDotSeparator, values)
  )

  // @TODO: Using deepMerge here will cause e2e tests to fail without noticeable difference in the output.
  // Address is the only deep value.
  const completeForm = { ...(declaration ?? {}), ...form }

  const showValidationErrors = useCallback(
    (formFields: FieldConfig[]) => {
      const touchedForm = formFields.reduce<Record<string, boolean>>(
        (acc, { id: fieldId }) => {
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

      const childIds = getFieldChildIds(ocrvsFieldId, fieldsByParentId)
      const formikChildIds = childIds.map((childId) =>
        makeFormFieldIdFormikCompatible(childId)
      )

      // update the actual value
      set(updatedValues, formikFieldId, value)

      // reset all children values. e.g. When changing informant.relation, empty out phone number, email and others.
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
    if (setAllFieldsDirty) {
      showValidationErrors(fieldsWithDotSeparator)
    }

    focusElementByHash()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const userChangedForm = !isEqual(values, prevValuesRef.current)

    const sectionChanged = prevIdRef.current !== id

    if (userChangedForm) {
      onChange(values)
    }

    if (sectionChanged) {
      resetForm()

      const fieldsToValidate = setAllFieldsDirty
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
    setAllFieldsDirty,
    showValidationErrors
  ])

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
