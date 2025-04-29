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
import { cloneDeep, isEqual, set } from 'lodash'
import { WrappedComponentProps as IntlShapeProps } from 'react-intl'
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
  TranslationConfig
} from '@opencrvs/commons/client'
import {
  makeDatesFormatted,
  makeFormFieldIdFormikCompatible
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
} & IntlShapeProps &
  UsedFormikProps

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

export function FormSectionComponent({
  values,
  fields: fieldsWithDotIds,
  touched,
  intl,
  className,
  declaration,
  readonlyMode,
  id,
  errors: propsErrors,
  eventConfig,
  setValues,
  setTouched,
  onChange,
  resetForm,
  setAllFieldsDirty,
  fieldsToShowValidationErrors
}: AllProps) {
  const prevValuesRef = useRef(values)
  const prevIdRef = useRef(id)

  const language = intl.locale
  const fields = fieldsWithDotIds.map((field) => ({
    ...field,
    id: makeFormFieldIdFormikCompatible(field.id)
  }))
  const errors = makeFormFieldIdsFormikCompatible(propsErrors)
  const form = makeFormikFieldIdsOpenCRVSCompatible(
    makeDatesFormatted(fieldsWithDotIds, values)
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

  const setFieldValuesWithDependency = useCallback(
    (fieldId: string, value: FieldValue | undefined) => {
      const updatedValues = cloneDeep(values)
      set(updatedValues, fieldId, value)

      if (fieldId === 'country') {
        const defaultCountry = window.config.COUNTRY || 'FAR'
        set(
          updatedValues,
          'addressType',
          value === defaultCountry
            ? AddressType.DOMESTIC
            : AddressType.INTERNATIONAL
        )
      }

      void setValues(updatedValues)
    },
    [values, setValues]
  )

  useEffect(() => {
    if (setAllFieldsDirty) {
      showValidationErrors(fieldsWithDotIds)
    }

    focusElementByHash()
  }, [setAllFieldsDirty, fieldsWithDotIds, showValidationErrors])

  useEffect(() => {
    const userChangedForm = !isEqual(values, prevValuesRef.current)
    const sectionChanged = prevIdRef.current !== id

    if (userChangedForm) {
      onChange(values)
    }

    if (sectionChanged) {
      resetForm()

      const fieldsToValidate = setAllFieldsDirty
        ? fieldsWithDotIds
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
    fieldsWithDotIds,
    fieldsToShowValidationErrors,
    setAllFieldsDirty,
    showValidationErrors
  ])

  return (
    <section className={className}>
      {fields.map((field) => {
        if (!isFieldVisible(field, completeForm)) {
          return null
        }

        const isDisabled = !isFieldEnabled(field, completeForm)
        const visibleError = errors[field.id]?.errors[0]?.message
        const error = visibleError ? intl.formatMessage(visibleError) : ''

        return (
          <FormItem
            key={`${field.id}${language}`}
            ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
          >
            <Field name={field.id}>
              {({ field: formikField }: FieldProps) => (
                <GeneratedInputField
                  {...formikField}
                  disabled={isDisabled}
                  error={isDisabled ? '' : error}
                  eventConfig={eventConfig}
                  fieldDefinition={field}
                  form={completeForm}
                  readonlyMode={readonlyMode}
                  setFieldValue={setFieldValuesWithDependency}
                  touched={touched[field.id] ?? false}
                />
              )}
            </Field>
          </FormItem>
        )
      })}
    </section>
  )
}
