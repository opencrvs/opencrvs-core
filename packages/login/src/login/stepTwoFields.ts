import * as validations from '../utils/validate'
import { IFieldGroup } from '../utils/fieldUtils'

export const stepTwoFields: IFieldGroup = {
  code1: {
    id: 'code1',
    name: 'code1',
    maxLength: 1,
    validate: [validations.requiredSymbol],
    disabled: false,
    type: 'number'
  },
  code2: {
    id: 'code2',
    name: 'code2',
    maxLength: 1,
    validate: [validations.requiredSymbol],
    disabled: false,
    type: 'number'
  },
  code3: {
    id: 'code3',
    name: 'code3',
    maxLength: 1,
    validate: [validations.requiredSymbol],
    disabled: false,
    type: 'number'
  },
  code4: {
    id: 'code4',
    name: 'code4',
    maxLength: 1,
    validate: [validations.requiredSymbol],
    disabled: false,
    type: 'number'
  },
  code5: {
    id: 'code5',
    name: 'code5',
    maxLength: 1,
    validate: [validations.requiredSymbol],
    disabled: false,
    type: 'number'
  },
  code6: {
    id: 'code6',
    name: 'code6',
    maxLength: 1,
    validate: [validations.requiredSymbol],
    disabled: false,
    type: 'number'
  }
}
