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
  AddressField,
  AddressType,
  AgeField,
  ButtonField,
  DateField,
  FieldType,
  generateTranslationConfig,
  InteractiveFieldType,
  Location,
  NameField,
  now,
  SystemVariables,
  TextField,
  TimeField,
  user,
  UUID
} from '@opencrvs/commons/client'
import { mapFieldToDefaultValue } from './useDefaultValue'

const PROVINCE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' as UUID
const DISTRICT_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' as UUID
const OFFICE_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc' as UUID

const mockLocations: Location[] = [
  {
    id: OFFICE_ID,
    parentId: DISTRICT_ID,
    name: 'Test Office',
    validUntil: null,
    locationType: 'CRVS_OFFICE'
  },
  {
    id: DISTRICT_ID,
    parentId: PROVINCE_ID,
    name: 'Test District',
    validUntil: null,
    locationType: 'ADMIN_STRUCTURE'
  },
  {
    id: PROVINCE_ID,
    parentId: null,
    name: 'Test Province',
    validUntil: null,
    locationType: 'ADMIN_STRUCTURE'
  }
]

// Mirrors window.config.ADMIN_STRUCTURE in setupTests.ts: ['province', 'district']
const mockAdminLevelIds = ['province', 'district']

const mockContext: SystemVariables & {
  locations: Location[]
  adminLevelIds: string[]
} = {
  user: {
    id: 'user-id',
    firstname: 'John',
    middlename: 'Michael',
    surname: 'Doe',
    primaryOfficeId: OFFICE_ID,
    name: 'John Michael Doe',
    role: 'REGISTRAR'
  },
  $window: {
    location: {
      href: '',
      pathname: '/',
      hostname: 'localhost',
      originPathname: '/'
    }
  },
  locations: mockLocations,
  adminLevelIds: mockAdminLevelIds
}

const textField = {
  id: 'recommender.id',
  type: FieldType.TEXT,
  defaultValue: user('name'),
  required: true,
  conditionals: [],
  label: {
    defaultMessage: "Recommender's membership ID",
    description: 'This is the label for the field',
    id: 'event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
  }
} satisfies TextField

const timeField = {
  id: 'recommender.id',
  type: FieldType.TIME,
  defaultValue: now(),
  required: true,
  conditionals: [],
  label: {
    defaultMessage: "Recommender's time of recommendation",
    description: 'This is the label for the time field',
    id: 'event.tennis-club-membership.time'
  }
} satisfies TimeField

const dateField = {
  id: 'recommender.id',
  type: FieldType.DATE,
  defaultValue: now(),
  required: true,
  conditionals: [],
  label: {
    defaultMessage: "Recommender's date of recommendation",
    description: 'This is the label for the date field',
    id: 'event.tennis-club-membership.date'
  }
} satisfies DateField

const nameField = {
  id: 'applicant.name',
  type: FieldType.NAME,
  label: {
    defaultMessage: 'Name of applicant',
    description: 'This is the title for the name field',
    id: 'event.tennis-club-membership.action.declare.form.section.who.field.name.label'
  },
  hideLabel: true,
  required: true,
  defaultValue: {
    firstname: user('firstname'),
    middlename: user('middlename'),
    surname: user('surname')
  },
  validation: []
} satisfies NameField

