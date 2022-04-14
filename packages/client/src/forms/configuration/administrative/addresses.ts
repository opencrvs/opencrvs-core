/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { BirthSection, DeathSection, FLEX_DIRECTION, SerializedFormField } from '@client/forms/index'

export enum AddressCases {
  PRIMARY = 'primary',
  SECONDARY = 'secondary'
}

export const primaryAddressFields: SerializedFormField[] = [{
  name: 'primaryAddress',
  type: 'SUBSECTION',
  label: {
    defaultMessage: 'What is her residential address?',
    description: 'Title for the permanent address fields',
    id: 'form.field.label.motherPrimaryAddress'
  },
  previewGroup: 'primaryAddress',
  initialValue: '',
  validate: []
},
  {
    name: 'countryPrimary',
    type: 'SELECT_WITH_OPTIONS',
    label: {
      defaultMessage: 'Country',
      description: 'Title for the country select',
      id: 'form.field.label.country'
    },
    previewGroup: 'primaryAddress',
    required: true,
    initialValue: 'FAR',
    validate: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    options: {
      resource: 'countries'
    },
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'country']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'country']
          }
        ]
      }
    }
  },
  {
    name: 'statePrimary',
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: 'Province',
      description: 'Title for the state select',
      id: 'form.field.label.state'
    },
    previewGroup: 'primaryAddress',
    required: true,
    initialValue: '',
    validate: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    dynamicOptions: {
      resource: 'locations',
      dependency: 'countryPrimary'
    },
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'state']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'state']
          }
        ]
      }
    }
  },
  {
    name: 'districtPrimary',
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: 'District',
      description: 'Title for the district select',
      id: 'form.field.label.district'
    },
    previewGroup: 'primaryAddress',
    required: true,
    initialValue: '',
    validate: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    dynamicOptions: {
      resource: 'locations',
      dependency: 'statePrimary'
    },
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      },
      {
        action: 'hide',
        expression: '!values.statePrimary'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'district']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'district']
          }
        ]
      }
    }
  },
  {
    name: 'ruralOrUrbanPrimary',
    type: 'RADIO_GROUP',
    label: {
      defaultMessage: ' ',
      description: 'Empty label for form field',
      id: 'form.field.label.emptyLabel'
    },
    options: [
      {
        label: {
          defaultMessage: 'Urban',
          id: 'form.field.label.urban',
          description: 'Label for form field checkbox option Urban'
        },
        value: 'URBAN'
      },
      {
        label: {
          defaultMessage: 'Rural',
          id: 'form.field.label.rural',
          description: 'Label for form field checkbox option Rural'
        },
        value: 'RURAL'
      }
    ],
    initialValue: 'URBAN',
    flexDirection: FLEX_DIRECTION.ROW,
    previewGroup: 'primaryAddress',
    hideValueInPreview: true,
    required: false,
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      },
      {
        action: 'hide',
        expression: '!values.statePrimary'
      },
      {
        action: 'hide',
        expression: '!values.districtPrimary'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 7]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 7]
          }
        ]
      }
    }
  },
  {
    name: 'addressLine4CityOptionPrimary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Town',
      description: 'Title for the address line 4',
      id: 'form.field.label.addressLine4CityOption'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      },
      {
        action: 'hide',
        expression: '!values.statePrimary'
      },
      {
        action: 'hide',
        expression: '!values.districtPrimary'
      },
      {
        action: 'hide',
        expression: 'values.ruralOrUrbanPrimary !== "URBAN"'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 4]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 4]
          }
        ]
      }
    }
  },
  {
    name: 'addressLine3CityOptionPrimary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Residential Area',
      description: 'Title for the address line 3 option 2',
      id: 'form.field.label.addressLine3CityOption'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      },
      {
        action: 'hide',
        expression: '!values.statePrimary'
      },
      {
        action: 'hide',
        expression: '!values.districtPrimary'
      },
      {
        action: 'hide',
        expression: 'values.ruralOrUrbanPrimary !== "URBAN"'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 3]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 3]
          }
        ]
      }
    }
  },
  {
    name: 'addressLine2CityOptionPrimary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Street / Plot Number',
      description: 'Title for the address line 1',
      id: 'form.field.label.addressLine2CityOption'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      },
      {
        action: 'hide',
        expression: '!values.statePrimary'
      },
      {
        action: 'hide',
        expression: '!values.districtPrimary'
      },
      {
        action: 'hide',
        expression: 'values.ruralOrUrbanPrimary !== "URBAN"'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 2]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 2]
          }
        ]
      }
    }
  },
  {
    name: 'numberOptionPrimary',
    type: 'NUMBER',
    label: {
      defaultMessage: 'Number',
      description: 'Title for the number field',
      id: 'form.field.label.number'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      },
      {
        action: 'hide',
        expression: '!values.statePrimary'
      },
      {
        action: 'hide',
        expression: '!values.districtPrimary'
      },
      {
        action: 'hide',
        expression: 'values.ruralOrUrbanPrimary !== "URBAN"'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 1]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 1]
          }
        ]
      }
    }
  },
  {
    name: 'addressLine1Primary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Village',
      description: 'Title for the address line 1',
      id: 'form.field.label.addressLine1'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countryPrimary'
      },
      {
        action: 'hide',
        expression: '!values.statePrimary'
      },
      {
        action: 'hide',
        expression: '!values.districtPrimary'
      },
      {
        action: 'hide',
        expression: 'values.ruralOrUrbanPrimary !== "RURAL"'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 5]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 5]
          }
        ]
      }
    }
  },
  {
    name: 'internationalStatePrimary',
    type: 'TEXT',
    label: {
      defaultMessage: 'State',
      description: 'Title for the international state select',
      id: 'form.field.label.internationalState'
    },
    previewGroup: 'primaryAddress',
    required: true,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countryPrimary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'state']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'state']
          }
        ]
      }
    }
  },
  {
    name: 'internationalDistrictPrimary',
    type: 'TEXT',
    label: {
      defaultMessage: 'District',
      description: 'Title for the international district select',
      id: 'form.field.label.internationalDistrict'
    },
    previewGroup: 'primaryAddress',
    required: true,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countryPrimary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'district']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'district']
          }
        ]
      }
    }
  },
  {
    name: 'internationalCityPrimary',
    type: 'TEXT',
    label: {
      defaultMessage: 'City / Town',
      description: 'Title for the international city select',
      id: 'form.field.label.internationalCity'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countryPrimary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'city']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'city']
          }
        ]
      }
    }
  },
  {
    name: 'internationalAddressLine1Primary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Address Line 1',
      description: 'Title for the international address line 1 select',
      id: 'form.field.label.internationalAddressLine1'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countryPrimary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 7]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 7]
          }
        ]
      }
    }
  },
  {
    name: 'internationalAddressLine2Primary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Address Line 2',
      description: 'Title for the international address line 2 select',
      id: 'form.field.label.internationalAddressLine2'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countryPrimary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 8]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 8]
          }
        ]
      }
    }
  },
  {
    name: 'internationalAddressLine3Primary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Address Line 3',
      description: 'Title for the international address line 3 select',
      id: 'form.field.label.internationalAddressLine3'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countryPrimary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 9]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 9]
          }
        ]
      }
    }
  },
  {
    name: 'internationalPostcodePrimary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Postcode / Zip',
      description: 'Title for the international postcode',
      id: 'form.field.label.internationalPostcode'
    },
    previewGroup: 'primaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countryPrimary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'postalCode']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['PRIMARY_ADDRESS', 0, 'postalCode']
          }
        ]
      }
    }
  }
]

