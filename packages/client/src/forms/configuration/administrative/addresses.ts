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
  ISerializedForm,
  IPreviewGroup
} from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { MessageDescriptor } from 'react-intl'
import {
  getDefaultField,
  IDefaultField
} from '@client/forms/configuration/defaultUtils'
import { cloneDeep } from 'lodash'

export enum AddressCases {
  // the below are UPPER_CASE because they map to GQLAddress type enums
  PRIMARY_ADDRESS = 'PRIMARY_ADDRESS',
  SECONDARY_ADDRESS = 'SECONDARY_ADDRESS'
}

export enum EventLocationAddressCases {
  PLACE_OF_BIRTH = 'placeOfBirth',
  PLACE_OF_DEATH = 'placeOfDeath'
}

export enum AddressCopyConfigCases {
  PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY = 'primaryAddressSameAsOtherPrimary'
}

// if the informant or contact is mother
const mothersDetailsExistBasedOnContactAndInformant =
  '!mothersDetailsExistBasedOnContactAndInformant'
// if the informant or contact is father
const fathersDetailsExistBasedOnContactAndInformant =
  '!fathersDetailsExistBasedOnContactAndInformant'

// if mothers details do not exist on other page
const mothersDetailsDontExistOnOtherPage =
  'draftData && draftData.mother && !draftData.mother.detailsExist'

// if mothers details do not exist
const mothersDetailsDontExist = '!values.detailsExist'

// if fathers details do not exist
const fathersDetailsDontExist = '!values.detailsExist'

// primary address same as other primary
const primaryAddressSameAsOtherPrimaryAddress =
  'values.primaryAddressSameAsOtherPrimary'

// secondary addresses are not enabled
const secondaryAddressesDisabled = '!window.config.ADDRESSES==2'

export enum AddressSubsections {
  PRIMARY_ADDRESS_SUBSECTION = 'primaryAddress',
  SECONDARY_ADDRESS_SUBSECTION = 'secondaryAddress'
}

export interface IAddressConfiguration {
  preceedingFieldId: string
  configurations: AllowedAddressConfigurations[]
}

export type AllowedAddressConfigurations = {
  config:
    | AddressCases
    | AddressSubsections
    | AddressCopyConfigCases
    | EventLocationAddressCases
  label?: MessageDescriptor
  xComparisonSection?: BirthSection | DeathSection
  yComparisonSection?: BirthSection | DeathSection
  conditionalCase?: string
  informant?: boolean
}

export const defaultAddressConfiguration: IAddressConfiguration[] = [
  {
    preceedingFieldId: 'birth.child.child-view-group.birthLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_BIRTH }]
  },
  {
    preceedingFieldId: 'death.deathEvent.death-event-details.deathLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_DEATH }]
  },
  {
    preceedingFieldId: 'birth.informant.informant-view-group.familyNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      { config: AddressCases.PRIMARY_ADDRESS, informant: true },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantSecondaryAddress,
        conditionalCase: secondaryAddressesDisabled
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        conditionalCase: secondaryAddressesDisabled,
        informant: true
      }
    ]
  },
  {
    preceedingFieldId: 'birth.mother.mother-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: `(${mothersDetailsDontExist} && ${mothersDetailsExistBasedOnContactAndInformant})`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        informant: false,
        conditionalCase: `(${mothersDetailsDontExist} && ${mothersDetailsExistBasedOnContactAndInformant})`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `(${mothersDetailsDontExist} && ${mothersDetailsExistBasedOnContactAndInformant} && ${secondaryAddressesDisabled}) || (${secondaryAddressesDisabled})`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: false,
        conditionalCase: `(${mothersDetailsDontExist} && ${mothersDetailsExistBasedOnContactAndInformant} && ${secondaryAddressesDisabled}) || (${secondaryAddressesDisabled})`
      }
    ]
  },
  {
    preceedingFieldId: 'birth.father.father-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: `(${fathersDetailsDontExist} && ${fathersDetailsExistBasedOnContactAndInformant})`
      },
      {
        config: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
        label: formMessageDescriptors.primaryAddressSameAsOtherPrimary,
        xComparisonSection: BirthSection.Father,
        yComparisonSection: BirthSection.Mother,
        conditionalCase: `(${fathersDetailsDontExist} || ${mothersDetailsDontExistOnOtherPage})`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        informant: false,
        conditionalCase: `((${fathersDetailsDontExist} && ${fathersDetailsExistBasedOnContactAndInformant}) || ${primaryAddressSameAsOtherPrimaryAddress})`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${fathersDetailsDontExist} || ${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: false,
        conditionalCase: `${fathersDetailsDontExist} || ${secondaryAddressesDisabled}`
      }
    ]
  },
  {
    preceedingFieldId: 'death.deceased.deceased-view-group.maritalStatus',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedPrimaryAddress
      },
      { config: AddressCases.PRIMARY_ADDRESS, informant: false },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.deceasedSecondaryAddress,
        conditionalCase: secondaryAddressesDisabled
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: false,
        conditionalCase: secondaryAddressesDisabled
      }
    ]
  },
  {
    preceedingFieldId: 'death.informant.informant-view-group.familyNameEng',
    configurations: [
      {
        config: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
        label: formMessageDescriptors.primaryAddressSameAsDeceasedsPrimary,
        xComparisonSection: DeathSection.Informant,
        yComparisonSection: DeathSection.Deceased
      },
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantPrimaryAddress,
        conditionalCase: `${primaryAddressSameAsOtherPrimaryAddress}`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        informant: true,
        conditionalCase: `${primaryAddressSameAsOtherPrimaryAddress}`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.informantSecondaryAddress,
        conditionalCase: secondaryAddressesDisabled
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: true,
        conditionalCase: secondaryAddressesDisabled
      }
    ]
  }
]

