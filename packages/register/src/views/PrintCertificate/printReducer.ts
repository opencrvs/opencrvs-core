import { LoopReducer, Loop } from 'redux-loop'
import { collectCertificateFormSection } from './print-certificate'
import { Action } from 'redux'
import { IFormSection } from 'src/forms'
import { paymentFormSection } from './payment-section'
import { certificatePreview } from './certificate-preview'

const initialState: IPrintFormState = {
  collectCertificateFrom: collectCertificateFormSection,
  paymentForm: paymentFormSection,
  certificatePreviewForm: certificatePreview
}
export interface IPrintFormState {
  collectCertificateFrom: IFormSection
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
