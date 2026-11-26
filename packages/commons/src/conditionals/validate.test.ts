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
import { ConditionalType } from '../events/Conditional'
import { ActionType } from '../events/ActionType'
import { tennisClubMembershipEvent } from '../fixtures'
import {
  eventQueryDataGenerator,
  generateEventDocument,
  generateEmptyTestConditionalContext
} from '../events/test.utils'
import {
  errorMessages,
  areConditionsMet,
  isActionVisible,
  isFieldSecured,
  isFieldVisible,
  runFieldValidations,
  validateFieldInput
} from './validate'
import { field } from '../events/field'
import { flag, status } from './conditionals'
import { ActionConfig } from '../events/ActionConfig'
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
        form: { declaration: { nid: '123456' }, annotation: {} },
        context: generateEmptyTestConditionalContext(tennisClubMembershipEvent)
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
        form: { declaration: { nid: '12345' }, annotation: {} },
        context: generateEmptyTestConditionalContext(tennisClubMembershipEvent)
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
        form: {
          declaration: { itemA: 3, itemB: 7, itemSum: 10 },
          annotation: {}
        },
        context: generateEmptyTestConditionalContext(tennisClubMembershipEvent)
      })
    ).toEqual([])

    expect(
      runFieldValidations({
        field: fieldConfig,
        value: 8,
        form: {
          declaration: { itemA: 3, itemB: 7, itemSum: 8 },
          annotation: {}
        },
        context: generateEmptyTestConditionalContext(tennisClubMembershipEvent)
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
        form: { declaration: { amount: 4 }, annotation: {} },
        context: generateEmptyTestConditionalContext(tennisClubMembershipEvent)
      })
    ).toEqual([])

    // -2 is not positive
    expect(
      runFieldValidations({
        field: fieldConfig,
        value: -2,
        form: { declaration: { amount: -2 }, annotation: {} },
        context: generateEmptyTestConditionalContext(tennisClubMembershipEvent)
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
        form: { declaration: { amount: 3 }, annotation: {} },
        context: generateEmptyTestConditionalContext(tennisClubMembershipEvent)
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

describe('areConditionsMet', () => {
  // `health-worker-notified` is a flag that the event configuration defines. The NOTIFY action adds it.
  const flagConditional = {
    type: ConditionalType.SHOW,
    conditional: flag('health-worker-notified')
  }

  it('is met when the event carries the flag', () => {
    const eventDocument = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.NOTIFY].map((type) => ({ type }))
    })

    expect(
      areConditionsMet(
        [flagConditional],
        { declaration: {}, annotation: {} },
        {
          ...generateEmptyTestConditionalContext(tennisClubMembershipEvent),
          eventDocument
        }
      )
    ).toBe(true)
  })

  it('is not met when the event does not carry the flag', () => {
    const eventDocument = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [ActionType.CREATE, ActionType.DECLARE].map((type) => ({ type }))
    })

    expect(
      areConditionsMet(
        [flagConditional],
        { declaration: {}, annotation: {} },
        {
          ...generateEmptyTestConditionalContext(tennisClubMembershipEvent),
          eventDocument
        }
      )
    ).toBe(false)
  })
})

describe('isFieldVisible', () => {
  // `flag(...)` resolves through the event state of `context.eventDocument`.
  const flaggedField = {
    id: 'notifiedOnly',
    type: FieldType.TEXT,
    label: { id: '', defaultMessage: '', description: '' },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: flag('health-worker-notified')
      }
    ]
  } satisfies FieldConfig

  const document = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE, ActionType.DECLARE].map((type) => ({ type }))
  })

  const notifiedDocument = generateEventDocument({
    configuration: tennisClubMembershipEvent,
    actions: [ActionType.CREATE, ActionType.NOTIFY].map((type) => ({ type }))
  })

  it('resolves flag() against the event document carried on the context', () => {
    expect(
      isFieldVisible(
        flaggedField,
        { declaration: {}, annotation: {} },
        {
          ...generateEmptyTestConditionalContext(tennisClubMembershipEvent),
          eventDocument: notifiedDocument
        }
      )
    ).toBe(true)

    expect(
      isFieldVisible(
        flaggedField,
        { declaration: {}, annotation: {} },
        {
          ...generateEmptyTestConditionalContext(tennisClubMembershipEvent),
          eventDocument: document
        }
      )
    ).toBe(false)
  })

  it('treats flags as empty when the event is only created', () => {
    expect(
      isFieldVisible(
        flaggedField,
        { declaration: {}, annotation: {} },
        generateEmptyTestConditionalContext(tennisClubMembershipEvent)
      )
    ).toBe(false)
  })
})

