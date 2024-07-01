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
import { Validation } from '@client/utils/validate'
import * as mutations from '@client/forms/register/mappings/mutation'
import * as queries from '@client/forms/register/mappings/query'
import * as responseTransformers from '@client/forms/register/legacy/response-transformers'
import * as graphQLQueries from '@client/forms/register/legacy'
import {
  IForm,
  ISerializedForm,
  IFormSectionMutationMapFunction,
  IFormSectionQueryMapFunction,
  IFormFieldQueryMapFunction,
  IFormFieldMutationMapFunction,
  IValidatorDescriptor,
  ISerializedFormSection,
  IFormSection,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  ISerializedDynamicFormFieldDefinitions,
  IDynamicFormFieldDefinitions,
  ValidationFactoryOperation,
  IQueryDescriptor,
  QueryFactoryOperation,
  IMutationDescriptor,
  MutationFactoryOperation,
  FETCH_BUTTON,
  IQueryMap,
  ISerializedQueryMap,
  ILoaderButton,
  IFormFieldWithDynamicDefinitions,
  IFormField,
  SELECT_WITH_OPTIONS,
  ISelectFormFieldWithOptions,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  IRadioGroupWithNestedFieldsFormField,
  SerializedFormField,
  ITemplateDescriptor,
  IFormFieldTemplateMapOperation,
  IQueryTemplateDescriptor,
  identityTypeMapper
} from '@client/forms'
import { countries } from '@client/utils/countries'
import * as builtInValidators from '@client/utils/validate'
import { Validator } from '@client/forms/validators'
import * as labels from '@client/forms/certificate/fieldDefinitions/label'

/**
 * Some of the exports of mutations, queries and validators are not functions
 * There are for instance some Enums and value mappings that are exported
 *
 * This here removes those from the type, so we don't have to cast anything to any
 */
export type AnyFn<T> = (...args: any[]) => T
type AnyFactoryFn<T> = (...args: any[]) => (...args: any[]) => T

type FilterType<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}

type MutationFunctionExports = FilterType<
  typeof mutations,
  AnyFactoryFn<string>
>[keyof typeof mutations]

type QueryFunctionExports = FilterType<
  typeof queries,
  AnyFactoryFn<string>
>[keyof typeof queries]

type ValidatorFunctionExports = FilterType<
  typeof builtInValidators,
  Validator
>[keyof typeof builtInValidators]

function isFactoryOperation(
  descriptor: IQueryDescriptor
): descriptor is QueryFactoryOperation
function isFactoryOperation(
  descriptor: IMutationDescriptor
): descriptor is MutationFactoryOperation
function isFactoryOperation(
  descriptor: IValidatorDescriptor
): descriptor is ValidationFactoryOperation
function isFactoryOperation(descriptor: any) {
  return Boolean((descriptor as ValidationFactoryOperation).parameters)
}

function hasTemplateOperator(
  descriptor: ITemplateDescriptor
): descriptor is IQueryTemplateDescriptor {
  return Boolean((descriptor as IQueryTemplateDescriptor).operation)
}

function configurationError(
  descriptor: { operation: string },
  operationLabel: string
) {
  const error = `Cannot find a ${operationLabel} with a name ${descriptor.operation}.
    This is a configuration error in your country specific resource package's form field definitions.`
  /* eslint-disable no-console */
  console.error(error)
  /* eslint-enable no-console */
  return new Error(error)
}

function sectionQueryDescriptorToQueryFunction(
  descriptor: IQueryDescriptor
): IFormSectionQueryMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    queries[descriptor.operation as QueryFunctionExports]

  if (!transformer) {
    throw configurationError(descriptor, 'query transformer')
  }

  if (isFactoryOperation(descriptor)) {
    const factory = transformer as AnyFactoryFn<string>
    return factory(...descriptor.parameters)
  }
  return transformer
}

