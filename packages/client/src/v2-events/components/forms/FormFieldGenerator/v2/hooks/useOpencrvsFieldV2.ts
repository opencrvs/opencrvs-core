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

import { useCallback } from 'react'
import { useField, useFormikContext, FormikErrors } from 'formik'
import { cloneDeep, compact, get, set } from 'lodash'
import {
  EventState,
  FieldConfig,
  FieldReference,
  InteractiveFieldType,
  isNonInteractiveFieldType,
  IndexMap,
  isFieldEnabled,
  AddressType
} from '@opencrvs/commons/client'
import { handleDefaultValue } from '@client/v2-events/hooks/useDefaultValues'
import { useSystemVariables } from '@client/v2-events/hooks/useSystemVariables'
import {
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '../../../utils'
import { makeFormikFieldIdsOpenCRVSCompatible } from '../../utils'
import { useFormState } from './useFormState'

function getParentsOfListenerFields(
  fields: FieldConfig[]
): IndexMap<FieldConfig[]> {
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

function resolveFieldReferenceValue(
  { $$field, $$subfield }: FieldReference,
  fieldValues: EventState
): unknown | undefined {
  const referenceKeyInFormikFormat = makeFormFieldIdFormikCompatible($$field)
  return $$subfield && $$subfield.length > 0
    ? get(fieldValues[referenceKeyInFormikFormat], $$subfield)
    : fieldValues[referenceKeyInFormikFormat]
}

export function useOpencrvsFieldV2<T>(fieldDefinition: FieldConfig) {
  const [field, meta, helpers] = useField<T>(
    makeFormikFieldIdOpenCRVSCompatible(fieldDefinition.id)
  )
  const { validatorContext, isCorrection, formFields, updatePageValues } =
    useFormState()
  const {
    values,
    touched,
    errors: errorsWithDotSeparator,
    setValues,
    setTouched,
    setErrors
  } = useFormikContext<EventState>()

  const systemVariables = useSystemVariables()

  const disabled =
    (fieldDefinition.uncorrectable && isCorrection) ||
    !isFieldEnabled(fieldDefinition, values, validatorContext)

  const listenerFieldsByParentId = getParentsOfListenerFields(formFields)

  const setValueForListenerField = useCallback(
    (
      listenerField: InteractiveFieldType,
      fieldValues: Record<string, unknown>,
      fieldErrors: FormikErrors<EventState>
    ) => {
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
          resolveFieldReferenceValue(reference, fieldValues as EventState)
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
    (formikFieldId: string, value: unknown | undefined) => {
      const updatedValues = cloneDeep(values)
      const updatedErrors = cloneDeep(errorsWithDotSeparator)

      const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)
      const listenerFields = listenerFieldsByParentId[ocrvsFieldId] ?? []
      const interactiveListenerFields = listenerFields.filter(
        (c): c is InteractiveFieldType => !isNonInteractiveFieldType(c)
      )

      set(updatedValues, formikFieldId, value)

      for (const listenerField of interactiveListenerFields) {
        setValueForListenerField(listenerField, updatedValues, updatedErrors)
      }

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

      const updatedTouched = { ...touched }
      for (const fieldId of formikListenerFieldIds) {
        delete updatedTouched[fieldId]
      }

      void setErrors(updatedErrors)
      void setValues(updatedValues)
      void setTouched(updatedTouched)

      const pageValuesInOpencrvsFormat =
        makeFormikFieldIdsOpenCRVSCompatible(updatedValues)
      updatePageValues(pageValuesInOpencrvsFormat)
    },
    [
      values,
      setValues,
      listenerFieldsByParentId,
      setTouched,
      touched,
      errorsWithDotSeparator,
      setErrors,
      setValueForListenerField,
      updatePageValues
    ]
  )

  const onBatchFieldValueChange = useCallback(
    (newValues: Array<{ name: string; value: unknown | undefined }>) => {
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

      const pageValuesInOpencrvsFormat =
        makeFormikFieldIdsOpenCRVSCompatible(updatedValues)
      updatePageValues(pageValuesInOpencrvsFormat)
    },
    [
      values,
      setValues,
      listenerFieldsByParentId,
      setTouched,
      touched,
      errorsWithDotSeparator,
      setErrors,
      setValueForListenerField,
      updatePageValues
    ]
  )

  return [
    {
      ...field,
      onFieldValueChange,
      onBatchFieldValueChange
    },
    { ...meta, disabled },
    helpers
  ] as const
}
