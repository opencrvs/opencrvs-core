/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { LoopReducer, Loop } from 'redux-loop'
import {
  collectBirthCertificateFormSection,
  collectDeathCertificateFormSection
} from '@register/forms/certificate/fieldDefinitions/collectorSection'
import { Action } from 'redux'
import { IFormSection } from '@register/forms'
import { paymentFormSection } from '@register/forms/certificate/fieldDefinitions/payment-section'
import { certificatePreview } from '@register/forms/certificate/fieldDefinitions/preview-section'

const initialState: IPrintFormState = {
  collectBirthCertificateForm: collectBirthCertificateFormSection,
  collectDeathCertificateForm: collectDeathCertificateFormSection,
  paymentForm: paymentFormSection,
  certificatePreviewForm: certificatePreview
}
export interface IPrintFormState {
  collectBirthCertificateForm: IFormSection
  collectDeathCertificateForm: IFormSection
  paymentForm: IFormSection
  certificatePreviewForm: IFormSection
}

export const printReducer: LoopReducer<IPrintFormState, Action> = (
  state: IPrintFormState = initialState,
  action: Action
): IPrintFormState | Loop<IPrintFormState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
