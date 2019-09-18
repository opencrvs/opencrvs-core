import { required, IValidationResult } from '@register/utils/validate'
import {
  IFormField,
  IFormSectionData,
  IDynamicFormField,
  IFormData,
  RADIO_GROUP_WITH_NESTED_FIELDS
} from '@register/forms'
import {
  getConditionalActionsForField,
  getFieldValidation
} from '@opencrvs/register/src/forms/utils'
import { IOfflineData } from '@register/offline/reducer'

export function getValidationErrorsForField(
  field: IFormField,
  values: IFormSectionData,
  resources?: IOfflineData,
  drafts?: IFormData
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
    validators.push(required)
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
  drafts?: IFormData
) {
  return fields.reduce((errorsForAllFields: Errors, field) => {
    let validationErrors = getValidationErrorsForField(
      field,
      values,
      resource,
      drafts
    )

    if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
      const nestedFieldsFlatted = Object.entries(field.nestedFields)
        .map(([_, nestedField]) => nestedField)
        .flat()

      // @ts-ignore
      validationErrors = nestedFieldsFlatted.reduce(
        (nestedErrors, nestedField) => {
          return {
            ...nestedErrors,
            // @ts-ignore
            [nestedField.name]: getValidationErrorsForField(
              nestedField,
              // @ts-ignore
              values[field.name],
              resource,
              drafts
            )
          }
        },
        { parent: validationErrors }
      )
    }
    return {
      ...errorsForAllFields,
      [field.name]: validationErrors
    }
  }, {})
}
