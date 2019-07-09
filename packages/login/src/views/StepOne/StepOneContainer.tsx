import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import {
  StepOneForm,
  IProps,
  IDispatchProps,
  FullProps
} from '@login/views/StepOne/StepOneForm'
import { IStoreState } from '@login/store'

import * as actions from '@login/login/actions'
import { getSubmissionError, getErrorCode } from '@login/login/selectors'

const FORM_NAME = 'STEP_ONE'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: FORM_NAME,
    submissionError: getSubmissionError(store),
    errorCode: getErrorCode(store)
  }
}

const mapDispatchToProps = {
  submitAction: actions.authenticate
}

const stepOneForm = reduxForm({
  form: FORM_NAME
})(injectIntl(StepOneForm) as any)

export const StepOneContainer = connect<
  IProps,
  IDispatchProps,
  FullProps,
  IStoreState
>(
  mapStateToProps,
  mapDispatchToProps
)(stepOneForm) as any
