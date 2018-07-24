import { connect } from 'react-redux'
import { REGISTRATION_FORM } from './constants'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { RegistrationForm, IProps, IDispatchProps } from './RegistrationForm'
import { IStoreState } from '../store'
import * as actions from './registrationActions'
import { getSubmissionError } from './registrationSelectors'

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: REGISTRATION_FORM,
    submissionError: getSubmissionError(store)
  }
}

const mapDispatchToProps = {
  submitAction: actions.startRegistration
}

const registrationForm = reduxForm({
  form: REGISTRATION_FORM
})(injectIntl(RegistrationForm))

export const RegistrationFormContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(registrationForm)
