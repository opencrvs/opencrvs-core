import { required, IValidationResult } from '../utils/validate'
import { IFormField, IFormSectionData } from './'
import { getConditionalActionsForField } from '@opencrvs/register/src/forms/utils'
import { IOfflineDataState } from 'src/offline/reducer'

export function getValidationErrorsForField(
  field: IFormField,
  values: IFormSectionData,
  offlineResources?: IOfflineDataState
) {
  const value = values[field.name]
  const conditionalActions = getConditionalActionsForField(
    field,
    values,
    offlineResources
  )

  if (conditionalActions.includes('hide')) {
    return []
  }

  let validators = Array.from(field.validate)

  if (field.required) {
    validators.push(required)
  } else if (!value) {
    validators = []
  }

  return validators
    .map(validator => validator(value))
    .filter(error => error !== undefined) as IValidationResult[]
}

export type Errors = { [key: string]: string }

export function getValidationErrorsForForm(
  fields: IFormField[],
  values: IFormSectionData,
  offlineResources?: IOfflineDataState
): { [key: string]: IValidationResult[] } {
  return fields.reduce((errorsForAllFields: Errors, field) => {
    const validationErrors = getValidationErrorsForField(
      field,
      values,
      offlineResources
    )
    return {
      ...errorsForAllFields,
      [field.name]: validationErrors
    }
  }, {})
}
