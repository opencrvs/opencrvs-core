import { Validation } from '@client/utils/validate'
import { Conditional, builtInConditionals } from './conditionals'
import { AnyFn } from './mappings/deserializer'
import { referenceApi } from '@client/utils/referenceApi'
import * as builtInValidators from '@client/utils/validate'

export let validators: Record<string, Validation | AnyFn<Validation>>
export let conditionals: Record<string, Conditional>

export async function initConditionals() {
  const countryConfigConditionals = await referenceApi.importConditionals()
  conditionals = {
    ...builtInConditionals,
    ...countryConfigConditionals
  }
}

export async function initValidators() {
  const countryConfigValidators = await referenceApi.importValidators()
  validators = {
    // Needs to be casted as any as there are non-validator functions in the import
    ...(builtInValidators as Record<string, any>),
    ...countryConfigValidators
  }
}
