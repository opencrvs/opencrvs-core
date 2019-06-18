import { IFieldGroup } from '@login/utils/fieldUtils'

export const stepTwoFields: IFieldGroup = {
  code: {
    id: 'code',
    name: 'code',
    maxLength: 6,
    validate: [],
    disabled: false,
    type: 'tel',
    focusInput: true
  }
}
