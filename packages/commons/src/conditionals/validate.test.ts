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
  FieldConfig,
  FieldType,
  FieldUpdateValue,
  TranslationConfig
} from '../events'
import { errorMessages, validateFieldInput } from './validate'
/**
 * Goal of testing is to ensure right error messages are returned, and our custom logic holds.
 * We should be able to trust zod validation for the rest.
 */
type TestCase = {
  input: { field: FieldConfig; value: FieldUpdateValue }
  output: { message: TranslationConfig }[]
}

const getErrorIds = (errors: { message: TranslationConfig }[]) =>
  errors.map((o) => o.message.id)

const dateFieldConfig = {
  type: FieldType.DATE,
  id: 'date',
  label: {
    defaultMessage: '',
    description: '',
    id: ''
  }
}

const dateTestCases = [
  {
    input: {
      field: dateFieldConfig,
      value: ''
    },
    output: [
      {
        message: errorMessages.requiredField
      }
    ]
  },
  {
    input: {
      field: dateFieldConfig,
      value: '2021-01-01'
    },
    output: []
  },
  {
    input: {
      field: dateFieldConfig,
      value: '--'
    },
    output: [
      {
        message: errorMessages.invalidDate
      }
    ]
  },
  {
    input: {
      field: dateFieldConfig,
      value: '22-02-02'
    },
    output: [
      {
        message: errorMessages.invalidDate
      }
    ]
  },
  {
    input: {
      field: dateFieldConfig,
      value: '2000-2-2'
    },
    output: [
      {
        message: errorMessages.invalidDate
      }
    ]
  }
] satisfies TestCase[]

describe(`validateFieldInput -- ${FieldType.DATE}`, () => {
  dateTestCases.forEach(({ input, output }) => {
    it(`With value ${JSON.stringify(input.value)} results to ${JSON.stringify(
      getErrorIds(output)
    )}`, () => {
      expect(
        validateFieldInput({ field: input.field, value: input.value })
      ).toEqual(output)
    })
  })
})

const emailFieldConfig = {
  type: FieldType.EMAIL,
  id: 'email',
  label: {
    defaultMessage: '',
    description: '',
    id: ''
  }
}

const emailTestCases = [
  {
    input: {
      field: emailFieldConfig,
      value: ''
    },
    output: [
      {
        message: errorMessages.requiredField
      }
    ]
  },
  {
    input: {
      field: emailFieldConfig,
      value: 'm@opencrvs.org'
    },
    output: []
  }
] satisfies TestCase[]

describe(`validateFieldInput -- ${FieldType.EMAIL}`, () => {
  emailTestCases.forEach(({ input, output }) => {
    it(`With value ${JSON.stringify(input.value)} results to ${JSON.stringify(
      getErrorIds(output)
    )}`, () => {
      expect(
        validateFieldInput({ field: input.field, value: input.value })
      ).toEqual(output)
    })
  })
})
