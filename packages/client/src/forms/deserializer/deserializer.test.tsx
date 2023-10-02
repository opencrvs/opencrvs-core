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
import traverse from 'traverse'
import { IForm } from '@client/forms'
import { deserializeForm } from './deserializer'
import { Mock } from 'vitest'
import * as builtInValidators from '@client/utils/validate'
import { readFileSync } from 'fs'
import { join } from 'path'

const forms = JSON.parse(
  readFileSync(join(__dirname, '../../tests/forms.json')).toString()
)

function isGraphQLTag(item: any) {
  return typeof item === 'object' && item.kind && item.directives
}

function hasOperatorDescriptors(form: IForm) {
  return traverse(form).reduce(
    function ([paths, found], item) {
      if (typeof item === 'object' && item.operation && !isGraphQLTag(item)) {
        return [[...paths, this.path.join('.')], true]
      }
      return [paths, found]
    },
    [[], false]
  )
}
// Needs to be casted as any as there are non-validator functions in the import
const validators = builtInValidators as Record<string, any>

describe('Form deserializer', () => {
  // TODO: What does operator descriptors mean? Is this obsolete?
  it.todo(
    'replaces all operator descriptors from the serialized form',
    async () => {
      const { birth, death } = forms

      expect(
        hasOperatorDescriptors(deserializeForm(birth, validators))[0].length
      ).toBeGreaterThan(5)
      expect(
        hasOperatorDescriptors(deserializeForm(birth, validators))[1]
      ).toBeTruthy()
      expect(
        hasOperatorDescriptors(deserializeForm(death, validators))[0].length
      ).toBeGreaterThan(5)
      expect(
        hasOperatorDescriptors(deserializeForm(death, validators))[1]
      ).toBeTruthy()
    }
  )

  it('throws errors when developer passes in invalid operations', async () => {
    const {
      forms: { birth }
    } = forms

    birth.sections[2].groups[0].fields[0].mapping!.mutation!.operation =
      'non_existing_123' as any

    expect(() => deserializeForm(birth, validators)).toThrow()
    /* eslint-disable no-console */
    expect((console.error as Mock).mock.calls).toHaveLength(1)
    expect((console.error as Mock).mock.calls[0][0]).toMatch('non_existing_123')
    /* eslint-enable no-console */
  })
})
