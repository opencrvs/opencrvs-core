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

import { formatISO } from 'date-fns'
import { field } from '../events/field'
import { EventState } from '../events/ActionDocument'
import { FieldConfig } from '../events/FieldConfig'
import {
  and,
  or,
  not,
  defineFormConditional,
  ConditionalParameters
} from './conditionals'
import { getValidatorsForField, validate } from './validate'

const NAME_FIELD_ID = 'collector.OTHER.name'

const invalidNameMessage = {
  defaultMessage: 'Input contains invalid characters.',
  description: 'This is the error message for an invalid name',
  id: 'error.invalidName'
}

/**
 * The shape country configs use today, e.g.
 * `packages/testland/src/events/birth/validators.ts`.
 */
function invalidNameValidator(fieldId: string) {
  return {
    message: invalidNameMessage,
    validator: and(
      field(fieldId).get('firstname').isValidEnglishName(),
      field(fieldId).get('middlename').isValidEnglishName(),
      field(fieldId).get('surname').isValidEnglishName()
    )
  }
}

function nationalIdValidator(fieldId: string) {
  return {
    message: {
      defaultMessage:
        'The national ID can only be numeric and must be 10 digits long',
      description: 'This is the error message for an invalid national ID',
      id: 'error.invalidNationalId'
    },
    validator: defineFormConditional({
      type: 'object',
      properties: {
        [fieldId]: {
          type: 'string',
          pattern: '^[0-9]{10}$'
        }
      }
    })
  }
}

function getFieldParams(form: EventState) {
  return {
    $form: form,
    $now: formatISO(new Date(), { representation: 'date' }),
    $leafAdminStructureLocationIds: [],
    $online: false
  } satisfies ConditionalParameters
}

function asSchema(validation: NonNullable<FieldConfig['validation']>[number]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return validation.validator as any
}

describe('getValidatorsForField -- and() combinator', () => {
  it('extracts the composite field rule, then narrows it to a single subfield', () => {
    const outer = getValidatorsForField(NAME_FIELD_ID, [
      invalidNameValidator(NAME_FIELD_ID)
    ])

    expect(outer).toHaveLength(1)
    expect(outer[0].message).toEqual(invalidNameMessage)

    const inner = getValidatorsForField('firstname', outer)

    expect(inner).toHaveLength(1)
    expect(inner[0].message).toEqual(invalidNameMessage)

    const schema = asSchema(inner[0])

    // Only the `firstname` member of the and() survives
    expect(schema.allOf).toHaveLength(1)
    expect(Object.keys(schema.allOf[0].properties.$form.properties)).toEqual([
      'firstname'
    ])
    expect(JSON.stringify(schema)).not.toContain('middlename')
    expect(JSON.stringify(schema)).not.toContain('surname')
  })

  it('narrows to each of the three subfields independently', () => {
    const outer = getValidatorsForField(NAME_FIELD_ID, [
      invalidNameValidator(NAME_FIELD_ID)
    ])

    for (const subfield of ['firstname', 'middlename', 'surname']) {
      const inner = getValidatorsForField(subfield, outer)
      expect(inner).toHaveLength(1)
      expect(
        Object.keys(asSchema(inner[0]).allOf[0].properties.$form.properties)
      ).toEqual([subfield])
    }
  })

  it('returns nothing for a subfield the rule does not mention', () => {
    const outer = getValidatorsForField(NAME_FIELD_ID, [
      invalidNameValidator(NAME_FIELD_ID)
    ])

    expect(getValidatorsForField('nickname', outer)).toHaveLength(0)
  })

  it('returns nothing when the composite field id does not match', () => {
    expect(
      getValidatorsForField('child.name', [invalidNameValidator(NAME_FIELD_ID)])
    ).toHaveLength(0)
  })

  it('the narrowed rule fails an invalid firstname and passes a valid one', () => {
    const parent = invalidNameValidator(NAME_FIELD_ID)

    /*
     * Validate the un-narrowed parent rule first: `validate()` looks schemas up
     * from Ajv's cache by `$id`, so this catches a narrowed schema that reuses
     * the parent's `$id` and silently validates against the parent instead.
     */
    expect(
      validate(
        parent.validator,
        getFieldParams({ [NAME_FIELD_ID]: { firstname: 'Ann@' } })
      )
    ).toBe(false)

    const outer = getValidatorsForField(NAME_FIELD_ID, [parent])
    const inner = getValidatorsForField('firstname', outer)

    expect(inner).toHaveLength(1)

    expect(
      validate(inner[0].validator, getFieldParams({ firstname: 'Ann@' }))
    ).toBe(false)

    expect(
      validate(inner[0].validator, getFieldParams({ firstname: 'Ann' }))
    ).toBe(true)
  })

  it('does not report an error on a subfield that is valid while a sibling is not', () => {
    const outer = getValidatorsForField(NAME_FIELD_ID, [
      invalidNameValidator(NAME_FIELD_ID)
    ])

    const firstname = getValidatorsForField('firstname', outer)
    const surname = getValidatorsForField('surname', outer)

    const form = { firstname: 'Ann', surname: 'Smith@' }

    expect(validate(firstname[0].validator, getFieldParams(form))).toBe(true)
    expect(validate(surname[0].validator, getFieldParams(form))).toBe(false)
  })
})

