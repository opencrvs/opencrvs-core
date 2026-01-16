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
  AddressType,
  field,
  FieldType,
  InteractiveFieldType,
  SystemVariables,
  user
} from '@opencrvs/commons/client'
import { replacePlaceholders } from './utils'
import { handleDefaultValue } from './hooks/useDefaultValues'

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

const testCases = [
  {
    currentValue: undefined,
    defaultValue: undefined,
    systemVariables: {
      user: {
        name: '',
        role: '',
        id: '',
        district: '',
        province: ''
      },
      $window: {
        location: {
          href: 'http://example.com',
          pathname: '/path',
          originPathname: '/path',
          hostname: 'example.com'
        }
      },
      $$date: '2024-10-10',
      $$time: '14:08'
    } satisfies SystemVariables,
    expected: undefined,
    field: AddressField satisfies InteractiveFieldType
  },
  {
    currentValue: undefined,
    defaultValue: 'Hello',
    systemVariables: {
      user: {
        district: '',
        province: '',
        name: '',
        role: '',
        id: ''
      },
      $window: {
        location: {
          href: 'http://example.com',
          pathname: '/path',
          originPathname: '/path',
          hostname: 'example.com'
        }
      },
      $$date: '2024-10-10',
      $$time: '14:08'
    } satisfies SystemVariables,
    expected: 'Hello',
    field: TextField
  },
  {
    currentValue: 'Hello world',
    defaultValue: '$user.district',
    systemVariables: {
      user: {
        name: 'Jon Doe',
        role: '',
        district: '',
        province: '',
        id: ''
      },
      $window: {
        location: {
          href: 'http://example.com',
          pathname: '/path',
          originPathname: '/path',
          hostname: 'example.com'
        }
      },
      $$date: '2024-10-10',
      $$time: '14:08'
    } satisfies SystemVariables,
    expected: 'Hello world',
    field: TextField
  },
  {
    currentValue: undefined,
    defaultValue: {
      country: 'FAR',
      addressType: AddressType.DOMESTIC
    },
    systemVariables: {
      user: {
        name: 'Jon Doe',
        role: 'Field Agent',
        district: '',
        province: '',
        id: ''
      },
      $window: {
        location: {
          href: 'http://example.com',
          pathname: '/path',
          originPathname: '/path',
          hostname: 'example.com'
        }
      },
      $$date: '2024-10-10',
      $$time: '14:08'
    } satisfies SystemVariables,
    expected: {
      country: 'FAR',
      addressType: AddressType.DOMESTIC
    },
    field: AddressField
  }
] as const

describe('replacePlaceholders', () => {
  testCases.forEach(({ expected, ...props }) => {
    it(`When currentValue is ${JSON.stringify(
      props.currentValue
    )} and defaultValue is ${JSON.stringify(
      props.defaultValue
    )} returns ${JSON.stringify(expected)}`, () => {
      const result = replacePlaceholders(props)
      expect(result).toEqual(expected)
    })
  })
})

const testCasesForDefaultValue = [
  {
    systemVariables: {
      user: {
        name: 'Jon Doe',
        role: '',
        id: '',
        province: '',
        district: ''
      },
      $window: {
        location: {
          href: 'http://example.com',
          pathname: '/path',
          originPathname: '/path',
          hostname: 'example.com'
        }
      },
      $$date: '2024-10-10',
      $$time: '14:08'
    } satisfies SystemVariables,
    expected: 'Jon Doe',
    field: TextField
  },
  {
    systemVariables: {
      user: {
        name: 'Jon Doe',
        firstname: 'Jon',
        surname: 'Doe',
        role: '',
        id: '',
        province: '',
        district: ''
      },
      $window: {
        location: {
          href: 'http://example.com',
          pathname: '/path',
          originPathname: '/path',
          hostname: 'example.com'
        }
      },
      $$date: '2024-10-10',
      $$time: '14:08'
    } satisfies SystemVariables,
    expected: {
      firstname: 'Jon',
      middlename: '',
      surname: 'Doe'
    },
    field: NameField
  }
]

describe('handleDefaultValue', () => {
  testCasesForDefaultValue.forEach(({ expected, ...props }) => {
    it(`When field type is ${JSON.stringify(
      props.field.type
    )} returns ${JSON.stringify(expected)}`, () => {
      const result = handleDefaultValue(props)
      expect(result).toEqual(expected)
    })
  })
})
