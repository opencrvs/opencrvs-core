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

import { sentenceCase } from '@client/utils/data-formatting'
import {
  AddressCases,
  EventLocationAddressCases
} from '@client/forms/configuration/administrative/addresses'
import { SerializedFormField } from '@client/forms/index'

export function getDependency(location: string, useCase: string) {
  switch (location) {
    case 'state':
      return useCase === 'placeOfBirth' || useCase === 'placeOfDeath'
        ? 'country'
        : `country${sentenceCase(useCase)}`
    case 'district':
      return useCase === 'placeOfBirth' || useCase === 'placeOfDeath'
        ? 'state'
        : `state${sentenceCase(useCase)}`
    case 'locationLevel3':
      return useCase === 'placeOfBirth' || useCase === 'placeOfDeath'
        ? 'district'
        : `district${sentenceCase(useCase)}`
    case 'locationLevel4':
      return useCase === 'placeOfBirth' || useCase === 'placeOfDeath'
        ? 'locationLevel3'
        : `locationLevel3${sentenceCase(useCase)}`
    case 'locationLevel5':
      return useCase === 'placeOfBirth' || useCase === 'placeOfDeath'
        ? 'locationLevel4'
        : `locationLevel4${sentenceCase(useCase)}`
  }
}

export function getConditionals(location: string, useCase: string) {
  switch (location) {
    case 'state':
      return [
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
      ]
    case 'district':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: '!values.statePrimary'
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel3':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
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
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel4':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
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
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel5':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
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
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel4'
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
  }
}

export function getLocationSelect(
  location: string,
  useCase: string,
  locationIndex: number,
  informant: boolean
): SerializedFormField {
  return {
    name: `${location}${sentenceCase(useCase)}`,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: sentenceCase(location),
      description: `Title for the ${location} select`,
      id: `form.field.label.${location}`
    },
    customisable: false,
    previewGroup: `${useCase}Address`,
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
      dependency: getDependency(location, useCase),
      initialValue: 'agentDefault'
    },
    conditionals: getConditionals(location, useCase),
    mapping: {
      mutation: informant
        ? {
            operation: 'fieldValueNestingTransformer',
            parameters: [
              'individual',
              {
                operation: 'fieldToAddressTransformer',
                parameters: [
                  useCase.toUpperCase() === 'PRIMARY'
                    ? AddressCases.PRIMARY_ADDRESS
                    : AddressCases.SECONDARY_ADDRESS,
                  locationIndex,
                  location
                ]
              },
              'address'
            ]
          }
        : {
            operation: 'fieldToAddressTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex,
              location
            ]
          },
      query: informant
        ? {
            operation: 'nestedValueToFieldTransformer',
            parameters: [
              'individual',
              {
                operation: 'addressToFieldTransformer',
                parameters: [
                  useCase.toUpperCase() === 'PRIMARY'
                    ? AddressCases.PRIMARY_ADDRESS
                    : AddressCases.SECONDARY_ADDRESS,
                  locationIndex,
                  location
                ]
              }
            ]
          }
        : {
            operation: 'addressToFieldTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex,
              location
            ]
          }
    }
  }
}

export function getPlaceOfEventConditionals(
  location: string,
  configCase: EventLocationAddressCases
) {
  switch (location) {
    case 'state':
      return [
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
      ]
    case 'district':
      return [
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
      ]
    case 'locationLevel3':
      return [
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
      ]
    case 'locationLevel4':
      return [
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
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel5':
      return [
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
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel4'
        },
        {
          action: 'hide',
          expression: `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
  }
}

export function getPlaceOfEventLocationSelect(
  location: string,
  configCase: EventLocationAddressCases,
  locationIndex: number
): SerializedFormField {
  return {
    name: location,
    customisable: false,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: sentenceCase(location),
      description: `Title for the ${location} select`,
      id: `form.field.label.${location}`
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
      dependency: getDependency(location, configCase),
      initialValue: 'agentDefault'
    },
    conditionals: getPlaceOfEventConditionals(location, configCase),
    mapping: {
      template: {
        fieldName: configCase,
        operation: 'eventLocationAddressOfflineTransformer',
        parameters: [location, configCase]
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
          locationIndex,
          location,
          {
            fieldsToIgnoreForLocalAddress: [
              'internationalDistrict',
              'internationalState'
            ],
            fieldsToIgnoreForInternationalAddress: [
              'locationLevel3',
              'locationLevel4',
              'locationLevel5',
              'district',
              'state'
            ]
          }
        ]
      }
    }
  }
}
