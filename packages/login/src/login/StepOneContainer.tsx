import { connect } from 'react-redux'
import { STEP_ONE_FORM } from './constants'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { StepOneForm, IProps, IDispatchProps } from './StepOneForm'
import { IStoreState } from '../store'
import * as actions from './loginActions'
import { getSubmissionError } from './loginSelectors'

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
