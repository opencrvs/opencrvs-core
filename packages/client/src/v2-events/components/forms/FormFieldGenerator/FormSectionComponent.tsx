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
import { cloneDeep, set, get, compact, omit, unset } from 'lodash'
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
  omitHiddenFields,
  isFieldEnabled,
  ValidatorContext,
  isFieldVisible,
  findAllFields,
  flattenFieldReference,
  flattenFormState
} from '@opencrvs/commons/client'
import {
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '@client/v2-events/components/forms/utils'
import { useOnlineStatus } from '@client/utils'
import { useDefaultValue } from '@client/v2-events/hooks/useDefaultValue'
import { makeFormikFieldIdsOpenCRVSCompatible } from './utils'
import { FormItem, GeneratedInputField } from './GeneratedInputField'

type AllProps = {
  id: string
  eventConfig?: EventConfig
  fields: FieldConfig[]
  fullForm: EventState
  className?: string
  readonlyMode?: boolean
  errors: IndexMap<string>
  /**
   * Update the form values in the non-formik state.
   */
  onFormChange: (cb: (prevForm: EventState) => EventState) => void
  onTouchedChange: (
    cb: (
      prevTouched: IndexMap<FormState<boolean>>
    ) => IndexMap<FormState<boolean>>
  ) => void
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
  validatorContext: ValidatorContext
} & UsedFormikProps

/**
 * Fields are explicitly defined here to avoid confusion between what is actually used out of all the passed props.
 */
type UsedFormikProps = Pick<
  FormikProps<EventState>,
  'values' | 'setTouched' | 'setValues' | 'touched' | 'resetForm' | 'setErrors'
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
 * field IDs to their child fields. The parentFieldId is the full path of the field
 * where nested fields are concatenated together
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

// @TODO: Clarify and unify the naming of the props. What is from formik and what is from the state.
export function FormSectionComponent({
  values,
  fields: fieldsWithDotSeparator,
  fullForm,
  touched,
  onFormChange,
  onTouchedChange,
  className,
  readonlyMode,
  id,
  errors,
  eventConfig,
  setValues,
  setTouched,
  resetForm,
  validateAllFields,
  onAllFieldsValidated,
  isCorrection = false,
  validatorContext
}: AllProps) {
  // Conditionals need to be able to react to whether the user is online or not -
  useOnlineStatus()
  const prevIdRef = useRef(id)

  const getDefaultValue = useDefaultValue()

  const fieldsWithFormikSeparator = fieldsWithDotSeparator.map((field) => ({
    ...field,
    id: makeFormFieldIdFormikCompatible(field.id)
  }))

  const allFieldsWithDotSeparator = eventConfig
    ? findAllFields(eventConfig)
    : fieldsWithDotSeparator
  const listenerFieldsByParentId = getParentsOfListenerFields(
    allFieldsWithDotSeparator
  )

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

  useEffect(() => {
    if (validateAllFields) {
      const flatennedErrors = flattenFormState(
        errors as IndexMap<FormState<string>>
      ).flatMap(([, errs]) => errs)

      onAllFieldsValidated?.(flatennedErrors.length === 0)
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
    fullForm,
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

        return (
          <FormItem
            key={field.id}
            ignoreBottomMargin={field.type === FieldType.PAGE_HEADER}
          >
            <GeneratedInputField
              allKnownFields={allFieldsWithDotSeparator}
              disabled={isDisabled}
              eventConfig={eventConfig}
              fieldDefinition={field}
              form={fullForm}
              name={field.id}
              readonlyMode={readonlyMode}
              validatorContext={validatorContext}
              onBatchFieldValueChange={onBatchFieldValueChange}
              onBlur={(formikFieldId, newTouched) => {
                // @ts-ignore Formik types don't work well with nested values
                void setTouched({ ...touched, [formikFieldId]: newTouched })
                onTouchedChange((prevTouched) => ({
                  ...prevTouched,
                  [makeFormikFieldIdOpenCRVSCompatible(formikFieldId)]:
                    newTouched
                }))
              }}
              onFieldValueChange={onFieldValueChange}
            />
          </FormItem>
        )
      })}
    </section>
  )
}
