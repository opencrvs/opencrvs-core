import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { reduxForm } from 'redux-form'
import { IProps, IDispatchProps, StepTwoForm } from './StepTwoForm'
import { IStoreState } from '../store'
import { STEP_TWO_FORM } from '../login/constants'
import * as actions from '../login/actions'
import {
  getSubmissionError,
  getResentSMS,
  getStepSubmitting,
  getStepTwoFormState
} from '../login/selectors'
import { difference } from 'lodash'
import { IReduxFormFieldProps } from '../utils/fieldUtils'
import { stepTwoFields } from './stepTwoFields'

export const getFieldToFocus = (store: IStoreState) => {
  const formState = getStepTwoFormState(store)
  const allFields: IReduxFormFieldProps[] = Object.values(stepTwoFields)
  const completedFields: IReduxFormFieldProps[] = []
  let incompleteFields: IReduxFormFieldProps[] = []
  if (formState) {
    if (formState.values) {
      Object.keys(formState.values).forEach(key => {
        completedFields.push(stepTwoFields[key])
      })
      incompleteFields = difference(allFields, completedFields)
    }
    if (incompleteFields.length > 0) {
      return incompleteFields[0].id
    } else {
      return undefined
    }
  }
  return undefined
}

const mapStateToProps = (store: IStoreState): IProps => {
  return {
    formId: STEP_TWO_FORM,
    submissionError: getSubmissionError(store),
    resentSMS: getResentSMS(store),
    stepSubmitting: getStepSubmitting(store),
    fieldToFocus: getFieldToFocus(store)
  }
}

const mapDispatchToProps = {
  submitAction: actions.startStepTwo,
  onResendSMS: actions.resendSMS
}

const stepTwoForm = reduxForm({
  form: STEP_TWO_FORM
})(injectIntl(StepTwoForm))

export const StepTwoContainer = connect<IProps, IDispatchProps>(
  mapStateToProps,
  mapDispatchToProps
)(stepTwoForm)
