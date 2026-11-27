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
  event,
  field,
  FieldType,
  user,
  SelectOption
} from '@opencrvs/toolkit/events'
import {
  PlaceOfBirth,
  placeOfBirthMessageDescriptors
} from './forms/pages/child'

const placeOfBirthOptions = [
  {
    value: PlaceOfBirth.HEALTH_FACILITY,
    label: placeOfBirthMessageDescriptors.HEALTH_FACILITY
  },
  {
    value: PlaceOfBirth.PRIVATE_HOME,
    label: placeOfBirthMessageDescriptors.PRIVATE_HOME
  },
  {
    value: PlaceOfBirth.OTHER,
    label: placeOfBirthMessageDescriptors.OTHER
  }
] satisfies SelectOption[]

const childPrefix = {
  id: 'birth.search.criteria.label.prefix.child',
  defaultMessage: "Child's",
  description: 'Child prefix'
}
const motherPrefix = {
  id: 'birth.search.criteria.label.prefix.mother',
  defaultMessage: "Mother's",
  description: 'Mother prefix'
}
const fatherPrefix = {
  id: 'birth.search.criteria.label.prefix.father',
  defaultMessage: "Father's",
  description: 'Father prefix'
}
const informantPrefix = {
  id: 'birth.search.criteria.label.prefix.informant',
  defaultMessage: "Informant's",
  description: 'Informant prefix'
}
export const advancedSearchBirth = [
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
      defaultMessage: 'Child details',
      description: 'The title of Child details accordion',
      id: 'advancedSearch.form.childDetails'
    },
    fields: [
      field('child.dob', {
        searchCriteriaLabelPrefix: childPrefix
      }).range(),
      field('child.name', {
        validations: [],
        conditionals: []
      }).fuzzy(),
      field('child.nid', {
        searchCriteriaLabelPrefix: childPrefix,
        conditionals: []
      }).exact(),
      field('child.gender', {
        searchCriteriaLabelPrefix: childPrefix
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
      field('child.placeOfBirth', {
        options: placeOfBirthOptions
      }).exact(),
      field('child.birthLocation', {
        searchCriteriaLabelPrefix: childPrefix,
        allowedLocations: user.jurisdiction(
          user.scope('record.search').attribute('placeOfEvent')
        )
      }).exact(),
      field('child.birthLocation.privateHome').exact(),
      field('child.birthLocation.other').exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Mother details',
      description: 'The title of Mother details accordion',
      id: 'advancedSearch.form.motherDetails'
    },
    fields: [
      field('mother.dob', {
        searchCriteriaLabelPrefix: motherPrefix
      }).range(),
      field('mother.name', {
        validations: [],
        conditionals: []
      }).fuzzy(),
      field('mother.maritalStatus', {
        searchCriteriaLabelPrefix: motherPrefix
      }).exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Father details',
      description: 'The title of Father details accordion',
      id: 'advancedSearch.form.fatherDetails'
    },
    fields: [
      field('father.dob', {
        searchCriteriaLabelPrefix: fatherPrefix
      }).range(),
      field('father.name', {
        validations: [],
        conditionals: []
      }).fuzzy(),
      // The initial version keeps the father's name in 2 TEXT fields. Each input searches one
      // of them and the NAME field of v2, so it finds the records of both versions.
      {
        fieldId: 'father.firstname',
        fieldType: 'field',
        type: FieldType.TEXT,
        config: {
          type: 'fuzzy',
          searchFields: ['father.firstname', 'father.name']
        },
        label: {
          defaultMessage: "Father's first name",
          description:
            'Label of the search field for the first name of the father',
          id: 'advancedSearch.form.fatherFirstname'
        }
      },
      {
        fieldId: 'father.surname',
        fieldType: 'field',
        type: FieldType.TEXT,
        config: {
          type: 'fuzzy',
          searchFields: ['father.surname', 'father.name']
        },
        label: {
          defaultMessage: "Father's surname",
          description:
            'Label of the search field for the surname of the father',
          id: 'advancedSearch.form.fatherSurname'
        }
      }
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
