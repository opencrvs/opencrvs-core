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
import {
  BULLET_LIST,
  BUTTON,
  CHECKBOX_GROUP,
  DATE,
  DependencyInfo,
  DOCUMENT_UPLOADER_WITH_OPTION,
  FETCH_BUTTON,
  HIDDEN,
  IButtonFormField,
  ICheckboxOption,
  IDynamicFormField,
  IDynamicFormFieldValidators,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  Ii18nFormField,
  ILoaderButton,
  INFORMATIVE_RADIO_GROUP,
  InitialValue,
  IRadioOption,
  ISelectOption,
  RADIO_GROUP,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  SELECT_WITH_OPTIONS
} from '@client/forms'
import { Validation } from '@client/utils/validate'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { Conditional } from './conditionals'

const internationaliseOptions = (
  intl: IntlShape,
  options: Array<ISelectOption | IRadioOption | ICheckboxOption>
) => {
  return options.map((opt) => {
    return {
      ...opt,
      label: intl.formatMessage(
        opt.label,
        'param' in opt ? opt.param : undefined
      )
    }
  })
}

const internationaliseListFieldObject = (
  intl: IntlShape,
  options: MessageDescriptor[]
) => {
  return options.map((opt) => intl.formatMessage(opt))
}

export const internationaliseFieldObject = (
  intl: IntlShape,
  field: IFormField
): Ii18nFormField => {
  const internationalisedForAll = {
    helperText: field.helperText && intl.formatMessage(field.helperText),
    tooltip: field.tooltip && intl.formatMessage(field.tooltip),
    unit: field.unit && intl.formatMessage(field.unit),
    description: field.description && intl.formatMessage(field.description),
    placeholder: field.placeholder && intl.formatMessage(field.placeholder),
    label: field.label && intl.formatMessage(field.label),
    nestedFields: undefined
  }

  if (field.type === HIDDEN) {
    return {
      ...field,
      ...internationalisedForAll,
      label: internationalisedForAll.label
    }
  }

  if (
    field.type === SELECT_WITH_OPTIONS ||
    field.type === INFORMATIVE_RADIO_GROUP ||
    field.type === CHECKBOX_GROUP ||
    field.type === DOCUMENT_UPLOADER_WITH_OPTION
  ) {
    return {
      ...field,
      ...internationalisedForAll,
      options: internationaliseOptions(intl, field.options)
    } as Ii18nFormField
  }

  if (field.type === BULLET_LIST) {
    return {
      ...field,
      ...internationalisedForAll,
      items: internationaliseListFieldObject(intl, field.items)
    }
  }

  if (
    field.type === RADIO_GROUP ||
    field.type === RADIO_GROUP_WITH_NESTED_FIELDS
  ) {
    return {
      ...field,
      ...internationalisedForAll,
      options: internationaliseOptions(intl, field.options),
      notice: field.notice && intl.formatMessage(field.notice)
    } as Ii18nFormField
  }

  if (field.type === DATE && field.notice) {
    return {
      ...field,
      ...internationalisedForAll,
      notice: intl.formatMessage(field.notice)
    }
  }

  if (field.type === FETCH_BUTTON) {
    return {
      ...field,
      ...internationalisedForAll,
      modalTitle: intl.formatMessage((field as ILoaderButton).modalTitle),
      successTitle: intl.formatMessage((field as ILoaderButton).successTitle),
      errorTitle: intl.formatMessage((field as ILoaderButton).errorTitle)
    } as Ii18nFormField
  }

  if (isFieldButton(field)) {
    return {
      ...field,
      ...internationalisedForAll,
      buttonLabel: intl.formatMessage(field.buttonLabel),
      loadingLabel: field.loadingLabel && intl.formatMessage(field.loadingLabel)
    }
  }

  return { ...field, ...internationalisedForAll } as Ii18nFormField
}

export function handleInitialValue(
  initialValue: InitialValue,
  formData: IFormSectionData
): IFormFieldValue {
  return isInitialValueDependencyInfo(initialValue)
    ? (evalExpressionInFieldDefinition(initialValue.expression, {
        $form: formData
      }) as IFormFieldValue)
    : initialValue
}

export const getFieldType = (
  field: IDynamicFormField,
  values: IFormSectionData
): string => {
  if (!field.dynamicDefinitions.type) {
    return field.type
  }

  switch (field.dynamicDefinitions.type.kind) {
    case 'dynamic':
      return field.dynamicDefinitions.type.typeMapper(
        values[field.dynamicDefinitions.type.dependency] as string
      )
    case 'static':
    default:
      return field.dynamicDefinitions.type.staticType
  }
}

export const getConditionalActionsForField = (
  field: IFormField,
  values: IFormSectionData
): string[] => {
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) =>
      evalExpressionInFieldDefinition(conditional.expression, {
        $form: values
      })
    )
    .map((conditional: Conditional) => conditional.action)
}

type FormData = Record<string, IFormFieldValue>
export const evalExpressionInFieldDefinition = (
  expression: string,
  /*
   * These are used in the eval expression
   */
  { $form }: { $form: FormData }
) => {
  // eslint-disable-next-line no-eval
  return eval(expression)
}

export function isFieldButton(field: IFormField): field is IButtonFormField {
  return field.type === BUTTON
}

export const getFieldValidation = (
  field: IDynamicFormField,
  values: IFormSectionData
): Validation[] => {
  const validator: Validation[] = []
  if (
    field.dynamicDefinitions &&
    field.dynamicDefinitions.validator &&
    field.dynamicDefinitions.validator.length > 0
  ) {
    field.dynamicDefinitions.validator.map(
      (element: IDynamicFormFieldValidators) => {
        const params: unknown[] = []
        element.dependencies.map((dependency: string) =>
          params.push(values[dependency])
        )
        const fun = element.validator(...params)
        validator.push(fun)
        return element
      }
    )
  }

  return validator
}

function isRecord<V>(value: unknown): value is Record<string, V> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isInitialValueDependencyInfo(
  value: InitialValue
): value is DependencyInfo {
  return typeof value === 'object' && value !== null && 'dependsOn' in value
}

export function getDependentFields(
  fields: IFormField[],
  fieldName: string
): IFormField[] {
  return fields.filter(
    ({ initialValue }) =>
      initialValue &&
      isInitialValueDependencyInfo(initialValue) &&
      initialValue.dependsOn.includes(fieldName)
  )
}

export function flatten<T>(
  obj: Record<string, T>,
  parentKey = '',
  separator = '.'
): Record<string, T> {
  const result: Record<string, T> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = parentKey ? `${parentKey}${separator}${key}` : key

    if (isRecord(value)) {
      Object.assign(
        result,
        flatten(value as Record<string, T>, newKey, separator)
      )
    } else {
      result[newKey] = value
    }
  }

  return result
}

export function unflatten<T>(
  obj: Record<string, T>,
  separator = '.'
): Record<string, T | Record<string, T>> {
  const result: Record<string, T | Record<string, T>> = {}

  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(separator)
    let current: Record<string, T | Record<string, T>> = result

    keys.forEach((part, index) => {
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = index === keys.length - 1 ? value : {}
      }
      current = current[part] as Record<string, T | Record<string, T>>
    })
  }

  return result
}
