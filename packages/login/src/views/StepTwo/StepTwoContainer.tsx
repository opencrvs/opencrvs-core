import { difference } from 'lodash'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { IProps, IDispatchProps, StepTwoForm } from './StepTwoForm'
import { IStoreState } from '../../store'

import * as actions from '../../login/actions'
import {
  getSubmissionError,
  getResentSMS,
  getsubmitting,
  getStepTwoFormState
} from '../../login/selectors'
import { IReduxFormFieldProps } from '../../utils/fieldUtils'
import { stepTwoFields } from './stepTwoFields'
import { FORM_NAME } from '@opencrvs/login/src/views/StepTwo/contants'

export const getFieldToFocus = (store: IStoreState) => {
  const formState = getStepTwoFormState(store)
  const allFields: IReduxFormFieldProps[] = Object.values(stepTwoFields)

  if (!formState || !formState.values) {
    return null
  }

  const completedFields: IReduxFormFieldProps[] = Object.keys(
    formState.values
  ).map(key => stepTwoFields[key])

  const incompleteFields = difference(allFields, completedFields)

  if (incompleteFields.length > 0) {
    return incompleteFields[0].id
  }

  return null
}

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: FORM_NAME,
    submissionError: getSubmissionError(store),
    resentSMS: getResentSMS(store),
    submitting: getsubmitting(store),
    fieldToFocus: getFieldToFocus(store)
  }
}

const mapDispatchToProps = {
  submitAction: actions.verifyCode,
  onResendSMS: actions.resendSMS
}

const stepTwoForm = reduxForm({
  form: FORM_NAME
})(injectIntl(StepTwoForm))

export const StepTwoContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm)
