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
import { describe, test, expect } from 'vitest'
import {
  FieldType,
  generateEventConfig,
  generateTranslationConfig
} from '@opencrvs/commons/client'
import { getCleanedDeclarationDiff } from './action'

const config = generateEventConfig({
  id: 'test-event',
  fields: [
    {
      id: 'applicant.firstname',
      type: FieldType.TEXT,
      label: generateTranslationConfig('First name')
    },
    {
      id: 'applicant.lastname',
      type: FieldType.TEXT,
      label: generateTranslationConfig('Last name')
    }
  ]
})

describe('getCleanedDeclarationDiff', () => {
  test('emits null for a field cleared during an edit so it overwrites the previous value', () => {
    const result = getCleanedDeclarationDiff({
      eventConfiguration: config,
      originalDeclaration: {
        'applicant.firstname': 'Jane',
        'applicant.lastname': 'Doe'
      },
      // The user cleared the last name, so it is absent from the form values.
      declarationDiff: { 'applicant.firstname': 'Jane' },
      validatorContext: {}
    })

    expect(result).toEqual({
      'applicant.firstname': 'Jane',
      'applicant.lastname': null
    })
  })

  test('does not null fields that were left unchanged', () => {
    const result = getCleanedDeclarationDiff({
      eventConfiguration: config,
      originalDeclaration: {
        'applicant.firstname': 'Jane',
        'applicant.lastname': 'Doe'
      },
      declarationDiff: {
        'applicant.firstname': 'Janet',
        'applicant.lastname': 'Doe'
      },
      validatorContext: {}
    })

    expect(result).toEqual({
      'applicant.firstname': 'Janet',
      'applicant.lastname': 'Doe'
    })
  })
})
