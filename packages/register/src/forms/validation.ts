import { required, IValidationResult } from '../utils/validate'
import { IFormField, IFormSectionData } from './'

export function getValidationErrorsForField(field: IFormField, value: string) {
  const validators = Array.from(field.validate)

  if (field.required) {
    validators.push(required)
  }

  return validators
    .map(validator => validator(value))
    .filter(error => error !== undefined) as IValidationResult[]
}

export type Errors = { [key: string]: string }

export function getValidationErrorsForForm(
  fields: IFormField[],
  values: IFormSectionData
): { [key: string]: IValidationResult[] } {
  return fields.reduce((errorsForAllFields: Errors, field) => {
    const value = values[field.name]
    const validationErrors = getValidationErrorsForField(field, value)
    return {
      ...errorsForAllFields,
      [field.name]: validationErrors
    }
  }, {})
}