describe('mapFieldToDefaultValue', () => {
  it('resolves user field token for TEXT field', () => {
    const result = mapFieldToDefaultValue(textField, mockContext)
    expect(result).toBe('John Michael Doe')
  })

  it('resolves now() token for TIME field', () => {
    const result = mapFieldToDefaultValue(timeField, mockContext)
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })

  it('resolves now() token for DATE field', () => {
    const result = mapFieldToDefaultValue(dateField, mockContext)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('resolves user field tokens for NAME field', () => {
    const result = mapFieldToDefaultValue(nameField, mockContext)
    expect(result).toEqual({
      firstname: 'John',
      middlename: 'Michael',
      surname: 'Doe'
    })
  })

  it('for ADDRESS fields', () => {
    const addressField = {
      id: 'applicant.address',
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      conditionals: [],
      label: {
        defaultMessage: "Applicant's address",
        description: 'This is the label for the field',
        id: 'event.tennis-club-membership.action.declare.form.section.who.field.address.label'
      },
      validation: [],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      }
    } satisfies AddressField

    it('resolves administrativeArea via locationLevel district', () => {
      const result = mapFieldToDefaultValue(addressField, mockContext)
      expect(result).toMatchObject({ administrativeArea: DISTRICT_ID })
    })

    it('resolves administrativeArea via locationLevel province', () => {
      const addressFieldProvince = {
        ...addressField,
        defaultValue: {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: user('primaryOfficeId').locationLevel('province')
        }
      } satisfies InteractiveFieldType

      const result = mapFieldToDefaultValue(addressFieldProvince, mockContext)
      expect(result).toMatchObject({ administrativeArea: PROVINCE_ID })
    })

    it('passes through other address fields unchanged', () => {
      const result = mapFieldToDefaultValue(addressField, mockContext)
      expect(result).toMatchObject({ country: 'FAR', addressType: 'DOMESTIC' })
    })

    it('returns undefined for administrativeArea when not provided in default value', () => {
      const addressFieldProvince = {
        ...addressField,
        defaultValue: {
          country: 'FAR',
          addressType: AddressType.DOMESTIC
        }
      } satisfies InteractiveFieldType

      const result = mapFieldToDefaultValue(addressFieldProvince, mockContext)
      expect(result).toMatchObject({ administrativeArea: undefined })
    })

    it("returns undefined for administrativeArea when location level not in user's hierarchy", () => {
      const addressFieldProvince = {
        ...addressField,
        defaultValue: {
          country: 'FAR',
          addressType: AddressType.DOMESTIC,
          administrativeArea: user('primaryOfficeId').locationLevel('village')
        }
      } satisfies InteractiveFieldType

      const result = mapFieldToDefaultValue(addressFieldProvince, mockContext)
      expect(result).toMatchObject({ administrativeArea: undefined })
    })
  })

  it('CHECKBOX with defaultValue false returns false, not undefined', () => {
    const checkboxField = {
      id: 'test.checkbox',
      type: FieldType.CHECKBOX,
      required: false,
      defaultValue: false,
      conditionals: [],
      label: generateTranslationConfig('Checkbox')
    }

    const result = mapFieldToDefaultValue(checkboxField, mockContext)
    expect(result).toBe(false)
  })

  it('BUTTON with defaultValue 0 returns 0, not undefined', () => {
    const buttonField: ButtonField = {
      id: 'test.button',
      type: FieldType.BUTTON,
      required: false,
      conditionals: [],
      defaultValue: 0,
      label: generateTranslationConfig('Button'),
      configuration: { text: generateTranslationConfig('Press me') }
    }

    const result = mapFieldToDefaultValue(buttonField, mockContext)
    expect(result).toBe(0)
  })

  it('AGE field returns { age, asOfDateRef } from defaultValue and configuration', () => {
    const ageField: AgeField = {
      id: 'applicant.age',
      type: FieldType.AGE,
      required: false,
      conditionals: [],
      defaultValue: 30,
      label: generateTranslationConfig('Age'),
      configuration: {
        asOfDate: { $$field: 'event.dateOfBirth', $$subfield: [] }
      }
    }

    const result = mapFieldToDefaultValue(ageField, mockContext)
    expect(result).toEqual({ age: 30, asOfDateRef: 'event.dateOfBirth' })
  })

  it('NUMBER with defaultValue 0 returns 0, not undefined', () => {
    const NumberField = {
      id: 'test.number',
      type: FieldType.NUMBER,
      required: false,
      conditionals: [],
      defaultValue: 0,
      label: generateTranslationConfig('Number')
    }

    const result = mapFieldToDefaultValue(NumberField, mockContext)
    expect(result).toBe(0)
  })
})
