import {
  ConditionalType,
  and,
  not,
  field,
  AddressType,
  FieldType,
  FieldConfig,
  defineFormConditional,
  errorMessages
} from '@opencrvs/toolkit/events'

function isInternationalAddress() {
  return and(
    not(field('country').isUndefined()),
    field('addressType').isEqualTo(AddressType.INTERNATIONAL)
  )
}

function isDomesticAddress() {
  return and(
    not(field('country').isUndefined()),
    field('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

export function getNestedFieldValidators(
  fieldId: string,
  fields: FieldConfig[]
) {
  return fields
    .filter((x) => x.required)
    .map((field) => ({
      message:
        typeof field.required === 'object'
          ? field.required.message
          : errorMessages.requiredField,

      validator: defineFormConditional({
        type: 'object',
        properties: {
          [fieldId]: {
            type: 'object',
            properties: {
              addressType: {
                type: 'string',
                enum: ['INTERNATIONAL', 'DOMESTIC']
              },
              streetLevelDetails: {
                type: 'object',
                properties: {
                  [field.id]: { minLength: 1 }
                }
              }
            },
            if: {
              properties: {
                addressType: { const: 'INTERNATIONAL' }
              }
            },
            then: {
              required: ['streetLevelDetails'],
              properties: {
                streetLevelDetails: {
                  required: [field.id]
                }
              }
            }
          }
        },
        required: [fieldId]
      })
    }))
}

export const defaultStreetAddressConfiguration = [
  {
    id: 'town',
    required: false,
    parent: field('country'),
    label: {
      id: 'field.address.town.label',
      defaultMessage: 'Town',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'state',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    parent: field('country'),
    required: {
      message: {
        id: 'field.address.state.label.required',
        description: 'State required message',
        defaultMessage: 'State is required'
      }
    },
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: {
      message: {
        id: 'field.address.district2.label.required',
        description: 'District2 required message',
        defaultMessage: 'District is required'
      }
    },
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
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
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.postcodeOrZip.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  }
]
