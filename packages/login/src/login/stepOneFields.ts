import * as validations from '../utils/validate'
import { IFieldGroup } from '../type/fields'

export const stepOneFields: IFieldGroup = {
  mobile: {
    id: 'mobile',
    name: 'mobile',
    min: 11,
    validate: [
      validations.required,
      validations.phoneNumberFormat,
      validations.isNumber
    ],
    disabled: false,
    type: 'number'
  },
  password: {
    id: 'password',
    name: 'password',
    validate: [validations.required],
    disabled: false,
    type: 'password'
  }
}
