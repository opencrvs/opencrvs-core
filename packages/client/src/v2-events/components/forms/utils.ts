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
  IDateFormField,
  IDynamicFormField,
  IDynamicFormFieldValidators,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  Ii18nButtonFormField,
  Ii18nFormField,
  Ii18nHiddenFormField,
  ILoaderButton,
  INFORMATIVE_RADIO_GROUP,
  InitialValue,
  PARAGRAPH,
  RADIO_GROUP,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  SELECT_WITH_OPTIONS,
  ICheckboxOption,
  IRadioOption,
  ISelectOption
} from '@client/forms'
import { Validation } from '@client/utils/validate'
import { Conditional } from './conditionals'
import { IntlShape, MessageDescriptor } from 'react-intl'

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
  const base = {
    ...field,
    label:
      field.type === PARAGRAPH
        ? field.label
        : intl.formatMessage(field.label, field.labelParam),
    helperText: field.helperText && intl.formatMessage(field.helperText),
    tooltip: field.tooltip && intl.formatMessage(field.tooltip),
    unit: field.unit && intl.formatMessage(field.unit),
    description: field.description && intl.formatMessage(field.description),
    placeholder: field.placeholder && intl.formatMessage(field.placeholder)
  }

  if (base.type === HIDDEN) {
    return base as Ii18nHiddenFormField
  }

  if (
    base.type === SELECT_WITH_OPTIONS ||
    base.type === INFORMATIVE_RADIO_GROUP ||
    base.type === CHECKBOX_GROUP ||
    base.type === DOCUMENT_UPLOADER_WITH_OPTION
  ) {
    ;(base as any).options = internationaliseOptions(intl, base.options)
  }

  if (base.type === BULLET_LIST) {
    ;(base as any).items = internationaliseListFieldObject(intl, base.items)
  }

  if (
    base.type === RADIO_GROUP ||
    base.type === RADIO_GROUP_WITH_NESTED_FIELDS
  ) {
    ;(base as any).options = internationaliseOptions(intl, base.options)
    if ((field as IDateFormField).notice) {
      ;(base as any).notice = intl.formatMessage(
        // @ts-ignore
        (field as IRadioGroupFormField).notice
      )
    }
  }

  if (base.type === DATE && (field as IDateFormField).notice) {
    ;(base as any).notice = intl.formatMessage(
      // @ts-ignore
      (field as IDateFormField).notice
    )
  }

  if (base.type === FETCH_BUTTON) {
    ;(base as any).modalTitle = intl.formatMessage(
      (field as ILoaderButton).modalTitle
    )
    ;(base as any).successTitle = intl.formatMessage(
      (field as ILoaderButton).successTitle
    )
    ;(base as any).errorTitle = intl.formatMessage(
      (field as ILoaderButton).errorTitle
    )
  }

  if (isFieldButton(field)) {
    ;(base as Ii18nButtonFormField).buttonLabel = intl.formatMessage(
      field.buttonLabel
    )
    if (field.loadingLabel) {
      ;(base as Ii18nButtonFormField).loadingLabel = intl.formatMessage(
        field.loadingLabel
      )
    }
  }

  return base as Ii18nFormField
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

type FormData = Record<string, any>
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
        const params: any[] = []
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
