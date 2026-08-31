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

import React, { useEffect } from 'react'
import { FormikProps } from 'formik'
import { cloneDeep, set, get, omit, unset, isNil } from 'lodash'
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
  isCodeToEvaluate,
  buildClientFunctionContext,
  runClientFunction,
  ClientFunctionContext,
  isFieldEnabled,
  ValidatorContext,
  isFieldVisible,
  findAllFields,
  flattenFieldReference,
  getDeclaration,
  omitHiddenPaginatedFields,
  HiddenFieldTypes
} from '@opencrvs/commons/client'
import {
  makeFormFieldIdFormikCompatible,
  makeFormikFieldIdOpenCRVSCompatible
} from '@client/v2-events/components/forms/utils'
import { useOnlineStatus } from '@client/utils'
import { useDefaultValue } from '@client/v2-events/hooks/useDefaultValue'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import {
  makeFormikFieldIdsOpenCRVSCompatible,
  resolveSyncedFieldValue
} from './utils'
import { FormItem, GeneratedInputField } from './GeneratedInputField'

type AllProps = {
  eventConfig?: EventConfig
  fields: FieldConfig[]
  ocrvsFullForm: EventState
  className?: string
  readonlyMode?: boolean
  searchMode?: boolean
  attachmentPath: string
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
  'values' | 'setTouched' | 'setValues' | 'touched'
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
 *
 * Fields in `resetFieldIds` are excluded from the cache: their values were
 * intentionally invalidated by a parent field change, so they are cleared
 * without caching and never restored from a stale cache entry.
 */
function applyVisibilityTransitions({
  eventConfig,
  prevForm,
  currentForm,
  fieldValues,
  validatorContext,
  cacheHiddenFieldValue,
  popHiddenFieldValue,
  resetFieldIds
}: {
  eventConfig: EventConfig
  prevForm: EventState
  currentForm: EventState
  fieldValues: Record<string, FieldValue>
  validatorContext: ValidatorContext
  cacheHiddenFieldValue: (key: string, value: FieldValue) => void
  popHiddenFieldValue: (key: string) => FieldValue | undefined
  resetFieldIds: Set<string>
}): void {
  const prevCleaned = omitHiddenPaginatedFields(
    getDeclaration(eventConfig),
    prevForm,
    validatorContext
  )
  const currentCleaned = omitHiddenPaginatedFields(
    getDeclaration(eventConfig),
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
      if (resetFieldIds.has(key)) {
        // Evict instead of caching — the value was intentionally reset by a parent change
        popHiddenFieldValue(key)
      } else {
        cacheHiddenFieldValue(key, fieldValue)
      }
    }
    // Always null hidden fields — even when prevCleaned has undefined (e.g. after
    // an OAuth redirect where Zustand was wiped and Formik re-initialised the field
    // to undefined), the server may still hold a real value that must be cleared.
    set(fieldValues, makeFormFieldIdFormikCompatible(key), null)
  })

  // When a field transitions from hidden to visible, restore its cached value
  newVisibleKeys.forEach((key) => {
    const cachedValue = popHiddenFieldValue(key)
    if (cachedValue !== undefined && !resetFieldIds.has(key)) {
      set(fieldValues, makeFormFieldIdFormikCompatible(key), cachedValue)
    }
  })
}

