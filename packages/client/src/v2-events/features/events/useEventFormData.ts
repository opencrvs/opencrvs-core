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
import { ActionFormData } from '@opencrvs/commons/client'

interface EventFormData {
  formValues: ActionFormData
  setFormValues: (eventId: string, data: ActionFormData) => void
  setInitialFormValues: (eventId: string, data: ActionFormData) => void
  getFormValues: (
    eventId: string,
    initialValues?: ActionFormData
  ) => ActionFormData
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
  eventId: string
}

function removeUndefinedKeys(data: ActionFormData) {
  return Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )
}
/**
 * Interface representing the form data and related operations for an event.
 *
 * @property {ActionFormData} formValues - The current form values.
 * @property {function} setFormValues - Sets the form values for a given event ID. This method should only be used as directly connected to Formik's `onChange` hook.
 * @property {function} setFormValuesIfEmpty - Sets the form values for a given event ID only if they are empty.
 * This method is to be used when initializing the form state on load in form actions. Otherwise, what can happen is the user makes changes, for instance in correction views, reloads the page, and their changes get cleared out once the event is downloaded from the backend.
 * @property {function} getFormValues - Retrieves the form values for a given event ID.
 * @property {function} getTouchedFields - Retrieves the fields that have been touched.
 * @property {function} clear - Clears the form values.
 * @property {string} eventId - The ID of the event.
 */
export const useEventFormData = create<EventFormData>()((set, get) => ({
  formValues: {},
  eventId: '',
  getFormValues: (eventId: string, initialValues?: ActionFormData) =>
    get().eventId === eventId ? get().formValues : initialValues ?? {},
  setFormValues: (eventId: string, data: ActionFormData) => {
    const formValues = removeUndefinedKeys(data)
    return set(() => ({ eventId, formValues }))
  },
  setInitialFormValues: (eventId: string, data: ActionFormData) => {
    return set(() => ({ eventId, formValues: removeUndefinedKeys(data) }))
  },
  getTouchedFields: () =>
    Object.fromEntries(
      Object.entries(get().formValues).map(([key, value]) => [key, true])
    ),
  clear: () => set(() => ({ eventId: '', formValues: {} }))
}))
/**
 * Based on https://github.com/pmndrs/zustand?tab=readme-ov-file#transient-updates-for-often-occurring-state-changes
 *
 * Access state through subscription-pattern to avoid re-renders on every state change
 */
export const useSubscribeEventFormData = () => {
  const stateEventIdRef = useRef(useEventFormData.getState().eventId)
  const stateFormRef = useRef(useEventFormData.getState().formValues)

  useEffect(
    () =>
      useEventFormData.subscribe(
        (state) => (stateEventIdRef.current = state.eventId)
      ),
    []
  )

  useEffect(
    () =>
      useEventFormData.subscribe(
        (state) => (stateFormRef.current = state.formValues)
      ),
    []
  )

  return {
    eventId: stateEventIdRef.current,
    formValues: stateFormRef.current
  }
}
