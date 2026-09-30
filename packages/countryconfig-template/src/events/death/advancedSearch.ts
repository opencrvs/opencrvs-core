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
  AdvancedSearchConfig,
  ConditionalType,
  event,
  field,
  TranslationConfig,
  user
} from '@opencrvs/toolkit/events'
import { createSelectOptions } from '../utils'

const PlaceOfDeath = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  DECEASED_USUAL_RESIDENCE: 'DECEASED_USUAL_RESIDENCE',
  OTHER: 'OTHER'
} as const

const placeOfDeathMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  DECEASED_USUAL_RESIDENCE: {
    defaultMessage: 'Residential address',
    description: 'Select item for Private Home',
    id: 'form.field.label.privateHome'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfDeath, TranslationConfig>

const placeOfDeathOptions = createSelectOptions(
  PlaceOfDeath,
  placeOfDeathMessageDescriptors
)

const deceasedPrefix = {
  id: 'death.search.criteria.label.prefix.deceased',
  defaultMessage: "Deceased's",
  description: 'Deceased prefix'
}
const informantPrefix = {
  id: 'death.search.criteria.label.prefix.informant',
  defaultMessage: "Informant's",
  description: 'Informant prefix'
}
export const advancedSearchDeath = [
  {
    title: {
      defaultMessage: 'Registration details',
      description: 'The title of Registration details accordion',
      id: 'advancedSearch.form.registrationDetails'
    },
    fields: [
      event('legalStatuses.REGISTERED.createdAtLocation').within(),
      event('legalStatuses.REGISTERED.acceptedAt').range(),
      event('status').exact(),
      event('updatedAt').range()
    ]
  },
  {
    title: {
      defaultMessage: 'Deceased details',
      description: 'The title of Deceased details accordion',
      id: 'advancedSearch.form.deceasedDetails'
    },
    fields: [
      field('deceased.dob', {
        searchCriteriaLabelPrefix: deceasedPrefix
      }).range(),
      field('deceased.name', {
        validations: [],
        conditionals: []
      }).fuzzy(),
      field('deceased.gender', {
        searchCriteriaLabelPrefix: deceasedPrefix
      }).exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'The title of Event details accordion',
      id: 'advancedSearch.form.eventDetails'
    },
    fields: [
      field('eventDetails.placeOfDeath', {
        options: placeOfDeathOptions
      }).exact(),
      field('eventDetails.deathLocation', {
        searchCriteriaLabelPrefix: deceasedPrefix,
        allowedLocations: user.jurisdiction(
          user.scope('record.search').attribute('placeOfEvent')
        )
      }).exact(),
      field('deceased.address', {
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDeath').isEqualTo(
              PlaceOfDeath.DECEASED_USUAL_RESIDENCE
            )
          }
        ]
      }).exact(),
      field('eventDetails.deathLocationOther', {}).exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Informant details',
      description: 'The title of Informant details accordion',
      id: 'advancedSearch.form.informantDetails'
    },
    fields: [
      field('informant.dob', {
        conditionals: [],
        searchCriteriaLabelPrefix: informantPrefix
      }).range(),
      field('informant.name', {
        conditionals: [],
        validations: []
      }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
