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

import { createContext, useCallback, useContext } from 'react'
import { FormikErrors, useField, useFormikContext } from 'formik'
import { cloneDeep, compact, get, omit, set } from 'lodash'
import {
  EventState,
  FieldConfig,
  FieldValue,
  ValidatorContext,
  isFieldEnabled,
  isFieldVisible,
  FieldReference,
  IndexMap,
  omitHiddenFields,
  InteractiveFieldType,
  isNonInteractiveFieldType,
  AddressType
} from '@opencrvs/commons/client'
import { handleDefaultValue } from '@client/v2-events/hooks/useDefaultValues'
import { useSystemVariables } from '@client/v2-events/hooks/useSystemVariables'
import {
  makeDatesFormatted,
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '../utils'
import { makeFormikFieldIdsOpenCRVSCompatible } from './utils'

export const OpencrvsFormContext = createContext<{
  pageFields: FieldConfig[]
  formFields: FieldConfig[]
  /**
   * If isCorrection is true, fields with configuration option
   * 'uncorrectable' set to true will be disabled.
   */
  isCorrection: boolean
  readonlyMode: boolean
  validatorContext: ValidatorContext
} | null>(null)

export function useOpencrvsFormContext() {
  const context = useContext(OpencrvsFormContext)

  if (!context) {
    throw new Error(
      'useOpencrvsFormContext must be used within an OpencrvsFormContext.Provider'
    )
  }
  return context
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

export function useVisibleFields(fields: FieldConfig[]) {
  const { formFields, validatorContext } = useOpencrvsFormContext()
  const { values } = useFormikContext<EventState>()
  const visibleFieldValues = omitHiddenFields(
    formFields,
    values,
    validatorContext
  )
  return fields.filter((field) =>
    isFieldVisible(field, visibleFieldValues, validatorContext)
  )
}

export function useOpencrvsField<T>(fieldDefinition: FieldConfig) {
  const [field, meta, helpers] = useField<T>(
    makeFormikFieldIdOpenCRVSCompatible(fieldDefinition.id)
  )
  const { validatorContext, isCorrection, formFields } =
    useOpencrvsFormContext()
  const {
    values,
    touched,
    errors: errorsWithDotSeparator,
    setValues,
    setTouched,
    setErrors
  } = useFormikContext<EventState>()

  // @todo: move the date format to date field
  // and just use plain values
  const form = makeFormikFieldIdsOpenCRVSCompatible(
    makeDatesFormatted(formFields, values)
  )

  const systemVariables = useSystemVariables()

  const disabled =
    (fieldDefinition.uncorrectable && isCorrection) ||
    !isFieldEnabled(fieldDefinition, values, validatorContext)

  const listenerFieldsByParentId = getParentsOfListenerFields(formFields)

  /** Sets the value for fields that listen to another field via `parent` and `value` properties */
  const setValueForListenerField = useCallback(
    (
      listenerField: InteractiveFieldType,
      fieldValues: Record<string, FieldValue>,
      fieldErrors: FormikErrors<EventState>
    ) => {
      // this can be any field. Even though we call this only when parent triggers the change.
      const listenerFieldOcrvsId = makeFormikFieldIdOpenCRVSCompatible(
        listenerField.id
      )

      const listenerFieldConfig = formFields.find(
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
    [formFields, systemVariables]
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
    },
    [
      values,
      setValues,
      listenerFieldsByParentId,
      setTouched,
      touched,
      errorsWithDotSeparator,
      setErrors,
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
    },
    [
      values,
      setValues,
      listenerFieldsByParentId,
      setTouched,
      touched,
      errorsWithDotSeparator,
      setErrors,
      setValueForListenerField
    ]
  )

  return [
    {
      ...field,
      /** non-native onChange. Updates Formik state by updating
       * the value and its dependencies
       */
      onFieldValueChange,
      onBatchFieldValueChange
    },
    { ...meta, disabled },
    helpers,
    form
  ] as const
}