export function getAddressFields(
  configuration: AllowedAddressConfigurations
): SerializedFormField[] {
  switch (configuration.config) {
    case EventLocationAddressCases.PLACE_OF_BIRTH:
    case EventLocationAddressCases.PLACE_OF_DEATH:
      return getPlaceOfEventAddressFields(configuration.config)
    case AddressCases.PRIMARY_ADDRESS:
      if (configuration.informant === undefined) {
        throw new Error(
          `Invalid address configuration, missing informant value for: ${configuration.config}`
        )
      }
      return getAddress(
        AddressCases.PRIMARY_ADDRESS,
        configuration.informant,
        configuration.conditionalCase
      )
    case AddressCases.SECONDARY_ADDRESS:
      if (configuration.informant === undefined) {
        throw new Error(
          `Invalid address configuration, missing informant value for: ${configuration.config}`
        )
      }
      return getAddress(
        AddressCases.SECONDARY_ADDRESS,
        configuration.informant,
        configuration.conditionalCase
      )
    case AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY:
      if (
        !configuration.label ||
        !configuration.xComparisonSection ||
        !configuration.yComparisonSection
      ) {
        throw new Error(
          `Invalid address comparison case configuration for: ${configuration.config}`
        )
      }
      return getXAddressSameAsY(
        configuration.xComparisonSection,
        configuration.yComparisonSection,
        configuration.label,
        configuration.conditionalCase
      )
    case AddressSubsections.PRIMARY_ADDRESS_SUBSECTION:
    case AddressSubsections.SECONDARY_ADDRESS_SUBSECTION:
      if (!configuration.label) {
        throw new Error(
          `Invalid address subsection configuration for: ${configuration.config}`
        )
      }
      return getAddressSubsection(
        configuration.config,
        configuration.label,
        configuration.conditionalCase
      )
    default:
      return []
  }
}