export const getSecondaryAddressSameAsPrimary(comparisonSection: BirthSection | DeathSection):SerializedFormField[] {
return JSON.parse(JSON.stringify({
  name: 'secondaryAddressSameAsPrimary',
  type: 'RADIO_GROUP',
  label: {
    defaultMessage:
      'Is her usual place of residence the same as her residential address?',
    description:
      'Title for the radio button to select that the mothers current address is the same as her permanent address',
    id: 'form.field.label.secondaryAddressSameAsPrimary'
  },
  required: true,
  initialValue: true,
  validate: [],
  options: [
    {
      value: true,
      label: {
        defaultMessage: 'Yes',
        description: 'confirmation label for yes / no radio button',
        id: 'form.field.label.confirm'
      }
    },
    {
      value: false,
      label: {
        defaultMessage: 'No',
        description: 'deny label for yes / no radio button',
        id: 'form.field.label.deny'
      }
    }
  ],
  conditionals: [],
  mapping: {
    mutation: {
      operation: 'copyAddressTransformer',
      parameters: ['PRIMARY_ADDRESS', 'SUBSTITUTION', 'SECONDARY_ADDRESS', 'SUBSTITUTION']
    },
    query: {
      operation: 'sameAddressFieldTransformer',
      parameters: ['PRIMARY_ADDRESS', 'SUBSTITUTION', 'SECONDARY_ADDRESS', 'SUBSTITUTION']
    }
  }
}).replace('SUBSTITUTION',`${comparisonSection}`))as SerializedFormField[]
}

