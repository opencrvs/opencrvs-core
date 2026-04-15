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
  AdministrativeArea,
  AddressType,
  field,
  FieldType,
  InteractiveFieldType,
  now,
  SystemVariables,
  user,
  UUID
} from '@opencrvs/commons/client'
import { mapFieldToDefaultValue } from './useDefaultValue'

const PROVINCE_ID = '4afea53a-4dde-4ba1-b51d-500d83860c28' as UUID
const DISTRICT_ID = '31ec1af8-d81f-448b-9a7a-3ce334004210' as UUID
const OFFICE_ID = 'c49a1250-1776-4191-84c1-f381d39dab22' as UUID

const mockAdministrativeAreas: Map<UUID, AdministrativeArea> = new Map([
  [
    DISTRICT_ID,
    {
      id: DISTRICT_ID,
      parentId: PROVINCE_ID,
      name: 'Test District',
      validUntil: null
    }
  ],
  [
    PROVINCE_ID,
    {
      id: PROVINCE_ID,
      parentId: null,
      name: 'Test Province',
      validUntil: null
    }
  ]
])

// Mirrors window.config.ADMIN_STRUCTURE in setupTests.ts: ['province', 'district']
const mockAdminLevelIds = ['province', 'district']

const mockContext: SystemVariables & {
  administrativeAreas: Map<UUID, AdministrativeArea>
  adminLevelIds: string[]
} = {
  user: {
    id: 'user-id',
    firstname: 'John',
    middlename: 'Michael',
    surname: 'Doe',
    administrativeAreaId: DISTRICT_ID,
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
  administrativeAreas: mockAdministrativeAreas,
  adminLevelIds: mockAdminLevelIds
}

const TextField = {
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
} satisfies InteractiveFieldType

const TimeField = {
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
} satisfies InteractiveFieldType

const DateField = {
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
} satisfies InteractiveFieldType

const NameField = {
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
} satisfies InteractiveFieldType

const AddressField = {
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
  },
  configuration: {
    streetAddressForm: [
      {
        id: 'town',
        required: false,
        parent: field('country'),
        label: {
          id: 'field.address.town.label',
          defaultMessage: 'Town',
          description: 'This is the label for the field'
        },
        conditionals: [],
        type: FieldType.TEXT
      },
      {
        id: 'residentialArea',
        required: false,
        parent: field('country'),
        label: {
          id: 'field.address.residentialArea.label',
          defaultMessage: 'Residential Area',
          description: 'This is the label for the field'
        },
        conditionals: [],
        type: FieldType.TEXT
      },
      {
        id: 'street',
        required: false,
        parent: field('country'),
        label: {
          id: 'field.address.street.label',
          defaultMessage: 'Street',
          description: 'This is the label for the field'
        },
        conditionals: [],
        type: FieldType.TEXT
      },
      {
        id: 'number',
        required: false,
        parent: field('country'),
        label: {
          id: 'field.address.number.label',
          defaultMessage: 'Number',
          description: 'This is the label for the field'
        },
        conditionals: [],
        type: FieldType.TEXT
      },
      {
        id: 'zipCode',
        required: false,
        parent: field('country'),
        label: {
          id: 'field.address.postcodeOrZip.label',
          defaultMessage: 'Postcode / Zip',
          description: 'This is the label for the field'
        },
        conditionals: [],
        type: FieldType.TEXT
      },
      {
        id: 'state',
        conditionals: [],
        parent: field('country'),
        required: true,
        label: {
          id: 'field.address.state.label',
          defaultMessage: 'State',
          description: 'This is the label for the field'
        },
        type: FieldType.TEXT
      },
      {
        id: 'district2',
        parent: field('country'),
        conditionals: [],
        required: true,
        label: {
          id: 'field.address.district2.label',
          defaultMessage: 'District',
          description: 'This is the label for the field'
        },
        type: FieldType.TEXT
      },
      {
        id: 'cityOrTown',
        parent: field('country'),
        conditionals: [],
        required: false,
        label: {
          id: 'field.address.cityOrTown.label',
          defaultMessage: 'City / Town',
          description: 'This is the label for the field'
        },
        type: FieldType.TEXT
      },
      {
        id: 'addressLine1',
        parent: field('country'),
        conditionals: [],
        required: false,
        label: {
          id: 'field.address.addressLine1.label',
          defaultMessage: 'Address Line 1',
          description: 'This is the label for the field'
        },
        type: FieldType.TEXT
      },
      {
        id: 'addressLine2',
        parent: field('country'),
        conditionals: [],
        required: false,
        label: {
          id: 'field.address.addressLine2.label',
          defaultMessage: 'Address Line 2',
          description: 'This is the label for the field'
        },
        type: FieldType.TEXT
      },
      {
        id: 'addressLine3',
        parent: field('country'),
        conditionals: [],
        required: false,
        label: {
          id: 'field.address.addressLine3.label',
          defaultMessage: 'Address Line 3',
          description: 'This is the label for the field'
        },
        type: FieldType.TEXT
      },
      {
        id: 'postcodeOrZip',
        parent: field('country'),
        conditionals: [],
        required: false,
        label: {
          id: 'field.address.postcodeOrZip.label',
          defaultMessage: 'Postcode / Zip',
          description: 'This is the label for the field'
        },
        type: FieldType.TEXT
      }
    ]
  }
} satisfies InteractiveFieldType

describe('mapFieldToDefaultValue', () => {
  it('resolves user field token for TEXT field', () => {
    const result = mapFieldToDefaultValue(TextField, mockContext)
    expect(result).toBe('John Michael Doe')
  })

  it('resolves now() token for TIME field', () => {
    const result = mapFieldToDefaultValue(TimeField, mockContext)
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })

  it('resolves now() token for DATE field', () => {
    const result = mapFieldToDefaultValue(DateField, mockContext)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('resolves user field tokens for NAME field', () => {
    const result = mapFieldToDefaultValue(NameField, mockContext)
    expect(result).toEqual({
      firstname: 'John',
      middlename: 'Michael',
      surname: 'Doe'
    })
  })

  it.only('resolves administrativeArea via locationLevel district for ADDRESS field', () => {
    const result = mapFieldToDefaultValue(AddressField, mockContext)
    expect(result).toMatchObject({ administrativeArea: DISTRICT_ID })
  })

  it('resolves administrativeArea via locationLevel province for ADDRESS field', () => {
    const addressFieldProvince = {
      ...AddressField,
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
    const result = mapFieldToDefaultValue(AddressField, mockContext)
    expect(result).toMatchObject({ country: 'FAR', addressType: 'DOMESTIC' })
  })
})
