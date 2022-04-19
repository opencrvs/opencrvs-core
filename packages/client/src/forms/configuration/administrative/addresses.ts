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

import {
  BirthSection,
  DeathSection,
  FLEX_DIRECTION,
  SerializedFormField,
  ISerializedForm
} from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { MessageDescriptor } from 'react-intl'
import {
  getDefaultField,
  IDefaultField
} from '@client/forms/configuration/defaultUtils'
import { concat } from 'lodash'

export enum AddressCases {
  // the below are UPPER_CASE because they map to GQLAddress type enums
  PRIMARY_ADDRESS = 'PRIMARY_ADDRESS',
  SECONDARY_ADDRESS = 'SECONDARY_ADDRESS'
}

export enum AddressComparisonCases {
  // the below are camelCase because they map to fieldNames used in conditionals
  SECONDARY_ADDRESS_SAME_AS_PRIMARY = 'secondaryAddressSameAsPrimary',
  PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY = 'primaryAddressSameAsOtherPrimary',
  SECONDARY_ADDRESS_SAME_AS_OTHER_SECONDARY = 'secondaryAddressSameAsOtherSecondary'
}

export enum AddressSubsections {
  PRIMARY_ADDRESS_SUBSECTION = 'primaryAddress',
  SECONDARY_ADDRESS_SUBSECTION = 'secondaryAddress'
}

export interface IAddressConfiguration {
  preceedingFieldId: string
  configurations: AllowedAddressConfigurations[]
}

export type AllowedAddressConfigurations = {
  config: AddressCases | AddressSubsections | AddressComparisonCases
  label?: MessageDescriptor
  xComparisonSection?: BirthSection | DeathSection
  yComparisonSection?: BirthSection | DeathSection
  comparisonCase?: AddressComparisonCases
}

export const defaultAddressConfiguration: IAddressConfiguration[] = [
  {
    preceedingFieldId: 'birth.informant.informant-view-group.primaryAddress',
    configurations: [
      { config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION },
      { config: AddressCases.PRIMARY_ADDRESS }
    ]
  },
  {
    preceedingFieldId: 'birth.mother.mother-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      { config: AddressCases.PRIMARY_ADDRESS },
      {
        config: AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY,
        label: formMessageDescriptors.secondaryAddressSameAsPrimary,
        xComparisonSection: BirthSection.Mother,
        yComparisonSection: BirthSection.Mother
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        comparisonCase: AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY
      },
      { config: AddressCases.SECONDARY_ADDRESS }
    ]
  },
  {
    preceedingFieldId: 'birth.father.father-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressComparisonCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
        label: formMessageDescriptors.primaryAddressSameAsOtherPrimary,
        xComparisonSection: BirthSection.Father,
        yComparisonSection: BirthSection.Mother
      },
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        comparisonCase:
          AddressComparisonCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY
      },
      { config: AddressCases.PRIMARY_ADDRESS },
      {
        config:
          AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_OTHER_SECONDARY,
        label: formMessageDescriptors.secondaryAddressSameAsOtherSecondary,
        xComparisonSection: BirthSection.Father,
        yComparisonSection: BirthSection.Mother
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        comparisonCase:
          AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_OTHER_SECONDARY
      },
      { config: AddressCases.SECONDARY_ADDRESS }
    ]
  },
  {
    preceedingFieldId: 'death.deceased.deceased-view-group.occupation',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedPrimaryAddress
      },
      { config: AddressCases.PRIMARY_ADDRESS },
      {
        config: AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY,
        label: formMessageDescriptors.deceasedSecondaryAddressSameAsPrimary,
        xComparisonSection: DeathSection.Deceased,
        yComparisonSection: DeathSection.Deceased
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedSecondaryAddress,
        comparisonCase: AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY
      },
      { config: AddressCases.SECONDARY_ADDRESS }
    ]
  },
  {
    preceedingFieldId: 'death.informant.informant-view-group.relationship',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      { config: AddressCases.PRIMARY_ADDRESS },
      {
        config: AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY,
        label: formMessageDescriptors.informantSecondaryAddressSameAsPrimary,
        xComparisonSection: DeathSection.Informants,
        yComparisonSection: DeathSection.Informants
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantSecondaryAddress,
        comparisonCase: AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY
      },
      { config: AddressCases.SECONDARY_ADDRESS }
    ]
  }
]

export function getAddressFields(
  configuration: AllowedAddressConfigurations
): SerializedFormField[] {
  switch (configuration.config) {
    case AddressCases.PRIMARY_ADDRESS:
      return primaryAddressFields
    case AddressCases.SECONDARY_ADDRESS:
      return secondaryAddressFields
    case AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY ||
      AddressComparisonCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY ||
      AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_OTHER_SECONDARY:
      if (
        !configuration.label ||
        !configuration.xComparisonSection ||
        !configuration.yComparisonSection
      ) {
        throw new Error(
          `Invalid address configuration for: ${configuration.config}`
        )
      }
      return getXAddressSameAsY(
        configuration.config,
        configuration.xComparisonSection,
        configuration.yComparisonSection,
        configuration.label
      )
    case AddressSubsections.PRIMARY_ADDRESS_SUBSECTION ||
      AddressSubsections.SECONDARY_ADDRESS_SUBSECTION:
      if (!configuration.label) {
        throw new Error(
          `Invalid address configuration for: ${configuration.config}`
        )
      }
      return getAddressSubsection(
        configuration.config,
        configuration.label,
        configuration.comparisonCase
      )
    default:
      return primaryAddressFields
  }
}