export function getPreviewGroups(
  configuration: AllowedAddressConfigurations
): IPreviewGroup[] {
  switch (configuration.config) {
    case EventLocationAddressCases.PLACE_OF_BIRTH:
      return [
        {
          id: 'placeOfBirth',
          label: {
            defaultMessage: 'Place of delivery',
            description: 'Title for place of birth sub section',
            id: 'form.field.label.placeOfBirthPreview'
          },
          fieldToRedirect: 'placeOfBirth'
        }
      ]
    case EventLocationAddressCases.PLACE_OF_DEATH:
      return [
        {
          id: 'placeOfDeath',
          label: {
            defaultMessage: 'Where did the death occur?',
            description: 'Title for place of death sub section',
            id: 'form.field.label.placeOfDeath'
          },
          fieldToRedirect: 'placeOfDeath'
        }
      ]
    case AddressCases.PRIMARY_ADDRESS:
      return [
        {
          id: 'primaryAddress',
          label: {
            defaultMessage: 'Residential address',
            description:
              'Preview groups label for form field: residential address',
            id: 'form.field.previewGroups.primaryAddress'
          },
          fieldToRedirect: 'countryPrimary'
        }
      ]
    case AddressCases.SECONDARY_ADDRESS:
      return [
        {
          id: 'secondaryAddress',
          label: {
            defaultMessage: 'Current address',
            description: 'Tag definition for crrent address',
            id: 'form.preview.tag.current.address'
          },
          fieldToRedirect: 'countrySecondary'
        }
      ]
    default:
      return []
  }
}

export const getAddressSubsection = (
  previewGroup: AddressSubsections,
  label: MessageDescriptor,
  conditionalCase?: string
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

  if (conditionalCase) {
    subsection['conditionals'] = [
      {
        action: 'hide',
        expression: `${conditionalCase}`
      }
    ]
  }
  fields.push(subsection)
  return fields
}

export const getXAddressSameAsY = (
  xComparisonSection: BirthSection | DeathSection,
  yComparisonSection: BirthSection | DeathSection,
  label: MessageDescriptor,
  conditionalCase?: string
): SerializedFormField[] => {
  const copyAddressField: SerializedFormField = {
    name: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
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
    conditionals: conditionalCase
      ? [
          {
            action: 'hide',
            expression: `${conditionalCase}`
          }
        ]
      : [],
    mapping: {
      mutation: {
        operation: 'copyAddressTransformer',
        parameters: [
          AddressCases.PRIMARY_ADDRESS,
          yComparisonSection,
          AddressCases.PRIMARY_ADDRESS,
          xComparisonSection
        ]
      },
      query: {
        operation: 'sameAddressFieldTransformer',
        parameters: [
          AddressCases.PRIMARY_ADDRESS,
          yComparisonSection,
          AddressCases.PRIMARY_ADDRESS,
          xComparisonSection
        ]
      }
    }
  }
  if (conditionalCase) {
    copyAddressField['conditionals'] = [
      {
        action: 'hide',
        expression: `${conditionalCase}`
      }
    ]
  }
  return [copyAddressField]
}

const shouldAddAddressFields = (
  configuration: AllowedAddressConfigurations
) => {
  if (
    (configuration.config === AddressSubsections.SECONDARY_ADDRESS_SUBSECTION ||
      configuration.config === AddressCases.SECONDARY_ADDRESS) &&
    window.config.ADDRESSES === 2
  ) {
    return true
  } else if (
    (configuration.config === AddressSubsections.SECONDARY_ADDRESS_SUBSECTION ||
      configuration.config === AddressCases.SECONDARY_ADDRESS) &&
    window.config.ADDRESSES === 1
  ) {
    return false
  } else {
    return true
  }
}

export function populateRegisterFormsWithAddresses(
  defaultEventForm: ISerializedForm,
  event: string
) {
  const newForm = cloneDeep(defaultEventForm)
  defaultAddressConfiguration.forEach(
    (addressConfiguration: IAddressConfiguration) => {
      if (addressConfiguration.preceedingFieldId.includes(event)) {
        const preceedingDefaultField: IDefaultField | undefined =
          getDefaultField(newForm, addressConfiguration.preceedingFieldId)

        let addressFields: SerializedFormField[] = []
        let previewGroups: IPreviewGroup[] = []
        if (preceedingDefaultField) {
          addressConfiguration.configurations.forEach((configuration) => {
            if (shouldAddAddressFields(configuration)) {
              const tmpAddressFields: SerializedFormField[] =
                addressFields.concat(getAddressFields(configuration))
              addressFields = tmpAddressFields
              const tmpPreviewGroups: IPreviewGroup[] = previewGroups.concat(
                getPreviewGroups(configuration)
              )
              previewGroups = tmpPreviewGroups
            }
          })
        }
        if (preceedingDefaultField && addressFields.length) {
          newForm.sections[preceedingDefaultField?.selectedSectionIndex].groups[
            preceedingDefaultField?.selectedGroupIndex
          ].fields.splice(preceedingDefaultField.index + 1, 0, ...addressFields)
        }

        if (preceedingDefaultField && previewGroups.length) {
          const group =
            newForm.sections[preceedingDefaultField?.selectedSectionIndex]
              .groups[preceedingDefaultField?.selectedGroupIndex]
          if (group.previewGroups) {
            const newPreviewGroups: IPreviewGroup[] =
              group.previewGroups.concat(previewGroups)
            group.previewGroups = newPreviewGroups
          } else {
            group.previewGroups = previewGroups
          }
        }
      }
    }
  )
  return newForm
}