function sectionMutationDescriptorToMutationFunction(
  descriptor: IMutationDescriptor
): IFormSectionMutationMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    mutations[descriptor.operation as MutationFunctionExports]

  if (!transformer) {
    throw configurationError(descriptor, 'mutation transformer')
  }

  if (isFactoryOperation(descriptor)) {
    const factory = transformer as AnyFactoryFn<string>
    return factory(...descriptor.parameters)
  }
  return transformer
}

function isOperation(param: any): param is IMutationDescriptor {
  return typeof param === 'object' && param['operation']
}

function fieldQueryDescriptorToQueryFunction(
  descriptor: IQueryDescriptor
): IFormFieldQueryMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    queries[descriptor.operation as QueryFunctionExports]

  if (!transformer) {
    throw configurationError(descriptor, 'query transformer')
  }

  if (isFactoryOperation(descriptor)) {
    const factory = transformer as AnyFactoryFn<string>

    const potentiallyNestedOperations =
      descriptor.parameters as Array<IQueryDescriptor>

    const parameters = potentiallyNestedOperations.map((parameter) =>
      isOperation(parameter)
        ? fieldQueryDescriptorToQueryFunction(parameter)
        : parameter
    )

    return factory(...parameters)
  }
  return transformer
}

function fieldTemplateDescriptorToQueryOperation(
  descriptor: ITemplateDescriptor
): IFormFieldTemplateMapOperation {
  if (hasTemplateOperator(descriptor)) {
    return [
      descriptor.fieldName,
      fieldQueryDescriptorToQueryFunction(descriptor)
    ]
  }
  return [descriptor.fieldName]
}

function fieldMutationDescriptorToMutationFunction(
  descriptor: IMutationDescriptor
): IFormFieldMutationMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    mutations[descriptor.operation as MutationFunctionExports]

  if (!transformer) {
    throw configurationError(descriptor, 'mutation transformer')
  }

  if (isFactoryOperation(descriptor)) {
    const factory = transformer as AnyFactoryFn<string>

    const potentiallyNestedOperations =
      descriptor.parameters as Array<IMutationDescriptor>

    const parameters = potentiallyNestedOperations.map((parameter) =>
      isOperation(parameter)
        ? fieldMutationDescriptorToMutationFunction(parameter)
        : parameter
    )

    return factory(...parameters)
  }
  return transformer
}

export function fieldValidationDescriptorToValidationFunction(
  descriptor: IValidatorDescriptor,
  validators: Record<string, Validator>
): Validation {
  const validator: Validator =
    validators[descriptor.operation as ValidatorFunctionExports]

  if (!validator) {
    throw configurationError(descriptor, 'validator')
  }

  if (isFactoryOperation(descriptor)) {
    const factory = validator as AnyFn<Validation>
    return factory(...descriptor.parameters)
  }

  return validator as Validation
}

function deserializeDynamicDefinitions(
  descriptor: ISerializedDynamicFormFieldDefinitions,
  validators: Record<string, Validator>
): IDynamicFormFieldDefinitions {
  return {
    label: descriptor.label && {
      dependency: descriptor.label.dependency,
      labelMapper: labels[descriptor.label.labelMapper.operation]
    },
    helperText: descriptor.helperText && {
      dependency: descriptor.helperText.dependency,
      helperTextMapper: labels[descriptor.helperText.helperTextMapper.operation]
    },
    tooltip: descriptor.tooltip && {
      dependency: descriptor.tooltip.dependency,
      tooltipMapper: labels[descriptor.tooltip.tooltipMapper.operation]
    },
    unit: descriptor.unit && {
      dependency: descriptor.unit.dependency,
      unitMapper: labels[descriptor.unit.unitMapper.operation]
    },
    type:
      descriptor.type &&
      (descriptor.type.kind === 'static'
        ? descriptor.type
        : {
            kind: 'dynamic',
            dependency: descriptor.type.dependency,
            typeMapper: identityTypeMapper[descriptor.type.typeMapper.operation]
          }),
    validator:
      descriptor.validator &&
      descriptor.validator.map((validatorDescriptor) => ({
        dependencies: validatorDescriptor.dependencies,
        validator: validators[
          validatorDescriptor.validator.operation
        ] as AnyFn<Validation>
      }))
  }
}

