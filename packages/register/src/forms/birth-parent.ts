import * as validations from '../utils/validate'
import { IForm } from './'

export const birthParentForm: IForm = {
  tabs: [
    {
      id: 'child',
      name: 'Child',
      title: "Child's details",
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: 'First name',
          validate: [validations.required]
        }
      ]
    },
    {
      id: 'mother',
      name: 'Mother',
      title: "Mother's details",
      fields: [
        {
          name: 'firstName',
          type: 'text',
          label: "Mother's first name",
          validate: [validations.required]
        }
      ]
    }
  ]
}