export function getAddress(
  addressCase: AddressCases,
  informant: boolean,
  conditionalCase?: string
): SerializedFormField[] {
  const defaultFields: SerializedFormField[] =
    addressCase === AddressCases.PRIMARY_ADDRESS
      ? getPrimaryAddressFields(informant)
      : getSecondaryAddressFields(informant)
  if (conditionalCase) {
    defaultFields.forEach((field) => {
      let conditional
      if (conditionalCase) {
        conditional = {
          action: 'hide',
          expression: `${conditionalCase}`
        }
      }
      if (
        conditional &&
        field.conditionals &&
        field.conditionals.filter(
          (conditional) => conditional.expression === conditionalCase
        ).length === 0
      ) {
        field.conditionals.push(conditional)
      } else if (conditional && !field.conditionals) {
        field.conditionals = [conditional]
      }
    })
  }
  return defaultFields
}

function getPrimaryAddressFields(informant: boolean): SerializedFormField[] {
  return [
    {
      name: 'countryPrimary',
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'country']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'country']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'country']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'country']
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
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
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
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
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
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 6]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 6]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 6]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 6]
            }
      }
    },
    {
      name: 'cityUrbanOptionPrimary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
            }
      }
    },
    {
      name: 'addressLine3UrbanOptionPrimary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 3]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 3]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 3]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 3]
            }
      }
    },
    {
      name: 'addressLine2UrbanOptionPrimary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 2]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 2]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 2]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 2]
            }
      }
    },
    {
      name: 'numberUrbanOptionPrimary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 1]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 1]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 1]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 1]
            }
      }
    },
    {
      name: 'postcodePrimary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
            }
      }
    },
    {
      name: 'addressLine5Primary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countryPrimary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 5]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 5]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 5]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 5]
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'state']
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'district']
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'city']
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 7]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 7]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 7]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 7]
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 8]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 8]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 8]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 8]
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 9]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 9]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 9]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 9]
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.PRIMARY_ADDRESS, 0, 'postalCode']
            }
      }
    }
  ]
}
function getSecondaryAddressFields(informant: boolean): SerializedFormField[] {
  return [
    {
      name: 'countrySecondary',
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'country']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'country']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'country']
                }
              ]
            }
          : {
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
      customisable: false,
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
          expression: '!values.countrySecondary'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
                }
              ]
            }
          : {
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
      customisable: false,
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
          expression: '!values.countrySecondary'
        },
        {
          action: 'hide',
          expression: '!values.stateSecondary'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
            }
      }
    },
    {
      name: 'ruralOrUrbanSecondary',
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
      customisable: false,
      previewGroup: 'secondaryAddress',
      hideValueInPreview: true,
      required: false,
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
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 6]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 6]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 6]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 6]
            }
      }
    },
    {
      name: 'cityUrbanOptionSecondary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrbanSecondary !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
            }
      }
    },
    {
      name: 'addressLine3UrbanOptionSecondary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrbanSecondary !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 3]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 3]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 3]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 3]
            }
      }
    },
    {
      name: 'addressLine2UrbanOptionSecondary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrbanSecondary !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 2]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 2]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 2]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 2]
            }
      }
    },
    {
      name: 'numberUrbanOptionSecondary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrbanSecondary !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 1]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 1]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 1]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 1]
            }
      }
    },
    {
      name: 'postcodeSecondary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrbanSecondary !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
            }
      }
    },
    {
      name: 'addressLine5Secondary',
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      customisable: false,
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
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrbanSecondary !== "RURAL"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 5]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 5]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 5]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 5]
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
      customisable: false,
      previewGroup: 'secondaryAddress',
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'state']
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
      customisable: false,
      previewGroup: 'secondaryAddress',
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.countrySecondary)'
        }
      ],
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'district']
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'city']
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 7]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 7]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 7]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 7]
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 8]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 8]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 8]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 8]
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 9]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 9]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 9]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 9]
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
      customisable: false,
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
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [AddressCases.SECONDARY_ADDRESS, 0, 'postalCode']
            }
      }
    }
  ]
}

