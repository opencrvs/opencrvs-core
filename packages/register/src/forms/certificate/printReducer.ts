import { LoopReducer, Loop } from 'redux-loop'
import { collectCertificateFormSection } from './fieldDefinitions/collector-section'
import { Action } from 'redux'
import { IFormSection } from 'src/forms'
import { paymentFormSection } from './fieldDefinitions/payment-section'
import { certificatePreview } from './fieldDefinitions/preview-section'

const initialState: IPrintFormState = {
  collectCertificateForm: collectCertificateFormSection,
  paymentForm: paymentFormSection,
  certificatePreviewForm: certificatePreview
}
export interface IPrintFormState {
  collectCertificateForm: IFormSection
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
