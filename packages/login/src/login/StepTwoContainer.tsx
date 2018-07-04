import { connect } from 'react-redux'
import { STEP_TWO_FORM } from './constants'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { IStepTwoForm, StepTwoForm } from './StepTwoForm'
import { IStoreState } from '../store'
import * as actions from './loginActions'
import { getSubmissionError } from './loginSelectors'

type StateProps = Partial<IStepTwoForm>
type DispatchProps = Partial<IStepTwoForm>

const mapStateToProps = (store: IStoreState): StateProps => {
  return {
    formId: STEP_TWO_FORM,
    submissionError: getSubmissionError(store)
  }
}

const mapDispatchToProps = {
  submitAction: actions.startStepTwo
}

/* istanbul ignore next */
const stepTwoForm = reduxForm({
  form: STEP_TWO_FORM
})(injectIntl(StepTwoForm))

/* istanbul ignore next */
export const StepTwoContainer = connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm)
