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

import React, { forwardRef, useCallback, useMemo } from 'react'
import { FormikTouched } from 'formik'
import { isEqual, get, set } from 'lodash'
import {
  EventState,
  FieldConfig,
  InteractiveFieldType,
  isNonInteractiveFieldType,
  FieldReference,
  IndexMap
} from '@opencrvs/commons/client'
import { handleDefaultValue } from '@client/v2-events/hooks/useDefaultValues'
import { useSystemVariables } from '@client/v2-events/hooks/useSystemVariables'
import { makeFormFieldIdFormikCompatible } from '../../utils'
import { FormStateContext } from './hooks/useFormState'
import { FormPage, FormPageRef } from './FormPage'
import { FormFieldGeneratorV2Props } from './types'

function getParentsOfListenerFields(fields: FieldConfig[]) {
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
  const value = fieldValues[$$field]
  return $$subfield && $$subfield.length > 0 ? get(value, $$subfield) : value
}

export const FormFieldGeneratorV2 = forwardRef<
  FormPageRef,
  FormFieldGeneratorV2Props
>(function Component(
  {
    pages,
    currentPageIndex,
    fullForm,
    onFormChange,
    readonlyMode = false,
    validatorContext,
    isCorrection = false,
    fieldsToShowValidationErrors
  },
  ref
) {
  const systemVariables = useSystemVariables()
  const formFields = useMemo(() => pages.flatMap((p) => p.fields), [pages])

  const currentPage = pages[currentPageIndex]
  const pageFields = currentPage.fields

  const listenerFieldsByParentId = useMemo(
    () => getParentsOfListenerFields(formFields),
    [formFields]
  )

  const pageFieldIds = useMemo(
    () => [...new Set(pageFields.map((f) => f.id)).values()],
    [pageFields]
  )

  const initialPageValues = pageFieldIds.reduce((acc, pageFieldId) => {
    acc[pageFieldId] = fullForm[pageFieldId]
    return acc
  }, {} as EventState)

  const initialTouched = (fieldsToShowValidationErrors ?? []).reduce(
    (acc, field) => {
      acc[field.id] = true
      return acc
    },
    {} as FormikTouched<EventState>
  )

  const handleCrossPageParentChild = useCallback(
    (currentValues: EventState, changedFieldId: string): EventState => {
      const updatedValues = { ...currentValues }
      let hasChanges = false

      const listenerFields = listenerFieldsByParentId[changedFieldId] ?? []
      const interactiveListenerFields = listenerFields.filter(
        (c): c is InteractiveFieldType => !isNonInteractiveFieldType(c)
      )

      for (const listenerField of interactiveListenerFields) {
        const listenerFieldFormikId = makeFormFieldIdFormikCompatible(
          listenerField.id
        )

        const listenerFieldConfig = formFields.find(
          (f) => f.id === listenerField.id
        )

        const referencesToOtherFields = ([] as FieldReference[]).concat(
          listenerFieldConfig?.value ?? []
        )

        const firstNonFalsyValue = referencesToOtherFields
          .map((reference) =>
            resolveFieldReferenceValue(reference, updatedValues)
          )
          .find((v) => v)

        if (firstNonFalsyValue) {
          set(updatedValues, listenerFieldFormikId, firstNonFalsyValue)
          hasChanges = true
          continue
        }

        const defaultValue = handleDefaultValue({
          field: listenerField,
          systemVariables
        })

        set(updatedValues, listenerFieldFormikId, defaultValue)
        hasChanges = true
      }

      return hasChanges ? updatedValues : currentValues
    },
    [listenerFieldsByParentId, formFields, systemVariables]
  )

  const updatePageValues = useCallback(
    (pageValues: EventState) => {
      const mergedValues = { ...fullForm, ...pageValues }

      const changedFieldIds = Object.keys(pageValues).filter(
        (key) => !isEqual(pageValues[key], fullForm[key])
      )

      const finalValues = changedFieldIds.reduce(
        (acc, fieldId) => handleCrossPageParentChild(acc, fieldId),
        mergedValues
      )

      onFormChange(finalValues)
    },
    [fullForm, handleCrossPageParentChild, onFormChange]
  )

  const contextValue = useMemo(
    () => ({
      formValues: fullForm,
      pageFields,
      formFields,
      isCorrection,
      readonlyMode,
      validatorContext,
      updatePageValues
    }),
    [
      fullForm,
      pageFields,
      formFields,
      isCorrection,
      readonlyMode,
      validatorContext,
      updatePageValues
    ]
  )

  return (
    <FormStateContext.Provider value={contextValue}>
      <FormPage
        ref={ref}
        initialPageValues={initialPageValues}
        initialTouched={initialTouched}
        pageId={currentPage.id}
      />
    </FormStateContext.Provider>
  )
})
