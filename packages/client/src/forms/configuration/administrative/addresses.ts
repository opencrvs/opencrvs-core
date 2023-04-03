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
  MarriageSection,
  FLEX_DIRECTION,
  SerializedFormField,
  ISerializedForm,
  IPreviewGroup
} from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { MessageDescriptor } from 'react-intl'
import { cloneDeep } from 'lodash'
import { getFieldIdentifiers } from '@client/forms/questionConfig'
import {
  getLocationSelect,
  getPlaceOfEventLocationSelect,
  getRuralOrUrbanConditionals
} from '@client/forms/configuration/administrative/utils'
import { sentenceCase } from '@client/utils/data-formatting'

export enum AddressCases {
  // the below are UPPER_CASE because they map to GQLAddress type enums
  PRIMARY_ADDRESS = 'PRIMARY_ADDRESS',
  SECONDARY_ADDRESS = 'SECONDARY_ADDRESS'
}

export enum EventLocationAddressCases {
  PLACE_OF_BIRTH = 'placeOfBirth',
  PLACE_OF_DEATH = 'placeOfDeath',
  PLACE_OF_MARRIAGE = 'placeOfMarriage'
}

export enum AddressCopyConfigCases {
  PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY = 'primaryAddressSameAsOtherPrimary'
}

// if the informant or contact is mother
const mothersDetailsDontExistBasedOnContactAndInformant =
  '!mothersDetailsExistBasedOnContactAndInformant'
// if the informant or contact is father
const fathersDetailsDontExistBasedOnContactAndInformant =
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
const secondaryAddressesDisabled = 'window.config.ADDRESSES!=2'

export const MOTHER_DETAILS_DONT_EXIST = `(${mothersDetailsDontExist} && ${mothersDetailsDontExistBasedOnContactAndInformant})`

export const FATHER_DETAILS_DONT_EXIST = `(${fathersDetailsDontExist} && ${fathersDetailsDontExistBasedOnContactAndInformant})`

export enum AddressSubsections {
  PRIMARY_ADDRESS_SUBSECTION = 'primaryAddress',
  SECONDARY_ADDRESS_SUBSECTION = 'secondaryAddress'
}

