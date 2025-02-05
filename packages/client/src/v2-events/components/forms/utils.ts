/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { isString, defaultTo } from 'lodash'
import { formatISO } from 'date-fns'
import { IntlShape } from 'react-intl'
import {
  ActionFormData,
  BaseField,
  ConditionalParameters,
  FieldConfig,
  FieldType,
  FieldValue,
  validate
} from '@opencrvs/commons/client'
import { DependencyInfo } from '@client/forms'
// eslint-disable-next-line no-restricted-imports
import { ILocation } from '@client/offline/reducer'
import { countries } from '@client/utils/countries'

export function handleInitialValue(
  field: FieldConfig,
  formData: ActionFormData
) {
  const initialValue = field.initialValue

  if (hasInitialValueDependencyInfo(initialValue)) {
    return evalExpressionInFieldDefinition(initialValue.expression, {
      $form: formData
    })
  }

  return initialValue
}

export function isFormFieldVisible(field: FieldConfig, form: ActionFormData) {
  return getConditionalActionsForField(field, {
    $form: form,
    $now: formatISO(new Date(), {
      representation: 'date'
    })
  }).every((fieldAction) => fieldAction !== 'HIDE')
}

export function getConditionalActionsForField(
  field: FieldConfig,
  values: ConditionalParameters
) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) => validate(conditional.conditional, values))
    .map((conditional) => conditional.type)
}

export function evalExpressionInFieldDefinition(
  expression: string,
  /*
   * These are used in the eval expression
   */
  { $form }: { $form: ActionFormData }
) {
  // eslint-disable-next-line no-eval
  return eval(expression) as FieldValue
}

export function hasInitialValueDependencyInfo(
  value: BaseField['initialValue']
): value is DependencyInfo {
  return typeof value === 'object' && 'dependsOn' in value
}

export function getDependentFields(
  fields: FieldConfig[],
  fieldName: string
): FieldConfig[] {
  return fields.filter((field) => {
    if (!field.initialValue) {
      return false
    }
    if (!hasInitialValueDependencyInfo(field.initialValue)) {
      return false
    }
    return field.initialValue.dependsOn.includes(fieldName)
  })
}

/**
 * Used for ensuring that the object has all the properties. For example, intl expects object with well defined properties for translations.
 * For setting default fields for form values @see setFormValueWithFieldTypeDefault
 *
 * @returns object based on the fields given with null values.
 */
export function setEmptyValuesForFields(fields: FieldConfig[]) {
  return fields.reduce((initialValues: Record<string, null>, field) => {
    return {
      ...initialValues,
      [field.id]: null
    }
  }, {})
}

export function setDefaultsForMissingFields(
  fields: FieldConfig[],
  values: ActionFormData
) {
  const missingFields = fields.filter((field) => !values[field.id])

  return missingFields.reduce((initialValues: ActionFormData, field) => {
    return {
      ...initialValues,
      [field.id]: setFormValueWithFieldTypeDefault({
        fieldConfig: field,
        value: values[field.id],
        intl: {} as IntlShape,
        locations: {}
      })
    }
  }, values)
}

/**
 *  Used for setting default values for FORM fields (string defaults based on FieldType).
 * For setting default fields for intl object @see setEmptyValuesForFields
 *
 *  @returns sensible default value for the field type given the field configuration.
 */
export function setFormValueWithFieldTypeDefault({
  fieldConfig,
  value,
  intl,
  locations
}: {
  fieldConfig: FieldConfig
  value: FieldValue
  intl: IntlShape
  locations: { [locationId: string]: ILocation }
}): string {
  switch (fieldConfig.type) {
    case FieldType.BULLET_LIST:
    case FieldType.DIVIDER:
    case FieldType.PAGE_HEADER:
    case FieldType.DATE:
    case FieldType.TEXT:
    case FieldType.PARAGRAPH:
    case FieldType.FILE:
      // @TODO:
      return defaultTo(value as string, '')

    case FieldType.CHECKBOX:
      // @TODO: This should be a boolean?
      return value === 'true' ? 'Yes' : 'No'
    case FieldType.RADIO_GROUP:
    case FieldType.SELECT: {
      const selectedOption = fieldConfig.options.find(
        (option) => option.value === value
      )

      return selectedOption ? intl.formatMessage(selectedOption.label) : ''
    }

    case FieldType.COUNTRY: {
      if (!value) {
        return ''
      }

      const selectedCountry = countries.find(
        (country) => country.value === value
      )
      return selectedCountry ? intl.formatMessage(selectedCountry.label) : ''
    }

    case FieldType.LOCATION: {
      let location
      if (isString(value)) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        location = locations[value] ? locations[value].name : ''
      }

      return location ?? ''
    }
    default:
      throw new Error(
        `Field type for ${JSON.stringify(fieldConfig)} configuration missing.`
      )
  }
}
