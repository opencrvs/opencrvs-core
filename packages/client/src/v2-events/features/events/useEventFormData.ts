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
import { create } from 'zustand'
import {
  EventState,
  FormState,
  IndexMap,
  FieldValue
} from '@opencrvs/commons/client'

type FormTouched = IndexMap<FormState<boolean>>

interface EventFormData {
  formValues: null | EventState
  setFormValues: (data: EventState) => void
  getFormValues: (initialValues?: EventState) => EventState
  formTouched: FormTouched
  setFormTouched: (formTouched: FormTouched) => void
  getFormTouched: (initialTouched?: FormTouched) => FormTouched
  hiddenFieldCache: null | EventState
  cacheHiddenFieldValue: (fieldId: string, value: FieldValue) => void
  popHiddenFieldValue: (fieldId: string) => FieldValue
  clear: () => void
}

function removeUndefinedKeys(data: EventState) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )
}

/**
 * Interface representing the form data and related operations for an event.
 *
 * @property {EventState} formValues - The current form values.
 * @property {FormikTouched<EventState>} touchedFields - The current touched fields.
 * @property {function} setFormValues - Sets the form values. This method should only be used as directly connected to Formik's `onChange` hook.
 * @property {function} setFormValuesIfEmpty - Sets the form values only if they are empty.
 * This method is to be used when initializing the form state on load in form actions. Otherwise, what can happen is the user makes changes, for instance in correction views, reloads the page, and their changes get cleared out once the event is downloaded from the backend.
 * @property {function} getFormValues - Retrieves the form values.
 * @property {function} setAllTouchedFields - Sets the fields that have been touched.
 * @property {function} getTouchedFields - Retrieves the fields that have been touched.
 * @property {function} clear - Clears the form values.
 */
export const useEventFormData = create<EventFormData>()((set, get) => {
  return {
    formValues: {},
    formTouched: {},
    hiddenFieldCache: {},

    getFormValues: (initialValues?: EventState) =>
      get().formValues || initialValues || {},

    setFormValues: (form: EventState) => {
      const formValues = removeUndefinedKeys(form)
      return set(() => ({ formValues }))
    },

    getFormTouched: (initialTouched) => {
      return { ...initialTouched, ...get().formTouched }
    },

    setFormTouched: (formTouched) => set(() => ({ formTouched })),

    cacheHiddenFieldValue: (fieldId: string, value: FieldValue) => {
      set((state) => ({
        hiddenFieldCache: {
          ...state.hiddenFieldCache,
          [fieldId]: value
        }
      }))
    },

    popHiddenFieldValue: (fieldId: string) => {
      const state = get()
      const value = state.hiddenFieldCache?.[fieldId]

      if (value !== undefined && state.hiddenFieldCache) {
        const { [fieldId]: _, ...rest } = state.hiddenFieldCache
        set(() => ({ hiddenFieldCache: rest }))
      }

      return value
    },

    clear: () => {
      set(() => ({ formValues: {}, formTouched: {}, hiddenFieldCache: {} }))
    }
  }
})
