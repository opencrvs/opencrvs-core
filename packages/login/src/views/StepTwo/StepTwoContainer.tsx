import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import {
  IProps,
  IDispatchProps,
  StepTwoForm,
  FullProps
} from '@login/views/StepTwo/StepTwoForm'
import { IStoreState } from '@login/store'

import * as actions from '@login/login/actions'
import {
  getSubmissionError,
  getResentSMS,
  getsubmitting
} from '@login/login/selectors'

const FORM_NAME = 'STEP_TWO'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: FORM_NAME,
    submissionError: getSubmissionError(store),
    resentSMS: getResentSMS(store),
    submitting: getsubmitting(store),
    stepOneDetails: { mobile: store.login.stepOneDetails.mobile }
  }
}

const mapDispatchToProps: IDispatchProps = {
  submitAction: actions.verifyCode,
  onResendSMS: actions.resendSMS
}

const stepTwoForm = reduxForm({
  form: FORM_NAME
})(injectIntl(StepTwoForm) as any)

export const StepTwoContainer = connect<
  IProps,
  IDispatchProps,
  FullProps,
  IStoreState
>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm) as any