describe('isFieldSecured', () => {
  it('returns true for a field secured with a plain boolean', () => {
    const eventIndex = eventQueryDataGenerator({ flags: [] })

    expect(
      isFieldSecured(
        { secured: true },
        { declaration: {}, annotation: {} },
        { eventIndex }
      )
    ).toBe(true)
  })

  it('returns false for a field not secured (boolean or unset)', () => {
    const eventIndex = eventQueryDataGenerator({ flags: [] })

    expect(
      isFieldSecured(
        { secured: false },
        { declaration: {}, annotation: {} },
        { eventIndex }
      )
    ).toBe(false)
    expect(
      isFieldSecured(
        { secured: undefined },
        { declaration: {}, annotation: {} },
        { eventIndex }
      )
    ).toBe(false)
  })

  it("resolves a conditional secured value against the event, e.g. flag('sealed')", () => {
    const securedField = { secured: flag('sealed') }

    expect(
      isFieldSecured(
        securedField,
        { declaration: {}, annotation: {} },
        { eventIndex: eventQueryDataGenerator({ flags: ['sealed'] }) }
      )
    ).toBe(true)
    expect(
      isFieldSecured(
        securedField,
        { declaration: {}, annotation: {} },
        { eventIndex: eventQueryDataGenerator({ flags: [] }) }
      )
    ).toBe(false)
  })
})

describe('runFieldValidations on a cleared (null) value', () => {
  const nameField = (required: boolean): FieldConfig => ({
    type: FieldType.NAME,
    id: 'member.name',
    label: { id: 'member.name.label', defaultMessage: 'Name', description: '' },
    required,
    validation: [
      {
        validator: field('member.name').get('firstname').isValidEnglishName(),
        message: {
          id: 'error.invalidName',
          defaultMessage: 'Invalid name',
          description: ''
        }
      }
    ]
  })

  it('skips validation of an optional field', () => {
    expect(
      runFieldValidations({
        field: nameField(false),
        value: null,
        form: { 'member.name': null },
        context: {}
      })
    ).toEqual([])
  })

  it('still reports a required field', () => {
    expect(
      runFieldValidations({
        field: nameField(true),
        value: null,
        form: { 'member.name': null },
        context: {}
      })
    ).not.toEqual([])
  })
})

describe('isActionVisible with status()', () => {
  const reinstateConfig = {
    type: ActionType.REINSTATE_REGISTRATION,
    label: {
      id: 'event.action.reinstate-registration.label',
      defaultMessage: 'Reinstate registration',
      description: 'Label for the reinstate registration action'
    },
    conditionals: [
      { type: ConditionalType.SHOW, conditional: status('REVOKED') }
    ]
  } as ActionConfig

  const documentAfter = (actions: ActionType[]) =>
    generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: actions.map((type) => ({ type }))
    })

  it('is visible once the record is revoked', () => {
    const eventDocument = documentAfter([
      ActionType.CREATE,
      ActionType.DECLARE,
      ActionType.REGISTER,
      ActionType.REVOKE_REGISTRATION
    ])

    expect(
      isActionVisible(
        reinstateConfig,
        { declaration: {}, annotation: {} },
        {
          ...generateEmptyTestConditionalContext(tennisClubMembershipEvent),
          eventDocument
        }
      )
    ).toBe(true)
  })

  it('is hidden again after the record is reinstated', () => {
    const eventDocument = documentAfter([
      ActionType.CREATE,
      ActionType.DECLARE,
      ActionType.REGISTER,
      ActionType.REVOKE_REGISTRATION,
      ActionType.REINSTATE_REGISTRATION
    ])

    expect(
      isActionVisible(
        reinstateConfig,
        { declaration: {}, annotation: {} },
        {
          ...generateEmptyTestConditionalContext(tennisClubMembershipEvent),
          eventDocument
        }
      )
    ).toBe(false)
  })
})