export const getAddressSubsection = (
  previewGroup: AddressSubsections,
  label: MessageDescriptor,
  comparisonCase?: AddressComparisonCases
): SerializedFormField[] => {
  const fields: SerializedFormField[] = []
  const subsection: SerializedFormField = {
    name: previewGroup,
    type: 'SUBSECTION',
    label,
    previewGroup: previewGroup,
    initialValue: '',
    validate: []
  }
  if (comparisonCase) {
    subsection['conditionals'] = [
      {
        action: 'hide',
        expression: `values.${comparisonCase}`
      }
    ]
  }
  fields.push(subsection)
  return fields
}

export const getXAddressSameAsY = (
  comparisonCase: AddressComparisonCases,
  xComparisonSection: BirthSection | DeathSection,
  yComparisonSection: BirthSection | DeathSection,
  label: MessageDescriptor
): SerializedFormField[] => {
  return [
    {
      name: comparisonCase,
      type: 'RADIO_GROUP',
      label,
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
          parameters: [
            comparisonCase ===
              AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY ||
            comparisonCase ===
              AddressComparisonCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY
              ? AddressCases.PRIMARY_ADDRESS
              : AddressCases.SECONDARY_ADDRESS,
            yComparisonSection,
            comparisonCase ===
              AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY ||
            comparisonCase ===
              AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_OTHER_SECONDARY
              ? AddressCases.SECONDARY_ADDRESS
              : AddressCases.PRIMARY_ADDRESS,
            xComparisonSection
          ]
        },
        query: {
          operation: 'sameAddressFieldTransformer',
          parameters: [
            comparisonCase ===
              AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY ||
            comparisonCase ===
              AddressComparisonCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY
              ? AddressCases.PRIMARY_ADDRESS
              : AddressCases.SECONDARY_ADDRESS,
            yComparisonSection,
            comparisonCase ===
              AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_PRIMARY ||
            comparisonCase ===
              AddressComparisonCases.SECONDARY_ADDRESS_SAME_AS_OTHER_SECONDARY
              ? AddressCases.SECONDARY_ADDRESS
              : AddressCases.PRIMARY_ADDRESS,
            xComparisonSection
          ]
        }
      }
    }
  ]
}

export function populateRegisterFormsWithAddresses(
  defaultEventForm: ISerializedForm
) {
  defaultAddressConfiguration.forEach(
    (addressConfiguration: IAddressConfiguration) => {
      const preceedingDefaultField: IDefaultField | undefined = getDefaultField(
        defaultEventForm,
        addressConfiguration.preceedingFieldId
      )

      if (preceedingDefaultField) {
        let addressFields: SerializedFormField[] = []
        addressConfiguration.configurations.forEach((configuration) => {
          // At this point we can check the ApplicationConfig and see if 2 addresses are enabled
          addressFields = concat(addressFields, getAddressFields(configuration))
        })
        defaultEventForm.sections[
          preceedingDefaultField?.selectedSectionIndex
        ].groups[preceedingDefaultField?.selectedGroupIndex].fields.splice(
          preceedingDefaultField.index + 1,
          0,
          ...addressFields
        )
      }
    }
  )
}

export const primaryAddressFields: SerializedFormField[] = [
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
    initialValue: window.config.COUNTRY.toUpperCase(),
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'country']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'country']
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
      dependency: 'countryPrimary',
      initialValue: 'agentDefault'
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
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
      dependency: 'statePrimary',
      initialValue: 'agentDefault'
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 7]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 7]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 4]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 4]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 3]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 3]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 2]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 2]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 1]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 1]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 5]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 5]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 7]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 7]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 8]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 8]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 9]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 9]
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
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
            parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
          }
        ]
      }
    }
  }
]

export const secondaryAddressFields: SerializedFormField[] = [
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
    initialValue: window.config.COUNTRY.toUpperCase(),
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
        parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'country']
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'country']
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
      dependency: 'countrySecondary',
      initialValue: 'agentDefault'
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
        parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
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
      dependency: 'stateSecondary',
      initialValue: 'agentDefault'
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
        parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
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
        parameters: [AddressCases.SECONDARY_ADDRESS, 1]
      },
      query: {
        operation: 'addressToFieldTransformer',
        parameters: [AddressCases.SECONDARY_ADDRESS, 1]
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 8]
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 8]
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 9]
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 9]
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 10]
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 10]
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
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
            parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
          }
        ]
      }
    }
  }
]
