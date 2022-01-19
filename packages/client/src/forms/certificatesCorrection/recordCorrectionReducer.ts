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
  correctRecordBirthSection,
  correctRecordDeathSection
} from '@client/forms/certificatesCorrection/fieldDefinitions/correctRecordSection'
import { correctSupportDocumentSection } from '@client/forms/certificatesCorrection/fieldDefinitions/supportDocumentSection'
import { Action } from 'redux'
import { IFormSection } from '@client/forms'

const initialState: IRecordCorrectionFormState = {
  correctRecordBirthSection: correctRecordBirthSection,
  correctRecordDeathSection: correctRecordDeathSection,
  supportDocumentSection: correctSupportDocumentSection
}
export interface IRecordCorrectionFormState {
  correctRecordBirthSection: IFormSection
  correctRecordDeathSection: IFormSection
  supportDocumentSection: IFormSection
}

export const correctRecordReducer: LoopReducer<
  IRecordCorrectionFormState,
  Action
> = (
  state: IRecordCorrectionFormState = initialState,
  action: Action
): IRecordCorrectionFormState | Loop<IRecordCorrectionFormState, Action> => {
  switch (action.type) {
    default:
      return state
  }
}
