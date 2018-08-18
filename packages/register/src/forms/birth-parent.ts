import * as validations from '../utils/validate'
export const birthParentFields = [
  {
    name: 'firstName',
    type: 'text',
    label: 'First name',
    validate: [validations.required]
  }
]
