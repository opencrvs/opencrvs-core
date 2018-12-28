import { LoopReducer, Loop } from 'redux-loop'
import { collectCertificateFormSection } from './print-certificate'
import { Action } from 'redux'
import { IFormSection } from 'src/forms'

const initialState: IPrintFormState = {
  collectCertificateFrom: collectCertificateFormSection
}
export interface IPrintFormState {
  collectCertificateFrom: IFormSection
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
