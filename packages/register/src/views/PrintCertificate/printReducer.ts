import { LoopReducer, Loop } from 'redux-loop'
import { printCertificateFormSection } from './print-certificate'
import { Action } from 'redux'
import { IForm } from 'src/forms'

const initialState: IPrintFormState = {
  printCertificateForm: {
    sections: [printCertificateFormSection]
  }
}
export interface IPrintFormState {
  printCertificateForm: IForm
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
