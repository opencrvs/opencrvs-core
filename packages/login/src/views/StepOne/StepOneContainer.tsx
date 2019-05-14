import { connect } from 'react-redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { reduxForm } from 'redux-form'
import { StepOneForm, IProps, IDispatchProps } from './StepOneForm'
import { IStoreState } from '../../store'

import * as actions from '../../login/actions'
import { getSubmissionError, getErrorCode } from '../../login/selectors'

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
})(StepOneForm)

export const StepOneContainer = injectIntl(
  connect<IProps, IDispatchProps, InjectedIntlProps>(
    mapStateToProps,
    mapDispatchToProps
  )(stepOneForm)
)
