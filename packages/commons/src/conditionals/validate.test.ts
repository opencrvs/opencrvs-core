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

import { FieldConfig } from '../events/FieldConfig'
import { FieldType } from '../events/FieldType'
import { FieldUpdateValue } from '../events/FieldValue'
import { TranslationConfig } from '../events/TranslationConfig'
import { errorMessages, runFieldValidations, validateFieldInput } from './validate'
import { field } from '../events/field'
/**
 * Goal of testing is to ensure right error messages are returned, and our custom logic holds.
 * We should be able to trust zod validation for the rest.
 */
type TestCase = {
  input: { field: FieldConfig; value: FieldUpdateValue }
  output: { message: TranslationConfig }[]
}

function getErrorIds(errors: { message: TranslationConfig }[]) {
  return errors.map((o) => o.message.id)
}

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

describe('runFieldValidations with customClientValidator', () => {
  const errorMessage = {
    id: 'error.customValidation',
    defaultMessage: 'Custom validation failed',
    description: ''
  }

  it('passes when the custom validator returns true', () => {
    const fieldConfig: FieldConfig = {
      type: FieldType.TEXT,
      id: 'nid',
      label: { id: 'nid.label', defaultMessage: 'NID', description: '' },
      required: true,
      validation: [
        {
          validator: field('nid').customClientValidator(
            (value) => String(value).length === 6
          ),
          message: errorMessage
        }
      ]
    }

    expect(
      runFieldValidations({
        field: fieldConfig,
        value: '123456',
        form: { nid: '123456' },
        context: {}
      })
    ).toEqual([])
  })

  it('fails when the custom validator returns false', () => {
    const fieldConfig: FieldConfig = {
      type: FieldType.TEXT,
      id: 'nid',
      label: { id: 'nid.label', defaultMessage: 'NID', description: '' },
      required: true,
      validation: [
        {
          validator: field('nid').customClientValidator(
            (value) => String(value).length === 6
          ),
          message: errorMessage
        }
      ]
    }

    expect(
      runFieldValidations({
        field: fieldConfig,
        value: '12345',
        form: { nid: '12345' },
        context: {}
      })
    ).toEqual([{ message: errorMessage }])
  })

  it('can access other form fields via context to cross-validate two number fields', () => {
    // Ensures the value of itemSum equals itemA + itemB
    const sumValidator = (value: unknown, ctx: unknown) => {
      const { $form } = ctx as { $form: Record<string, unknown> }
      return Number(value) === Number($form.itemA) + Number($form.itemB)
    }

    const fieldConfig: FieldConfig = {
      type: FieldType.NUMBER,
      id: 'itemSum',
      label: { id: 'itemSum.label', defaultMessage: 'Sum', description: '' },
      required: true,
      validation: [
        {
          validator: field('itemSum').customClientValidator(sumValidator),
          message: errorMessage
        }
      ]
    }

    expect(
      runFieldValidations({
        field: fieldConfig,
        value: 10,
        form: { itemA: 3, itemB: 7, itemSum: 10 },
        context: {}
      })
    ).toEqual([])

    expect(
      runFieldValidations({
        field: fieldConfig,
        value: 8,
        form: { itemA: 3, itemB: 7, itemSum: 8 },
        context: {}
      })
    ).toEqual([{ message: errorMessage }])
  })

  it('can combine multiple custom validators on the same field', () => {
    const isPositive = (value: unknown) => Number(value) > 0
    const isEven = (value: unknown) => Number(value) % 2 === 0

    const fieldConfig: FieldConfig = {
      type: FieldType.NUMBER,
      id: 'amount',
      label: {
        id: 'amount.label',
        defaultMessage: 'Amount',
        description: ''
      },
      required: true,
      validation: [
        {
          validator: field('amount').customClientValidator(isPositive),
          message: {
            id: 'error.mustBePositive',
            defaultMessage: 'Must be positive',
            description: ''
          }
        },
        {
          validator: field('amount').customClientValidator(isEven),
          message: {
            id: 'error.mustBeEven',
            defaultMessage: 'Must be even',
            description: ''
          }
        }
      ]
    }

    // 4 is positive and even — passes both
    expect(
      runFieldValidations({
        field: fieldConfig,
        value: 4,
        form: { amount: 4 },
        context: {}
      })
    ).toEqual([])

    // -2 is not positive
    expect(
      runFieldValidations({
        field: fieldConfig,
        value: -2,
        form: { amount: -2 },
        context: {}
      })
    ).toEqual([
      {
        message: {
          id: 'error.mustBePositive',
          defaultMessage: 'Must be positive',
          description: ''
        }
      }
    ])

    // 3 is not even
    expect(
      runFieldValidations({
        field: fieldConfig,
        value: 3,
        form: { amount: 3 },
        context: {}
      })
    ).toEqual([
      {
        message: {
          id: 'error.mustBeEven',
          defaultMessage: 'Must be even',
          description: ''
        }
      }
    ])
  })
})
