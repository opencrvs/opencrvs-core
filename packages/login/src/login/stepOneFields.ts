import * as validations from '../utils/validate'
import { IFieldGroup } from '../type/fields'

export const stepOneFields: IFieldGroup = {
  mobile: {
    id: 'mobile',
    name: 'mobile',
    maxLength: 11,
    validate: [validations.required, validations.phoneNumberFormat],
    disabled: false,
    type: 'tel'
  },
  password: {
    id: 'password',
    name: 'password',
    validate: [validations.required],
    disabled: false,
    type: 'password'
  }
}
