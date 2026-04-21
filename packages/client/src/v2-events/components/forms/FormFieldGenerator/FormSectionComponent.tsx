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

import React, { useEffect, useRef } from 'react'
import { FormikProps } from 'formik'
import { cloneDeep, set, get, compact, omit, unset, isNil } from 'lodash'
import {
  EventState,
  EventConfig,
  FieldConfig,
  FieldType,
  FieldValue,
  FormState,
  IndexMap,
  isNonInteractiveFieldType,
  InteractiveFieldType,
  FieldReference,
  isFieldEnabled,
  ValidatorContext,
  isFieldVisible,
  findAllFields,
  flattenFieldReference,
  omitHiddenPaginatedFields
} from '@opencrvs/commons/client'
import {
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '@client/v2-events/components/forms/utils'
import { useOnlineStatus } from '@client/utils'
import { useDefaultValue } from '@client/v2-events/hooks/useDefaultValue'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { makeFormikFieldIdsOpenCRVSCompatible } from './utils'
import { FormItem, GeneratedInputField } from './GeneratedInputField'

type AllProps = {
  id: string
  eventConfig?: EventConfig
  fields: FieldConfig[]
  fullForm: EventState
  className?: string
  readonlyMode?: boolean
  /**
   * Update the form values in the non-formik state.
   */
  onFormChange: (cb: (prevForm: EventState) => EventState) => void
  /**
   * Update the touched values in the non-formik state.
   */
  onTouchedChange: (
    cb: (
      prevTouched: IndexMap<FormState<boolean>>
    ) => IndexMap<FormState<boolean>>
  ) => void
  /**
   * If isCorrection is true, fields with configuration option 'uncorrectable' set to true will be disabled.
   */
  isCorrection?: boolean
  validatorContext: ValidatorContext
} & UsedFormikProps

/**
 * Fields are explicitly defined here to avoid confusion between what is actually used out of all the passed props.
 */
type UsedFormikProps = Pick<
  FormikProps<EventState>,
  'values' | 'setTouched' | 'setValues' | 'touched' | 'resetForm'
>

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

/**
 * Create a reference map of visible parent fields and their their children for quick access.
 * This is used to reset the values of child fields when a parent field changes.
 *
 * @returns `Record<parentFieldId, Array<[string[], FieldConfig]>` mapping parent
 * field IDs to their child fields along with their full path from root.
 */
function getParentsOfListenerFields(fields: FieldConfig[]) {
  // Create a reference map of visible parent fields and their their children for quick access.
  // This is used to reset the values of child fields when a parent field changes.
  const fieldsByParentId: IndexMap<Array<[string[], FieldConfig]>> = {}

  for (const field of fields) {
    if (field.type === FieldType.FIELD_GROUP) {
      const subfieldsByParentId = getParentsOfListenerFields(field.fields)
      Object.entries(subfieldsByParentId).forEach(
        ([parent, subfieldWithPath]) => {
          if (!subfieldWithPath) {
            return
          }
          fieldsByParentId[parent] = (fieldsByParentId[parent] ?? []).concat(
            subfieldWithPath.map(([path, subfields]) => [
              [field.id, ...path],
              subfields
            ])
          )
        }
      )
      continue
    }
    const parents = ([] as FieldReference[]).concat(field.parent ?? [])

    for (const parent of parents) {
      const listenersParentId = flattenFieldReference(parent).join('.')
      ;(fieldsByParentId[listenersParentId] ||= []).push([[field.id], field])
    }
  }

  return fieldsByParentId
}

//@todo: this does not work for nested fields, i.e. FIELD_GROUP
/**
 * Applies visibility transitions to fieldValues in place.
 * Fields that became hidden are set to null (and their value cached).
 * Fields that became visible have their cached value restored.
 */
function applyVisibilityTransitions(
  eventConfig: EventConfig,
  prevForm: EventState,
  currentForm: EventState,
  fieldValues: Record<string, FieldValue>,
  validatorContext: ValidatorContext,
  cacheHiddenFieldValue: (key: string, value: FieldValue) => void,
  popHiddenFieldValue: (key: string) => FieldValue | undefined
): void {
  const prevCleaned = omitHiddenPaginatedFields(
    eventConfig.declaration,
    prevForm,
    validatorContext
  )
  const currentCleaned = omitHiddenPaginatedFields(
    eventConfig.declaration,
    currentForm,
    validatorContext
  )

  const newHiddenKeys = Object.keys(prevCleaned).filter(
    (key) => !(key in currentCleaned)
  )
  const newVisibleKeys = Object.keys(currentCleaned).filter(
    (key) => !(key in prevCleaned)
  )

  // When a field transitions from visible to hidden, cache its value and clear it
  newHiddenKeys.forEach((key) => {
    const fieldValue = get(prevCleaned, key)
    if (!isNil(fieldValue)) {
      cacheHiddenFieldValue(key, fieldValue)
      set(fieldValues, makeFormFieldIdFormikCompatible(key), null)
    }
  })

  // When a field transitions from hidden to visible, restore its cached value
  newVisibleKeys.forEach((key) => {
    const cachedValue = popHiddenFieldValue(key)
    if (cachedValue !== undefined) {
      set(fieldValues, makeFormFieldIdFormikCompatible(key), cachedValue)
    }
  })
}

export function FormSectionComponent({
  values,
  fields: pageFields,
  fullForm,
  touched,
  onFormChange,
  onTouchedChange,
  className,
  readonlyMode,
  id,
  eventConfig,
  setValues,
  setTouched,
  resetForm,
  isCorrection = false,
  validatorContext
}: AllProps) {
  'use memo'
  // Conditionals need to be able to react to whether the user is online or not
  useOnlineStatus()
  const prevIdRef = useRef(id)

  const getDefaultValue = useDefaultValue()
  const { cacheHiddenFieldValue, popHiddenFieldValue } = useEventFormData()

  const fullFormFields = eventConfig ? findAllFields(eventConfig) : pageFields
  const listenerFieldsByParentId = getParentsOfListenerFields(fullFormFields)

  /** Sets the value for fields that listen to another field via `parent` and `value` properties */
  const setValueForListenerField = (
    [path, listenerField]: [string[], InteractiveFieldType],
    fieldValues: Record<string, FieldValue>
  ) => {
    // this can be any field. Even though we call this only when parent triggers the change.
    const formikCompatibleListenerFieldPath = path.map(
      makeFormFieldIdFormikCompatible
    )

    const referencesToOtherFields = ([] as FieldReference[]).concat(
      listenerField.value ?? []
    )

    const firstNonFalsyValue = compact(
      referencesToOtherFields.map((reference) =>
        get(
          fieldValues,
          flattenFieldReference(reference).map(makeFormFieldIdFormikCompatible)
        )
      )
    )[0]

    if (firstNonFalsyValue) {
      set(fieldValues, formikCompatibleListenerFieldPath, firstNonFalsyValue)
      return
    }

    const defaultValue = getDefaultValue(listenerField)

    set(fieldValues, formikCompatibleListenerFieldPath, defaultValue)

    return
  }

  const onFieldValueChange = (
    formikFieldId: string,
    value: FieldValue | undefined
  ) => {
    const updatedValues = cloneDeep(values)

    const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)
    const listenerFields = listenerFieldsByParentId[ocrvsFieldId] ?? []
    const interactiveListenerFields = listenerFields.filter(
      (fieldWithPath): fieldWithPath is [string[], InteractiveFieldType] =>
        !isNonInteractiveFieldType(fieldWithPath[1])
    )

    // update the value of the field that was changed
    set(updatedValues, formikFieldId, value)

    for (const listenerField of interactiveListenerFields) {
      setValueForListenerField(listenerField, updatedValues)
    }

    if (eventConfig) {
      const updatedFullForm = {
        ...fullForm,
        ...makeFormikFieldIdsOpenCRVSCompatible(updatedValues)
      }

      applyVisibilityTransitions(
        eventConfig,
        fullForm,
        updatedFullForm,
        updatedValues,
        validatorContext,
        cacheHiddenFieldValue,
        popHiddenFieldValue
      )
    }

    const formikListenerFieldPaths = listenerFields.map(([p]) =>
      p.map(makeFormFieldIdFormikCompatible).join('.')
    )

    const updatedTouched = omit(touched, formikListenerFieldPaths)

    void setValues(updatedValues)
    void setTouched(updatedTouched)
    onFormChange((prevForm) => ({
      ...prevForm,
      ...makeFormikFieldIdsOpenCRVSCompatible(updatedValues)
    }))
    onTouchedChange((prevTouched) => ({
      ...prevTouched,
      ...makeFormikFieldIdsOpenCRVSCompatible(updatedTouched)
    }))
  }

  const onBatchFieldValueChange = (
    newValues: Array<{ name: string; value: FieldValue | undefined }>
  ) => {
    const updatedValues = cloneDeep(values)
    const updatedTouched = cloneDeep(touched)

    for (const { name: formikFieldId, value } of newValues) {
      set(updatedValues, formikFieldId, value)

      const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)
      const listenerFields = listenerFieldsByParentId[ocrvsFieldId] ?? []
      const interactiveListenerFields = listenerFields.filter(
        (fieldWithPath): fieldWithPath is [string[], InteractiveFieldType] =>
          !isNonInteractiveFieldType(fieldWithPath[1])
      )

      for (const listenerField of interactiveListenerFields) {
        setValueForListenerField(listenerField, updatedValues)
        unset(
          updatedTouched,
          listenerField[0].map(makeFormFieldIdFormikCompatible)
        )
      }
    }

    if (eventConfig) {
      const updatedFullForm = {
        ...fullForm,
        ...makeFormikFieldIdsOpenCRVSCompatible(updatedValues)
      }

      applyVisibilityTransitions(
        eventConfig,
        fullForm,
        updatedFullForm,
        updatedValues,
        validatorContext,
        cacheHiddenFieldValue,
        popHiddenFieldValue
      )
    }

    void setValues(updatedValues)
    void setTouched(updatedTouched)
    onFormChange((prevForm) => ({
      ...prevForm,
      ...makeFormikFieldIdsOpenCRVSCompatible(updatedValues)
    }))
    onTouchedChange((prevTouched) => ({
      ...prevTouched,
      ...makeFormikFieldIdsOpenCRVSCompatible(updatedTouched)
    }))
  }

  // This function updates the nested value more performantly than cloning the
  // full object. The field value updates should be refactored to use the same
  // approach too
  function handleBlur(formikFieldId: string, newState?: FormState<boolean>) {
    const formikPath = formikFieldId.split('.')
    const opencrvsPath = formikFieldId
      .split('.')
      .map(makeFormikFieldIdOpenCRVSCompatible)
    function setNested(
      obj: IndexMap<FormState<boolean>> | undefined,
      path: string[]
    ): IndexMap<FormState<boolean>> {
      if (path.length === 1) {
        return {
          ...obj,
          [path[0]]: newState ?? true
        }
      }
      const [part, ...rest] = path
      const nestedObject =
        typeof obj?.[part] === 'object' ? obj[part] : undefined
      return {
        ...obj,
        [part]: setNested(nestedObject, rest)
      }
    }
    void setTouched(
      // @ts-ignore Formik types don't work well with nested values
      setNested(touched as IndexMap<FormState<boolean>>, formikPath)
    )
    onTouchedChange((prevTouched) => setNested(prevTouched, opencrvsPath))
  }

  useEffect(() => {
    focusElementByHash()
  }, [])

  useEffect(() => {
    const sectionChanged = prevIdRef.current !== id

    if (sectionChanged) {
      resetForm()
    }
    prevIdRef.current = id
  }, [id, resetForm])

  return (
    <section className={className}>
      {pageFields.map((field) => {
        if (!isFieldVisible(field, fullForm, validatorContext)) {
          return null
        }
        const formikFieldId = makeFormFieldIdFormikCompatible(field.id)
        const isDisabled =
          !isFieldEnabled(field, fullForm, validatorContext) ||
          (isCorrection && field.uncorrectable)

        return (
          <FormItem
            key={formikFieldId}
            ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
          >
            <GeneratedInputField
              allKnownFields={fullFormFields}
              disabled={isDisabled}
              eventConfig={eventConfig}
              fieldDefinition={{ ...field, id: formikFieldId }}
              form={fullForm}
              name={formikFieldId}
              readonlyMode={readonlyMode}
              validatorContext={validatorContext}
              onBatchFieldValueChange={onBatchFieldValueChange}
              onBlur={handleBlur}
              onFieldValueChange={onFieldValueChange}
            />
          </FormItem>
        )
      })}
    </section>
  )
}
