import { connect } from 'react-redux'
import { STEP_ONE_FORM } from './Constants'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { IStepOneForm, StepOneForm } from './StepOneForm'
import * as actions from './LoginActions'

type StateProps = Partial<IStepOneForm>
type DispatchProps = Partial<IStepOneForm>

const mapStateToProps = (store: any): StateProps => {
  const formId = STEP_ONE_FORM
  return {
    formId
  }
}

const mapDispatchToProps = {
  submitAction: actions.startStepOne
}

const stepOneForm = reduxForm({
  form: STEP_ONE_FORM,
  destroyOnUnmount: true
})(injectIntl(StepOneForm))

export const StepOneContainer = connect<StateProps, DispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepOneForm)
