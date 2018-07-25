import { FormStateMap } from 'redux-form'
import { IReduxFormFieldProps } from '../../utils/fieldUtils'
import { stepTwoFields } from '../stepTwoFields'
import { difference } from 'lodash'

export const getFieldToFocus = (formState: FormStateMap['STEP_TWO']) => {
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