export function FormSectionComponent({
  values: formikPageForm,
  fields: pageFields,
  ocrvsFullForm,
  touched,
  onFormChange,
  onTouchedChange,
  className,
  readonlyMode,
  searchMode,
  eventConfig,
  setValues,
  setTouched,
  attachmentPath,
  isCorrection = false,
  validatorContext
}: AllProps) {
  // Conditionals need to be able to react to whether the user is online or not
  useOnlineStatus()

  const getDefaultValue = useDefaultValue()
  const { cacheHiddenFieldValue, popHiddenFieldValue } = useEventFormData()

  /*
   * A field that listens to a parent field is reset to its own default value
   * whenever that parent changes, and the parent can sit on another page — so
   * the whole declaration is searched for listeners, not just this page.
   *
   * That brings a hazard: one field id can name two different configurations.
   * Advanced search renders an address as a group of one field per level, so
   * `child.birthLocation.privateHome` is a FIELD_GROUP here while the
   * declaration still calls it an ADDRESS. Whichever config is found first
   * decides the shape a reset writes — a record of levels, or a single address
   * object. Dropping the declaration's copy of any id this page renders leaves
   * the page's own version to answer.
   */
  const pageFieldIds = new Set(pageFields.map((field) => field.id))
  const fullFormFields = eventConfig
    ? findAllFields(eventConfig)
        .filter((field) => !pageFieldIds.has(field.id))
        .concat(pageFields)
    : pageFields
  const listenerFieldsByParentId = getParentsOfListenerFields(fullFormFields)

  /** Sets the value for fields that listen to another field via `parent` and `value` properties */
  const setValueForListenerField = (
    [path, listenerField]: [string[], InteractiveFieldType],
    fieldValues: Record<string, FieldValue>,
    clientFunctionContext: ClientFunctionContext
  ) => {
    // this can be any field. Even though we call this only when parent triggers the change.
    const formikCompatibleListenerFieldPath = path.map(
      makeFormFieldIdFormikCompatible
    )

    const firstNonFalsyValue = resolveSyncedFieldValue(
      listenerField,
      (syncRef) => {
        /*
         * One path for both kinds of reference: a computed one reads the same
         * value a plain one would, then passes it through its function. Reading
         * it any other way misses references that name a subfield, or a field
         * whose id has dots in it.
         */
        const referenced = get(
          fieldValues,
          flattenFieldReference(syncRef).map(makeFormFieldIdFormikCompatible)
        )

        return isCodeToEvaluate(syncRef)
          ? (runClientFunction(
              syncRef.$$code,
              referenced,
              clientFunctionContext
            ) as FieldValue | undefined)
          : referenced
      }
    )

    if (firstNonFalsyValue) {
      set(fieldValues, formikCompatibleListenerFieldPath, firstNonFalsyValue)
      return
    }

    const formContext = {
      ...ocrvsFullForm,
      ...makeFormikFieldIdsOpenCRVSCompatible(fieldValues)
    }

    // Hidden listener fields are cleared to undefined so their stale values
    // don't leak into other fields that read from them (e.g. via `value` refs).
    // We return early to skip applying the defaultValue, which would otherwise
    // pollute the form state for fields that aren't currently relevant.

    // Must be undefined, never null:
    // null has a specific semantic in the declaration payload — it signals an
    // intentional field removal and is preserved by getCleanedDeclarationDiff
    // (via omitHiddenPaginatedFields with retainNullValues=true). Sending null
    // for fields that were never part of the current action (e.g. correction
    // form fields appearing in a declare payload) corrupts the event state.
    // undefined is omitted from JSON serialisation and is therefore safe.
    if (!isFieldVisible(listenerField, formContext, validatorContext)) {
      set(fieldValues, formikCompatibleListenerFieldPath, undefined)
      return
    }

    const defaultValue = getDefaultValue(listenerField, fieldValues)

    set(fieldValues, formikCompatibleListenerFieldPath, defaultValue)

    return
  }

  const onFieldValueChange = (
    formikFieldId: string,
    value: FieldValue | undefined
  ) => {
    const updatedFormikPageForm = cloneDeep(formikPageForm)

    const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)
    const listenerFields = listenerFieldsByParentId[ocrvsFieldId] ?? []
    const interactiveListenerFields = listenerFields.filter(
      (fieldWithPath): fieldWithPath is [string[], InteractiveFieldType] =>
        !isNonInteractiveFieldType(fieldWithPath[1])
    )

    // update the value of the field that was changed
    set(updatedFormikPageForm, formikFieldId, value)

    const resetFieldIds = new Set<string>()
    const clientFunctionContext = buildClientFunctionContext({
      form: updatedFormikPageForm,
      validatorContext
    })
    for (const listenerField of interactiveListenerFields) {
      const fieldId = listenerField[0].join('.')
      setValueForListenerField(
        listenerField,
        updatedFormikPageForm,
        clientFunctionContext
      )
      // Evict stale cached value and mark the id so applyVisibilityTransitions
      // skips caching/restoring it — the parent reset invalidated it
      popHiddenFieldValue(fieldId)
      resetFieldIds.add(fieldId)
    }

    if (eventConfig) {
      const updatedFullForm = {
        ...ocrvsFullForm,
        ...makeFormikFieldIdsOpenCRVSCompatible(updatedFormikPageForm)
      }

      applyVisibilityTransitions({
        eventConfig,
        prevForm: ocrvsFullForm,
        currentForm: updatedFullForm,
        fieldValues: updatedFormikPageForm,
        validatorContext,
        cacheHiddenFieldValue,
        popHiddenFieldValue,
        resetFieldIds
      })
    }

    const formikListenerFieldPaths = listenerFields.map(([p]) =>
      p.map(makeFormFieldIdFormikCompatible).join('.')
    )

    const updatedTouched = omit(touched, formikListenerFieldPaths)

    void setValues(updatedFormikPageForm)
    void setTouched(updatedTouched)
    onFormChange((prevForm) => ({
      ...prevForm,
      ...makeFormikFieldIdsOpenCRVSCompatible(updatedFormikPageForm)
    }))
    onTouchedChange((prevTouched) => ({
      ...prevTouched,
      ...makeFormikFieldIdsOpenCRVSCompatible(updatedTouched)
    }))
  }

  const onBatchFieldValueChange = (
    newValues: Array<{ name: string; value: FieldValue | undefined }>
  ) => {
    const updatedValues = cloneDeep(formikPageForm)
    const updatedTouched = cloneDeep(touched)

    const resetFieldIds = new Set<string>()
    const clientFunctionContext = buildClientFunctionContext({
      form: updatedValues,
      validatorContext
    })
    for (const { name: formikFieldId, value } of newValues) {
      set(updatedValues, formikFieldId, value)

      const ocrvsFieldId = makeFormikFieldIdOpenCRVSCompatible(formikFieldId)
      const listenerFields = listenerFieldsByParentId[ocrvsFieldId] ?? []
      const interactiveListenerFields = listenerFields.filter(
        (fieldWithPath): fieldWithPath is [string[], InteractiveFieldType] =>
          !isNonInteractiveFieldType(fieldWithPath[1])
      )

      for (const listenerField of interactiveListenerFields) {
        const fieldId = listenerField[0].join('.')
        setValueForListenerField(
          listenerField,
          updatedValues,
          clientFunctionContext
        )
        unset(
          updatedTouched,
          listenerField[0].map(makeFormFieldIdFormikCompatible)
        )
        // Evict stale cached value and mark the id so applyVisibilityTransitions
        // skips caching/restoring it — the parent reset invalidated it
        popHiddenFieldValue(fieldId)
        resetFieldIds.add(fieldId)
      }
    }

    if (eventConfig) {
      const updatedFullForm = {
        ...ocrvsFullForm,
        ...makeFormikFieldIdsOpenCRVSCompatible(updatedValues)
      }

      applyVisibilityTransitions({
        eventConfig,
        prevForm: ocrvsFullForm,
        currentForm: updatedFullForm,
        fieldValues: updatedValues,
        validatorContext,
        cacheHiddenFieldValue,
        popHiddenFieldValue,
        resetFieldIds
      })
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

  return (
    <section className={className}>
      {pageFields.map((field) => {
        if (!isFieldVisible(field, ocrvsFullForm, validatorContext)) {
          return null
        }
        const formikFieldId = makeFormFieldIdFormikCompatible(field.id)
        const isDisabled =
          !isFieldEnabled(field, ocrvsFullForm, validatorContext) ||
          (isCorrection && field.uncorrectable)

        return (
          <FormItem
            key={formikFieldId}
            ignoreBottomMargin={HiddenFieldTypes.some(
              (type) => type === field.type
            )}
          >
            <GeneratedInputField
              allKnownFields={fullFormFields}
              attachmentPath={attachmentPath}
              disabled={isDisabled}
              eventConfig={eventConfig}
              fieldDefinition={{ ...field, id: formikFieldId }}
              name={formikFieldId}
              ocrvsFullForm={ocrvsFullForm}
              readonlyMode={readonlyMode}
              searchMode={searchMode}
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
