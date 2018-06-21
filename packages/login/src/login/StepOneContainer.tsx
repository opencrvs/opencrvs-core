import { connect } from 'react-redux'
import { STEP_ONE_FORM } from './constants'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { IStepOneForm, StepOneForm } from './StepOneForm'

import * as actions from './loginActions'
import { IStoreState } from '../store'

type StateProps = Partial<IStepOneForm>
type DispatchProps = Partial<IStepOneForm>

const mapStateToProps = (store: IStoreState): StateProps => {
  const formId = STEP_ONE_FORM
  return {
    formId
  }
}

const mapDispatchToProps = {
  submitAction: actions.startStepOne
}

const stepOneForm = reduxForm({
  form: STEP_ONE_FORM
})(injectIntl(StepOneForm))

export const StepOneContainer = connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepOneForm)
