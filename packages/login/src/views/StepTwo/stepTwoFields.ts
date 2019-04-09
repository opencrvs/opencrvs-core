import * as validations from '../../utils/validate'
import { IFieldGroup } from '../../utils/fieldUtils'

export const stepTwoFields: IFieldGroup = {
  code: {
    id: 'code',
    name: 'code',
    maxLength: 6,
    validate: [validations.required, validations.isNumber],
    disabled: false,
    type: 'tel',
    focusInput: false
  }
}
