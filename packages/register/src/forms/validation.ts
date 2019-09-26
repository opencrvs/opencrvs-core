import { required, IValidationResult } from '@register/utils/validate'
import {
  IFormField,
  IFormSectionData,
  IDynamicFormField,
  IFormData
} from '@register/forms'
import {
  getConditionalActionsForField,
  getFieldValidation
} from '@opencrvs/register/src/forms/utils'
import { IOfflineData } from '@register/offline/reducer'
import { MessageDescriptor } from 'react-intl'

export function getValidationErrorsForField(
  field: IFormField,
  values: IFormSectionData,
  resources?: IOfflineData,
  drafts?: IFormData,
  requiredErrorMessage?: MessageDescriptor
) {
  const value = values[field.name]
  const conditionalActions = getConditionalActionsForField(
    field,
    values,
    resources,
    drafts
  )
  if (conditionalActions.includes('hide')) {
    return []
  }

  let validators = Array.from(field.validate)

  validators.push(...getFieldValidation(field as IDynamicFormField, values))

  if (field.required) {
    validators.push(required(requiredErrorMessage))
  } else if (!value) {
    validators = []
  }

  return validators
    .map(validator => validator(value, drafts))
    .filter(error => error !== undefined) as IValidationResult[]
}

export type Errors = { [key: string]: IValidationResult[] }

export function getValidationErrorsForForm(
  fields: IFormField[],
  values: IFormSectionData,
  resource?: IOfflineData,
  drafts?: IFormData,
  requiredErrorMessage?: MessageDescriptor
) {
  return fields.reduce((errorsForAllFields: Errors, field) => {
    const validationErrors = getValidationErrorsForField(
      field,
      values,
      resource,
      drafts,
      requiredErrorMessage
    )
    return {
      ...errorsForAllFields,
      [field.name]: validationErrors
    }
  }, {})
}