export interface IAddressConfiguration {
  precedingFieldId: string
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
    precedingFieldId: 'birth.child.child-view-group.birthLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_BIRTH }]
  },
  {
    precedingFieldId: 'death.deathEvent.death-event-details.deathLocation',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_DEATH }]
  },
  {
    precedingFieldId:
      'marriage.marriageEvent.marriage-event-details.placeOfMarriageTitle',
    configurations: [{ config: EventLocationAddressCases.PLACE_OF_MARRIAGE }]
  },
  {
    precedingFieldId: 'birth.informant.informant-view-group.familyNameEng',
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
    precedingFieldId: 'birth.mother.mother-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST}`
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        informant: false,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST}`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST} || (${secondaryAddressesDisabled})`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: false,
        conditionalCase: `${MOTHER_DETAILS_DONT_EXIST} || (${secondaryAddressesDisabled})`
      }
    ]
  },
  {
    precedingFieldId: 'birth.father.father-view-group.educationalAttainment',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress,
        conditionalCase: `${FATHER_DETAILS_DONT_EXIST}`
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
        conditionalCase: `((${FATHER_DETAILS_DONT_EXIST} || ${primaryAddressSameAsOtherPrimaryAddress}) && !(${mothersDetailsDontExistOnOtherPage}) || ((${fathersDetailsDontExist}) && (${mothersDetailsDontExistOnOtherPage})))`
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${FATHER_DETAILS_DONT_EXIST} || ${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: false,
        conditionalCase: `${FATHER_DETAILS_DONT_EXIST} || ${secondaryAddressesDisabled}`
      }
    ]
  },
  {
    precedingFieldId: 'death.deceased.deceased-view-group.maritalStatus',
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
    precedingFieldId: 'death.informant.informant-view-group.familyNameEng',
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
  },
  {
    precedingFieldId: 'marriage.groom.groom-view-group.marriedLastNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        informant: false
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: false,
        conditionalCase: `${secondaryAddressesDisabled}`
      }
    ]
  },
  {
    precedingFieldId: 'marriage.bride.bride-view-group.marriedLastNameEng',
    configurations: [
      {
        config: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.primaryAddress
      },
      {
        config: AddressCases.PRIMARY_ADDRESS,
        informant: false
      },
      {
        config: AddressSubsections.SECONDARY_ADDRESS_SUBSECTION,
        label: formMessageDescriptors.secondaryAddress,
        conditionalCase: `${secondaryAddressesDisabled}`
      },
      {
        config: AddressCases.SECONDARY_ADDRESS,
        informant: false,
        conditionalCase: `${secondaryAddressesDisabled}`
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
    case EventLocationAddressCases.PLACE_OF_MARRIAGE:
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
    case EventLocationAddressCases.PLACE_OF_MARRIAGE:
      return [
        {
          id: 'placeOfMarriage',
          label: {
            defaultMessage: 'Place of marriage',
            description:
              'Label for form field: Place of occurrence of marriage',
            id: 'form.field.label.placeOfMarriage'
          },
          fieldToRedirect: 'placeOfMarriage'
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
            defaultMessage: 'Secondary address',
            description: 'Preview group label for secodary address',
            id: 'form.field.previewGroups.secondaryAddress'
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
    validator: []
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
    previewGroup: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
    validator: [],
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

export function populateRegisterFormsWithAddresses(
  defaultEventForm: ISerializedForm,
  event: string
) {
  const newForm = cloneDeep(defaultEventForm)

  defaultAddressConfiguration.forEach(
    ({ precedingFieldId, configurations }: IAddressConfiguration) => {
      if (precedingFieldId.includes(event)) {
        const { sectionIndex, groupIndex, fieldIndex } = getFieldIdentifiers(
          precedingFieldId,
          newForm
        )

        let addressFields: SerializedFormField[] = []
        let previewGroups: IPreviewGroup[] = []
        configurations.forEach((configuration) => {
          addressFields = addressFields.concat(getAddressFields(configuration))
          previewGroups = previewGroups.concat(getPreviewGroups(configuration))
        })
        newForm.sections[sectionIndex].groups[groupIndex].fields.splice(
          fieldIndex + 1,
          0,
          ...addressFields
        )

        const group = newForm.sections[sectionIndex].groups[groupIndex]
        if (group.previewGroups) {
          group.previewGroups = group.previewGroups.concat(previewGroups)
        } else {
          group.previewGroups = previewGroups
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
  const defaultFields: SerializedFormField[] = getAddressCaseFields(
    addressCase,
    informant
  )
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

function getAdminLevelSelects(
  useCase: string,
  informant: boolean
): SerializedFormField[] {
  switch (window.config.ADMIN_LEVELS) {
    case 1:
      return [getLocationSelect('state', useCase, 0, informant)]
    case 2:
      return [
        getLocationSelect('state', useCase, 0, informant),
        getLocationSelect('district', useCase, 0, informant)
      ]
    case 3:
      return [
        getLocationSelect('state', useCase, 0, informant),
        getLocationSelect('district', useCase, 0, informant),
        getLocationSelect('locationLevel3', useCase, 10, informant)
      ]
    case 4:
      return [
        getLocationSelect('state', useCase, 0, informant),
        getLocationSelect('district', useCase, 0, informant),
        getLocationSelect('locationLevel3', useCase, 10, informant),
        getLocationSelect('locationLevel4', useCase, 11, informant)
      ]
    case 5:
      return [
        getLocationSelect('state', useCase, 0, informant),
        getLocationSelect('district', useCase, 0, informant),
        getLocationSelect('locationLevel3', useCase, 10, informant),
        getLocationSelect('locationLevel4', useCase, 11, informant),
        getLocationSelect('locationLevel5', useCase, 12, informant)
      ]
    default:
      return [getLocationSelect('state', useCase, 0, informant)]
  }
}

function getPlaceOfEventAdminLevelSelects(
  configCase: EventLocationAddressCases
): SerializedFormField[] {
  switch (window.config.ADMIN_LEVELS) {
    case 1:
      return [getPlaceOfEventLocationSelect('state', configCase, 0)]
    case 2:
      return [
        getPlaceOfEventLocationSelect('state', configCase, 0),
        getPlaceOfEventLocationSelect('district', configCase, 0)
      ]
    case 3:
      return [
        getPlaceOfEventLocationSelect('state', configCase, 0),
        getPlaceOfEventLocationSelect('district', configCase, 0),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10)
      ]
    case 4:
      return [
        getPlaceOfEventLocationSelect('state', configCase, 0),
        getPlaceOfEventLocationSelect('district', configCase, 0),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10),
        getPlaceOfEventLocationSelect('locationLevel4', configCase, 11)
      ]
    case 5:
      return [
        getPlaceOfEventLocationSelect('state', configCase, 0),
        getPlaceOfEventLocationSelect('district', configCase, 0),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10),
        getPlaceOfEventLocationSelect('locationLevel4', configCase, 11),
        getPlaceOfEventLocationSelect('locationLevel5', configCase, 12)
      ]
    default:
      return [getPlaceOfEventLocationSelect('state', configCase, 0)]
  }
}

function getAddressCaseFields(
  addressCase: AddressCases,
  informant: boolean
): SerializedFormField[] {
  const useCase =
    addressCase === AddressCases.PRIMARY_ADDRESS ? 'primary' : 'secondary'
  return [
    {
      name: `country${sentenceCase(useCase)}`,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validator: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: {
        resource: 'countries'
      },
      mapping: {
        template: {
          fieldName: `country${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'country']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 0, 'country']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 0, 'country']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 0, 'country']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 0, 'country']
            }
      }
    },
    ...getAdminLevelSelects(useCase, informant),
    {
      name: `ruralOrUrban${sentenceCase(useCase)}`,
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
      previewGroup: `${useCase}Address`,
      hideValueInPreview: true,
      required: false,
      validator: [],
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 6]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 6]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 6]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 6]
            }
      }
    },
    {
      name: `cityUrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `cityUrbanOption${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'city']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 0, 'city']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 0, 'city']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 0, 'city']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 0, 'city']
            }
      }
    },
    {
      name: `addressLine3UrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `addressLine3UrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 3, 'addressLine3']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 3]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 3]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 3]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 3]
            }
      }
    },
    {
      name: `addressLine2UrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `addressLine2UrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 2, 'addressLine2']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 2]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 2]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 2]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 2]
            }
      }
    },
    {
      name: `numberUrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `numberUrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 1, 'number']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 1]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 1]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 1]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 1]
            }
      }
    },
    {
      name: `postcode${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `postcode${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'postalCode']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 0, 'postalCode']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 0, 'postalCode']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 0, 'postalCode']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 0, 'postalCode']
            }
      }
    },
    {
      name: `addressLine5${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "RURAL"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]),
      mapping: {
        template: {
          fieldName: `addressLine5${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 5, 'addressLine5']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 5]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 5]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 5]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 5]
            }
      }
    },
    {
      name: `internationalState${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'State',
        description: 'Title for the international state select',
        id: 'form.field.label.internationalState'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalState${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'state']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 0, 'state']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 0, 'state']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 0, 'state']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 0, 'state']
            }
      }
    },
    {
      name: `internationalDistrict${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'District',
        description: 'Title for the international district select',
        id: 'form.field.label.internationalDistrict'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalDistrict${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'district']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 0, 'district']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 0, 'district']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 0, 'district']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 0, 'district']
            }
      }
    },
    {
      name: `internationalCity${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'City / Town',
        description: 'Title for the international city select',
        id: 'form.field.label.internationalCity'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalCity${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'city']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 0, 'city']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 0, 'city']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 0, 'city']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 0, 'city']
            }
      }
    },
    {
      name: `internationalAddressLine1${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 1',
        description: 'Title for the international address line 1 select',
        id: 'form.field.label.internationalAddressLine1'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine1${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 7, 'addressLine1']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 7]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 7]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 7]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 7]
            }
      }
    },
    {
      name: `internationalAddressLine2${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 2',
        description: 'Title for the international address line 2 select',
        id: 'form.field.label.internationalAddressLine2'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine2${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 8, 'addressLine2']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 8]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 8]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 8]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 8]
            }
      }
    },
    {
      name: `internationalAddressLine3${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 3',
        description: 'Title for the international address line 3 select',
        id: 'form.field.label.internationalAddressLine3'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine3${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 9, 'addressLine3']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 9]
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 9]
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 9]
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 9]
            }
      }
    },
    {
      name: `internationalPostcode${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      customisable: false,
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalPostcode${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'postalCode']
        },
        mutation: informant
          ? {
              operation: 'fieldValueNestingTransformer',
              parameters: [
                'individual',
                {
                  operation: 'fieldToAddressTransformer',
                  parameters: [addressCase, 0, 'postalCode']
                },
                'address'
              ]
            }
          : {
              operation: 'fieldToAddressTransformer',
              parameters: [addressCase, 0, 'postalCode']
            },
        query: informant
          ? {
              operation: 'nestedValueToFieldTransformer',
              parameters: [
                'individual',
                {
                  operation: 'addressToFieldTransformer',
                  parameters: [addressCase, 0, 'postalCode']
                }
              ]
            }
          : {
              operation: 'addressToFieldTransformer',
              parameters: [addressCase, 0, 'postalCode']
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
      validator: [],
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
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['country', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: []
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: []
        }
      }
    },
    ...getPlaceOfEventAdminLevelSelects(configCase),
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
      validator: [],
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['city', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [3, `${configCase}AddressLine3`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [2, `${configCase}AddressLine2`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [1, `${configCase}Number`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['postalCode', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "RURAL"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [5, `${configCase}AddressLine5`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['state', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['district', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [7, `${configCase}AddressLine1`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [8, `${configCase}AddressLine2`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [9, `${configCase}AddressLine3`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
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
