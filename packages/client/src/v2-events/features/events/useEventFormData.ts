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

import { useEffect, useRef } from 'react'
import { create } from 'zustand'
import { FormikTouched } from 'formik'
import { EventState } from '@opencrvs/commons/client'

interface EventFormData {
  formValues: null | EventState
  setFormValues: (data: EventState) => void
  getFormValues: (initialValues?: EventState) => EventState
  getTouchedFields: () => Record<string, boolean>
  touchedFields: FormikTouched<EventState>
  setAllTouchedFields: (touchedFields: FormikTouched<EventState>) => void
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
export const useEventFormData = create<EventFormData>()((set, get) => ({
  formValues: {},
  touchedFields: {},
  getFormValues: (initialValues?: EventState) =>
    get().formValues || initialValues || {},
  setFormValues: (form: EventState) => {
    const formValues = removeUndefinedKeys(form)
    return set(() => ({ formValues }))
  },
  setAllTouchedFields: (fields) => set(() => ({ touchedFields: fields })),
  getTouchedFields: () =>
    Object.fromEntries(
      Object.entries(get().getFormValues()).map(([key]) => [key, true])
    ),
  clear: () => set(() => ({ formValues: {}, touchedFields: {} }))
}))
/**
 * Based on https://github.com/pmndrs/zustand?tab=readme-ov-file#transient-updates-for-often-occurring-state-changes
 *
 * Access state through subscription-pattern to avoid re-renders on every state change
 */
export const useSubscribeEventFormData = () => {
  const stateFormRef = useRef(useEventFormData.getState().getFormValues())

  useEffect(
    () =>
      useEventFormData.subscribe(
        (state) => (stateFormRef.current = state.getFormValues())
      ),
    []
  )

  return {
    formValues: stateFormRef.current
  }
}
