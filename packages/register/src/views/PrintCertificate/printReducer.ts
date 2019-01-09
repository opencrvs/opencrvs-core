import { LoopReducer, Loop } from 'redux-loop'
import { collectCertificateFormSection } from './print-certificate'
import { Action } from 'redux'
import { IFormSection } from 'src/forms'
import { paymentFormSection } from './payment-section'

const initialState: IPrintFormState = {
  collectCertificateFrom: collectCertificateFormSection,
  paymentForm: paymentFormSection
}
export interface IPrintFormState {
  collectCertificateFrom: IFormSection
  paymentForm: IFormSection
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
