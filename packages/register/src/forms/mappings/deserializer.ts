import { Validation } from '@register/utils/validate'
import * as mutations from '@register/forms/mappings/mutation'
import * as queries from '@register/forms/mappings/query'
import * as validators from '@opencrvs/register/src/utils/validate'

import {
  IForm,
  ISerializedForm,
  IFormSectionMutationMapFunction,
  IFormSectionQueryMapFunction,
  IFormFieldQueryMapFunction,
  IFormFieldMutationMapFunction,
  IFormSectionQueryMapDescriptor,
  IFormSectionMutationMapDescriptor,
  IFormFieldQueryMapDescriptor,
  IFormFieldMutationMapDescriptor,
  IValidatorDescriptor,
  ISerializedFormSection,
  IFormSection
} from '@register/forms'

/*
 * Some of the exports of mutations and queries are not functions
 * There are for instance some Enums and value mappings that are exported
 *
 * This here removes those from the type, so we don't have to cast anything to any
 *
 * @todo maybe this could live next to the other types
 */

type AnyFn<T> = (...args: any[]) => T
type AnyFactoryFn<T> = (...args: any[]) => (...args: any[]) => T

type FilterNonFunctions<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never
}

type MutationFunctionExports = FilterNonFunctions<
  typeof mutations,
  AnyFactoryFn<string>
>[keyof typeof mutations]

type QueryFunctionExports = FilterNonFunctions<
  typeof queries,
  AnyFactoryFn<string>
>[keyof typeof queries]

type ValidatorFunctionExports = FilterNonFunctions<
  typeof validators,
  Validation | AnyFn<Validation>
>[keyof typeof validators]

function sectionQueryDescriptorToQueryFunction(
  descriptor: IFormSectionQueryMapDescriptor
): IFormSectionQueryMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    queries[descriptor.operation as QueryFunctionExports]

  if (descriptor.parameters.length !== 0) {
    const factory = transformer as AnyFactoryFn<string>
    return factory(...descriptor.parameters)
  }
  return transformer
}

function sectionMutationDescriptorToMutationFunction(
  descriptor: IFormSectionMutationMapDescriptor
): IFormSectionMutationMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    mutations[descriptor.operation as MutationFunctionExports]

  if (descriptor.parameters.length !== 0) {
    const factory = transformer as AnyFactoryFn<string>
    return factory(...descriptor.parameters)
  }
  return transformer
}
function fieldQueryDescriptorToQueryFunction(
  descriptor: IFormFieldQueryMapDescriptor
): IFormFieldQueryMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    queries[descriptor.operation as QueryFunctionExports]

  if (descriptor.parameters.length !== 0) {
    const factory = transformer as AnyFactoryFn<string>
    return factory(...descriptor.parameters)
  }
  return transformer
}

function fieldMutationDescriptorToMutationFunction(
  descriptor: IFormFieldMutationMapDescriptor
): IFormFieldMutationMapFunction {
  const transformer: AnyFn<string> | AnyFactoryFn<string> =
    mutations[descriptor.operation as MutationFunctionExports]

  if (descriptor.parameters.length !== 0) {
    const factory = transformer as AnyFactoryFn<string>
    return factory(...descriptor.parameters)
  }
  return transformer
}

function fieldValidationDescriptorToValidationFunction(
  descriptor: IValidatorDescriptor
): Validation {
  const validator: Validation | AnyFn<Validation> =
    // eslint-disable-next-line import/namespace
    validators[descriptor.operation as ValidatorFunctionExports]

  if (descriptor.parameters.length !== 0) {
    const factory = validator as AnyFn<Validation>
    return factory(...descriptor.parameters)
  }

  return validator as Validation
}

export function deserializeFormSection(
  section: ISerializedFormSection
): IFormSection {
  const mapping = {
    query:
      section.mapping &&
      section.mapping.query &&
      sectionQueryDescriptorToQueryFunction(section.mapping.query),
    mutation:
      section.mapping &&
      section.mapping.mutation &&
      sectionMutationDescriptorToMutationFunction(section.mapping.mutation)
  }
  const groups = section.groups.map(group => ({
    ...group,
    fields: group.fields.map(field => ({
      ...field,
      validate: field.validate.map(
        fieldValidationDescriptorToValidationFunction
      ),
      mapping: field.mapping && {
        query:
          field.mapping.query &&
          fieldQueryDescriptorToQueryFunction(field.mapping.query),
        mutation:
          field.mapping.mutation &&
          fieldMutationDescriptorToMutationFunction(field.mapping.mutation)
      }
    }))
  }))

  return {
    ...section,
    mapping,
    groups
  }
}

export function deserializeForm(form: ISerializedForm): IForm {
  const sections = form.sections.map(deserializeFormSection)

  return {
    ...form,
    sections
  }
}