export const secondaryAddressFields: SerializedFormField[] = [
  {
    name: 'secondaryAddress',
    type: 'SUBSECTION',
    label: {
      defaultMessage: 'Current Address',
      description: 'Title for the current address fields',
      id: 'form.field.label.secondaryAddress'
    },
    previewGroup: 'secondaryAddress',
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'values.secondaryAddressSameAsPrimary'
      }
    ]
  },
  {
    name: 'countrySecondary',
    type: 'SELECT_WITH_OPTIONS',
    label: {
      defaultMessage: 'Country',
      description: 'Title for the country select',
      id: 'form.field.label.country'
    },
    previewGroup: 'secondaryAddress',
    required: true,
    initialValue: 'FAR',
    validate: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    options: {
      resource: 'countries'
    },
    mapping: {
      mutation: {
        operation: 'fieldToAddressTransformer',
        parameters: ['SECONDARY_ADDRESS', 0, 'country']
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: ['SECONDARY_ADDRESS', 0, 'country']
      }
    }
  },
  {
    name: 'stateSecondary',
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: 'Province',
      description: 'Title for the state select',
      id: 'form.field.label.state'
    },
    previewGroup: 'secondaryAddress',
    required: true,
    initialValue: '',
    validate: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    dynamicOptions: {
      resource: 'locations',
      dependency: 'countrySecondary'
    },
    conditionals: [
      {
        action: 'hide',
        expression: '!isDefaultCountry(values.countrySecondary)'
      },
      {
        action: 'hide',
        expression: '!values.countrySecondary'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldToAddressTransformer',
        parameters: ['SECONDARY_ADDRESS', 0, 'state']
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: ['SECONDARY_ADDRESS', 0, 'state']
      }
    }
  },
  {
    name: 'districtSecondary',
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: 'District',
      description: 'Title for the district select',
      id: 'form.field.label.district'
    },
    previewGroup: 'secondaryAddress',
    required: true,
    initialValue: '',
    validate: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    dynamicOptions: {
      resource: 'locations',
      dependency: 'stateSecondary'
    },
    conditionals: [
      {
        action: 'hide',
        expression: '!isDefaultCountry(values.countrySecondary)'
      },
      {
        action: 'hide',
        expression: '!values.countrySecondary'
      },
      {
        action: 'hide',
        expression: '!values.stateSecondary'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldToAddressTransformer',
        parameters: ['SECONDARY_ADDRESS', 0, 'district']
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: ['SECONDARY_ADDRESS', 0, 'district']
      }
    }
  },
  {
    name: 'addressLine1Secondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Village',
      description: 'Title for the address line 1',
      id: 'form.field.label.addressLine1'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: '!values.countrySecondary'
      },
      {
        action: 'hide',
        expression: '!values.stateSecondary'
      },
      {
        action: 'hide',
        expression: '!values.districtSecondary'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldToAddressTransformer',
        parameters: ['SECONDARY_ADDRESS', 1]
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: ['SECONDARY_ADDRESS', 1]
      }
    }
  },
  {
    name: 'internationalStateSecondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'State',
      description: 'Title for the international state select',
      id: 'form.field.label.internationalState'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countrySecondary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'state']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'state']
          }
        ]
      }
    }
  },
  {
    name: 'internationalDistrictSecondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'District',
      description: 'Title for the international district select',
      id: 'form.field.label.internationalDistrict'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countrySecondary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'district']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'district']
          }
        ]
      }
    }
  },
  {
    name: 'internationalCitySecondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'City / Town',
      description: 'Title for the international city select',
      id: 'form.field.label.internationalCity'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countrySecondary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'city']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'city']
          }
        ]
      }
    }
  },
  {
    name: 'internationalAddressLine1Secondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Address Line 1',
      description: 'Title for the international address line 1 select',
      id: 'form.field.label.internationalAddressLine1'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countrySecondary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['SECONDARY_ADDRESS', 8]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['SECONDARY_ADDRESS', 8]
          }
        ]
      }
    }
  },
  {
    name: 'internationalAddressLine2Secondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Address Line 2',
      description: 'Title for the international address line 2 select',
      id: 'form.field.label.internationalAddressLine2'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countrySecondary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['SECONDARY_ADDRESS', 9]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['SECONDARY_ADDRESS', 9]
          }
        ]
      }
    }
  },
  {
    name: 'internationalAddressLine3Secondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Address Line 3',
      description: 'Title for the international address line 3 select',
      id: 'form.field.label.internationalAddressLine3'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countrySecondary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['SECONDARY_ADDRESS', 10]
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['SECONDARY_ADDRESS', 10]
          }
        ]
      }
    }
  },
  {
    name: 'internationalPostcodeSecondary',
    type: 'TEXT',
    label: {
      defaultMessage: 'Postcode / Zip',
      description: 'Title for the international postcode',
      id: 'form.field.label.internationalPostcode'
    },
    previewGroup: 'secondaryAddress',
    required: false,
    initialValue: '',
    validate: [],
    conditionals: [
      {
        action: 'hide',
        expression: 'isDefaultCountry(values.countrySecondary)'
      }
    ],
    mapping: {
      mutation: {
        operation: 'fieldValueNestingTransformer',
        parameters: [
          'individual',
          {
            operation: 'fieldToAddressTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'postalCode']
          },
          'address'
        ]
      },
      query: {
        operation: 'nestedValueToFieldTransformer',
        parameters: [
          'individual',
          {
            operation: 'addressToFieldTransformer',
            parameters: ['SECONDARY_ADDRESS', 0, 'postalCode']
          }
        ]
      }
    }
  }
]

export function getDefaultAddresses(
  useCase: AddressCases
): SerializedFormField[] {
  switch (useCase) {
    case AddressCases.PRIMARY:
      return primaryAddressFields
    case AddressCases.SECONDARY:
      return secondaryAddressFields
    default:
      return primaryAddressFields
  }
}