describe('getValidatorsForField -- unsupported combinators', () => {
  /*
   * Narrowing an OR (or a negation) changes its meaning and would invent errors
   * that do not exist, so these must keep returning nothing.
   */
  it('returns nothing for or()', () => {
    const orValidator = {
      message: invalidNameMessage,
      validator: or(
        field(NAME_FIELD_ID).get('firstname').isValidEnglishName(),
        field(NAME_FIELD_ID).get('surname').isValidEnglishName()
      )
    }

    expect(getValidatorsForField(NAME_FIELD_ID, [orValidator])).toHaveLength(0)
    expect(getValidatorsForField('firstname', [orValidator])).toHaveLength(0)
  })

  it('returns nothing for not()', () => {
    const notValidator = {
      message: invalidNameMessage,
      validator: not(field(NAME_FIELD_ID).get('firstname').isValidEnglishName())
    }

    expect(getValidatorsForField(NAME_FIELD_ID, [notValidator])).toHaveLength(0)
    expect(getValidatorsForField('firstname', [notValidator])).toHaveLength(0)
  })
})

describe('getValidatorsForField -- properties-shaped validators (unchanged)', () => {
  it('extracts a flat field validator', () => {
    const validator = nationalIdValidator('applicant.nid')
    const extracted = getValidatorsForField('applicant.nid', [validator])

    expect(extracted).toHaveLength(1)

    const schema = asSchema(extracted[0])

    expect(schema.$id).toBe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `${(validator.validator as any).$id}.applicant.nid`
    )
    expect(schema.properties.$form.properties['applicant.nid']).toEqual({
      type: 'string',
      pattern: '^[0-9]{10}$'
    })
    expect(getValidatorsForField('applicant.dob', [validator])).toHaveLength(0)
  })

  it('strips the parent layer off a field(...).object({...}) validator', () => {
    const validator = {
      message: invalidNameMessage,
      validator: field('applicant.name').object({
        firstname: field('firstname').isValidEnglishName(),
        surname: field('surname').isValidEnglishName()
      })
    }

    const outer = getValidatorsForField('applicant.name', [validator])

    expect(outer).toHaveLength(1)
    expect(Object.keys(asSchema(outer[0]).properties.$form.properties)).toEqual(
      ['firstname', 'surname']
    )
    expect(asSchema(outer[0]).properties.$form.required).toEqual([
      'firstname',
      'surname'
    ])

    const inner = getValidatorsForField('firstname', outer)

    expect(inner).toHaveLength(1)
    expect(Object.keys(asSchema(inner[0]).properties.$form.properties)).toEqual(
      ['firstname']
    )

    expect(
      validate(inner[0].validator, getFieldParams({ firstname: 'Ann@' }))
    ).toBe(false)
    expect(
      validate(inner[0].validator, getFieldParams({ firstname: 'Ann' }))
    ).toBe(true)
  })
})
