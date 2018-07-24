import { connect } from 'react-redux'
import { STEP_TWO_FORM } from './constants'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { IProps, IDispatchProps, StepTwoForm } from './StepTwoForm'
import { IStoreState } from '../store'
import * as actions from './loginActions'
import {
  getSubmissionError,
  getResentSMS,
  getStepSubmitting,
  getFieldToFocus
} from './loginSelectors'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: STEP_TWO_FORM,
    submissionError: getSubmissionError(store),
    resentSMS: getResentSMS(store),
    stepSubmitting: getStepSubmitting(store),
    fieldToFocus: getFieldToFocus(store)
  }
}

const mapDispatchToProps = {
  submitAction: actions.startStepTwo,
  onResendSMS: actions.resendSMS
}

const stepTwoForm = reduxForm({
  form: STEP_TWO_FORM
})(injectIntl(StepTwoForm))

export const StepTwoContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm)
