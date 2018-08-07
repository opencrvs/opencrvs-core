import * as validations from '../utils/validate'
import { IFieldGroup } from '../utils/fieldUtils'

export const registrationFields: IFieldGroup = {
  firstName: {
    id: 'firstName',
    name: 'firstName',
    validate: [validations.required],
    disabled: false,
    type: 'firstName',
    focusInput: false
  }
}
