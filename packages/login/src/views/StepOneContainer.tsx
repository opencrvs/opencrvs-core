import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { StepOneForm, IProps, IDispatchProps } from './StepOneForm'
import { IStoreState } from '../store'
import { STEP_ONE_FORM } from '../login/constants'
import * as actions from '../login/actions'
import { getSubmissionError } from '../login/selectors'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: STEP_ONE_FORM,
    submissionError: getSubmissionError(store)
  }
}

const mapDispatchToProps = {
  submitAction: actions.startStepOne
}

const stepOneForm = reduxForm({
  form: STEP_ONE_FORM
})(injectIntl(StepOneForm))

export const StepOneContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepOneForm)
