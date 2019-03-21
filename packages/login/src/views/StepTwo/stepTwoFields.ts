import * as validations from '../../utils/validate'
import { IFieldGroup, IFieldRefGroup } from '../../utils/fieldUtils'
import * as React from 'react'

export const stepTwoFields: IFieldGroup = {
  code1: {
    id: 'code1',
    name: 'code1',
    maxLength: 1,
    validate: [validations.requiredSymbol, validations.isNumber],
    disabled: false,
    type: 'tel',
    focusInput: false
  },
  code2: {
    id: 'code2',
    name: 'code2',
    maxLength: 1,
    validate: [validations.requiredSymbol, validations.isNumber],
    disabled: false,
    type: 'tel',
    focusInput: false
  },
  code3: {
    id: 'code3',
    name: 'code3',
    maxLength: 1,
    validate: [validations.requiredSymbol, validations.isNumber],
    disabled: false,
    type: 'tel',
    focusInput: false
  },
  code4: {
    id: 'code4',
    name: 'code4',
    maxLength: 1,
    validate: [validations.requiredSymbol, validations.isNumber],
    disabled: false,
    type: 'tel',
    focusInput: false
  },
  code5: {
    id: 'code5',
    name: 'code5',
    maxLength: 1,
    validate: [validations.requiredSymbol, validations.isNumber],
    disabled: false,
    type: 'tel',
    focusInput: false
  },
  code6: {
    id: 'code6',
    name: 'code6',
    maxLength: 1,
    validate: [validations.requiredSymbol, validations.isNumber],
    disabled: false,
    type: 'tel',
    focusInput: false
  }
}

export const fieldRefs: IFieldRefGroup = {
  code1: React.createRef(),
  code2: React.createRef(),
  code3: React.createRef(),
  code4: React.createRef(),
  code5: React.createRef(),
  code6: React.createRef()
}
