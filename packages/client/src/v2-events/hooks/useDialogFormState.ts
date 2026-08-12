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
import { useCallback, useState } from 'react'
import { EventState, FormState, IndexMap } from '@opencrvs/commons/client'

/**
 * Controlled form state for FormFieldGenerator instances rendered in dialogs.
 *
 * FormFieldGenerator validates on touch, not on change. Blur-committing
 * inputs (e.g. TEXT) write their value after the touch-validation has
 * already run, leaving a stale required-error behind. Feeding the values
 * back in makes the generator reinitialise and revalidate against the
 * committed values; the touched state must be fed back too, since
 * reinitialising would otherwise reset it and hide errors on fields the
 * user has already visited.
 *
 * Spread the returned object onto FormFieldGenerator and use `formValues`
 * for validation/submission of the dialog.
 */
export function useDialogFormState() {
  const [formValues, setFormValues] = useState<EventState>({})
  const [formTouched, setFormTouched] = useState<IndexMap<FormState<boolean>>>(
    {}
  )

  const onFormChange = useCallback((values: EventState) => {
    setFormValues((prev) => ({ ...prev, ...values }))
  }, [])

  return {
    formValues,
    formTouched,
    onFormChange,
    onTouchedChange: setFormTouched
  }
}