function deserializeQueryMap(queryMap: ISerializedQueryMap) {
  return Object.keys(queryMap).reduce<IQueryMap>((deserialized, key) => {
    return {
      ...deserialized,
      [key]: {
        ...queryMap[key],
        responseTransformer:
          responseTransformers[queryMap[key].responseTransformer.operation],
        query: graphQLQueries[queryMap[key].query.operation]
      }
    }
  }, {})
}

export function deserializeFormField(
  field: SerializedFormField,
  validators: Record<string, Validator>
): IFormField {
  const baseFields = {
    ...field,
    validator:
      field.validator &&
      field.validator.map((descriptor) =>
        fieldValidationDescriptorToValidationFunction(descriptor, validators)
      ),
    mapping: field.mapping && {
      query:
        field.mapping.query &&
        fieldQueryDescriptorToQueryFunction(field.mapping.query),
      mutation:
        field.mapping.mutation &&
        fieldMutationDescriptorToMutationFunction(field.mapping.mutation),
      template:
        field.mapping.template &&
        fieldTemplateDescriptorToQueryOperation(field.mapping.template)
    }
  }
  if (field.type === FIELD_WITH_DYNAMIC_DEFINITIONS) {
    return {
      ...baseFields,
      dynamicDefinitions: deserializeDynamicDefinitions(
        field.dynamicDefinitions,
        validators
      )
    } as IFormFieldWithDynamicDefinitions
  }

  if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
    const deserializedNestedFields = Object.keys(field.nestedFields).reduce(
      (fields, key) => {
        return {
          ...fields,
          [key]: field.nestedFields[key].map((field) =>
            deserializeFormField(field, validators)
          )
        }
      },
      {}
    )
    return {
      ...baseFields,
      nestedFields: deserializedNestedFields
    } as IRadioGroupWithNestedFieldsFormField
  }

  if (field.type === SELECT_WITH_OPTIONS) {
    return {
      ...baseFields,
      options:
        !Array.isArray(field.options) && field.options.resource
          ? // Dummy implementation for now as there's only one resource
            countries
          : field.options
    } as ISelectFormFieldWithOptions
  }

  if (field.type === FETCH_BUTTON) {
    return {
      ...baseFields,
      queryMap: deserializeQueryMap(field.queryMap)
    } as ILoaderButton
  }

  return baseFields as Exclude<
    IFormField,
    IFormFieldWithDynamicDefinitions | ILoaderButton
  >
}

export function deserializeFormSection(
  section: ISerializedFormSection,
  validators: Record<string, Validator>
): IFormSection {
  const mapping = {
    query:
      section.mapping &&
      section.mapping.query &&
      sectionQueryDescriptorToQueryFunction(section.mapping.query),
    mutation:
      section.mapping &&
      section.mapping.mutation &&
      sectionMutationDescriptorToMutationFunction(section.mapping.mutation),
    template:
      section.mapping?.template &&
      section.mapping.template.map(
        ({ fieldName, ...query }) =>
          [fieldName, sectionQueryDescriptorToQueryFunction(query)] as [
            string,
            IFormSectionQueryMapFunction
          ]
      )
  }
  const groups = section.groups.map((group) => ({
    ...group,
    fields: group.fields.map((field) => {
      return deserializeFormField(field, validators)
    })
  }))

  return {
    ...section,
    mapping,
    groups
  }
}

export function deserializeForm(
  form: ISerializedForm,
  validators: Record<string, Validator>
): IForm {
  const sections = form.sections.map((section) =>
    deserializeFormSection(section, validators)
  )

  return {
    ...form,
    sections
  }
}
