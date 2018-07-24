import { LoginState } from './loginReducer'
import { IStoreState } from '../store'
import { FormStateMap } from 'redux-form'
import { stepTwoFields } from './stepTwoFields'
import { IReduxFormFieldProps } from '../utils/fieldUtils'
import { difference } from 'lodash'

const getPartialState = (store: IStoreState): LoginState => store.login
const getPartialFormState = (store: IStoreState): FormStateMap => store.form

function getKey<K extends keyof LoginState>(store: IStoreState, key: K) {
  return getPartialState(store)[key]
}

function getFormKey<K extends keyof FormStateMap>(store: IStoreState, key: K) {
  return getPartialFormState(store)[key]
}

export const getSubmissionError = (
  store: IStoreState
): LoginState['submissionError'] => getKey(store, 'submissionError')

export const getResentSMS = (store: IStoreState): LoginState['resentSMS'] =>
  getKey(store, 'resentSMS')

export const getStepSubmitting = (
  store: IStoreState
): LoginState['stepSubmitting'] => getKey(store, 'stepSubmitting')

export const getStepTwoFormState = (
  store: IStoreState
): FormStateMap['STEP_TWO'] => getFormKey(store, 'STEP_TWO')

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
      return 'code1'
    }
  }
  return undefined
}
