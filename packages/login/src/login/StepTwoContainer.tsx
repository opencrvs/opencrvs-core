import { connect } from 'react-redux'
import { STEP_TWO_FORM } from './constants'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { StepTwoForm, IProps, IDispatchProps } from './StepTwoForm'
import { IStoreState } from '../store'
import * as actions from './loginActions'
import { getSubmissionError } from './loginSelectors'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: STEP_TWO_FORM,
    submissionError: getSubmissionError(store)
  }
}

const mapDispatchToProps: IDispatchProps = {
  submitAction: actions.startStepTwo
}

const stepTwoForm = reduxForm({
  form: STEP_TWO_FORM
})(injectIntl(StepTwoForm))

export const StepTwoContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm)