export function getPlaceOfEventAddressFields(
  configCase: EventLocationAddressCases
): SerializedFormField[] {
  return [
    {
      name: 'country',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      previewGroup: configCase,
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
      conditionals: [
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['country']
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: []
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: []
        }
      }
    },
    {
      name: 'state',
      customisable: false,
      type: 'SELECT_WITH_DYNAMIC_OPTIONS',
      label: {
        defaultMessage: 'Province',
        description: 'Title for the state select',
        id: 'form.field.label.state'
      },
      previewGroup: configCase,
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
        dependency: 'country',
        initialValue: 'agentDefault'
      },
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['state']
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: []
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            0,
            'state',
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'district',
      customisable: false,
      type: 'SELECT_WITH_DYNAMIC_OPTIONS',
      label: {
        defaultMessage: 'District',
        description: 'Title for the district select',
        id: 'form.field.label.district'
      },
      previewGroup: configCase,
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
        dependency: 'state',
        initialValue: 'agentDefault'
      },
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['district']
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: []
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            0,
            'district',
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'ruralOrUrban',
      customisable: false,
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
      required: false,
      hideValueInPreview: true,
      previewGroup: configCase,
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [6]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [6]
        }
      }
    },
    {
      name: 'cityUrbanOption',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [0, 'city']
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [0, 'city']
        }
      }
    },
    {
      name: 'addressLine3UrbanOption',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [3]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [3]
        }
      }
    },
    {
      name: 'addressLine2UrbanOption',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [2]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [2]
        }
      }
    },
    {
      name: 'numberUrbanOption',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [1]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [1]
        }
      }
    },
    {
      name: 'postalCode',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [0, 'postalCode']
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [0, 'postalCode']
        }
      }
    },
    {
      name: 'addressLine5',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "RURAL"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [5]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [5]
        }
      }
    },
    {
      name: 'internationalState',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'State',
        description: 'Title for the international state select',
        id: 'form.field.label.internationalState'
      },
      previewGroup: configCase,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['state']
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [0, 'state']
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            0,
            'state',
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'internationalDistrict',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'District',
        description: 'Title for the international district select',
        id: 'form.field.label.internationalDistrict'
      },
      previewGroup: configCase,
      required: true,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['district']
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [0, 'district']
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            0,
            'district',
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'internationalCity',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'City / Town',
        description: 'Title for the international city select',
        id: 'form.field.label.internationalCity'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [0, 'city']
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [0, 'city']
        }
      }
    },
    {
      name: 'internationalAddressLine1',
      type: 'TEXT',
      customisable: false,
      label: {
        defaultMessage: 'Address Line 1',
        description: 'Title for the international address line 1 select',
        id: 'form.field.label.internationalAddressLine1'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [7]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [7]
        }
      }
    },
    {
      name: 'internationalAddressLine2',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 2',
        description: 'Title for the international address line 2 select',
        id: 'form.field.label.internationalAddressLine2'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [8]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [8]
        }
      }
    },
    {
      name: 'internationalAddressLine3',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 3',
        description: 'Title for the international address line 3 select',
        id: 'form.field.label.internationalAddressLine3'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [9]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [9]
        }
      }
    },
    {
      name: 'internationalPostcode',
      customisable: false,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : 'deathEventLocationMutationTransformer',
          parameters: [0, 'postalCode']
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [0, 'postalCode']
        }
      }
    }
  ]
}
