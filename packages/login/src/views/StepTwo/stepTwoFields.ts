import * as validations from '../../utils/validate'
import { IFieldGroup, IFieldRefGroup } from '../../utils/fieldUtils'
import * as React from 'react'
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

export const fieldRefs: IFieldRefGroup = {
  code: React.createRef()
}
