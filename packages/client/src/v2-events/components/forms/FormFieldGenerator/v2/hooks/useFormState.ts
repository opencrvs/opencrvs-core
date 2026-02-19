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

import { createContext, useContext } from 'react'
import {
  EventState,
  FieldConfig,
  ValidatorContext
} from '@opencrvs/commons/client'

export interface FormStateContextValue {
  formValues: EventState
  pageFields: FieldConfig[]
  formFields: FieldConfig[]
  isCorrection: boolean
  readonlyMode: boolean
  validatorContext: ValidatorContext
  updatePageValues: (pageValues: EventState) => void
}

export const FormStateContext = createContext<FormStateContextValue | null>(
  null
)

export function useFormState() {
  const context = useContext(FormStateContext)
  if (!context) {
    throw new Error(
      'useFormState must be used within FormStateContext.Provider'
    )
  }
  return context
}
