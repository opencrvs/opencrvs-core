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
} from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { Action } from 'redux'
import * as offlineActions from '@client/offline/actions'
import { CertificateSection, IFormSection } from '@client/forms'
import { paymentFormSection } from '@client/forms/certificate/fieldDefinitions/payment-section'
import { certificatePreview } from '@client/forms/certificate/fieldDefinitions/preview-section'
import { deserializeForm } from '@client/forms/mappings/deserializer'

const initialState: IPrintFormState = {
  collectBirthCertificateForm: {} as IFormSection,
  collectDeathCertificateForm: {} as IFormSection,
  paymentForm: paymentFormSection,
  certificatePreviewForm: {} as IFormSection,
  certCollectorGroupApplicationFormSection: {} as IFormSection
}
export interface IPrintFormState {
  collectBirthCertificateForm: IFormSection
  collectDeathCertificateForm: IFormSection
  paymentForm: IFormSection
  certificatePreviewForm: IFormSection
  certCollectorGroupApplicationFormSection: IFormSection
}

export const printReducer: LoopReducer<IPrintFormState, Action> = (
  state: IPrintFormState = initialState,
  action: Action | offlineActions.Action
): IPrintFormState | Loop<IPrintFormState, Action> => {
  switch (action.type) {
    case offlineActions.READY:
    case offlineActions.DEFINITIONS_LOADED:
      const {
        collectorForm
      } = (action as offlineActions.DefinitionsLoadedAction).payload.forms
      const form = deserializeForm(collectorForm)
      const previewFormSection = form.sections.find(
        section => section.id === CertificateSection.CertificatePreview
      )
      //TODO :: do not use index number
      return {
        ...state,
        collectBirthCertificateForm: form.sections[0],
        collectDeathCertificateForm: form.sections[1],
        certificatePreviewForm: previewFormSection as IFormSection,
        certCollectorGroupApplicationFormSection: form.sections[3]
      }
    default:
      return state
  }
}
