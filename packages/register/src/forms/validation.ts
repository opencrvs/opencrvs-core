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
import { MessageDescriptor } from 'react-intl'

export interface IFieldErrors {
  errors: IValidationResult[]
  nestedFields: {
    [fieldName: string]: IValidationResult[]
  }
}

export type Errors = {
  [fieldName: string]: IFieldErrors
}

const getValidationErrors = {
  forField: function(
    field: IFormField,
    values: IFormSectionData,
    resources?: IOfflineData,
    drafts?: IFormData,
    requiredErrorMessage?: MessageDescriptor
  ) {
    const value =
      field.nestedFields && values[field.name]
        ? (values[field.name] as IFormSectionData).value
        : values[field.name]

    const conditionalActions = getConditionalActionsForField(
      field,
      values,
      resources,
      drafts
    )
    if (conditionalActions.includes('hide')) {
      return {
        errors: [],
        nestedFields: {}
      }
    }

    let validators = Array.from(field.validate)

    validators.push(...getFieldValidation(field as IDynamicFormField, values))

    if (field.required) {
      validators.push(required(requiredErrorMessage))
    } else if (!value) {
      validators = []
    }

    const validationResults = validators
      .map(validator => validator(value, drafts))
      .filter(error => error !== undefined) as IValidationResult[]

    return {
      errors: validationResults,
      nestedFields: this.forNestedField(
        field,
        values,
        resources,
        drafts,
        requiredErrorMessage
      )
    }
  },
  forNestedField: function(
    field: IFormField,
    values: IFormSectionData,
    resource?: IOfflineData,
    drafts?: IFormData,
    requiredErrorMessage?: MessageDescriptor
  ): {
    [fieldName: string]: IValidationResult[]
  } {
    if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
      const parentValue =
        values[field.name] && (values[field.name] as IFormSectionData).value
      const nestedFieldDefinitions =
        (parentValue && field.nestedFields[parentValue as string]) || []
      return nestedFieldDefinitions.reduce((nestedErrors, nestedField) => {
        const errors = this.forField(
          nestedField,
          (values[field.name] as IFormSectionData)
            .nestedFields as IFormSectionData,
          resource,
          drafts,
          requiredErrorMessage
        ).errors

        return {
          ...nestedErrors,
          [nestedField.name]: errors
        }
      }, {})
    }

    return {}
  }
}
export function getValidationErrorsForForm(
  fields: IFormField[],
  values: IFormSectionData,
  resource?: IOfflineData,
  drafts?: IFormData,
  requiredErrorMessage?: MessageDescriptor
) {
  return fields.reduce(
    (errorsForAllFields: Errors, field) => ({
      ...errorsForAllFields,
      [field.name]: getValidationErrors.forField(
        field,
        values,
        resource,
        drafts,
        requiredErrorMessage
      )
    }),
    {}
  )
}
