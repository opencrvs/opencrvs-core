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
import { countries } from '@client/forms/countries'
import { IFormSectionGroup } from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { messages as advancedSearchForm } from '@client/i18n/messages/views/advancedSearchForm'

export const advancedSearchDeathSectionRegistrationDetails: IFormSectionGroup =
  {
    id: 'DeathRegistrationDetails',
    title: advancedSearchForm.registrationDetails,
    fields: [
      {
        name: 'placeOfRegistration',
        customisable: false,
        type: 'LOCATION_SEARCH_INPUT',
        label: advancedSearchForm.placeOfRegistrationlabel,
        helperText: advancedSearchForm.placeOfRegistrationHelperText,
        placeholder: formMessageDescriptors.formSelectPlaceholder,
        required: false,
        initialValue: '',
        searchableResource: ['locations', 'offices'],
        searchableType: ['CRVS_OFFICE', 'ADMIN_STRUCTURE'],
        validate: []
      },
      {
        name: 'dateOfRegistration',
        customisable: false,
        type: 'DATE_RANGE_PICKER',
        label: advancedSearchForm.dateOfRegistration,
        required: false,
        initialValue: '',
        validate: []
      },
      {
        name: 'registrationStatuses',
        customisable: false,
        type: 'SELECT_WITH_OPTIONS',
        label: advancedSearchForm.statusOfRecordLabel,
        required: false,
        initialValue: '',
        validate: [],
        placeholder: formMessageDescriptors.formSelectPlaceholder,
        options: [
          {
            value: 'ALL',
            label: advancedSearchForm.recordStatusAny
          },
          {
            value: 'IN_PROGRESS',
            label: advancedSearchForm.recordStatusInprogress
          },
          {
            value: 'IN_REVIEW',
            label: advancedSearchForm.recordStatusInReview
          },
          {
            value: ' REJECTED',
            label: advancedSearchForm.recordStatusRequireUpdate
          },
          {
            value: 'REGISTERED',
            label: advancedSearchForm.recordStatusRegistered
          },
          {
            value: ' CERTIFIED',
            label: advancedSearchForm.recordStatusCertified
          },
          {
            value: 'ARCHIVED',
            label: advancedSearchForm.recordStatusAchived
          }
        ]
      }
    ]
  }

export const advancedSearchDeathSectiondeceasedDetails: IFormSectionGroup = {
  id: 'DeathdeceasedDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'deceasedDoB',
      customisable: false,
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.dateOfBirth,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'deceasedFirstNames',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.firstName,
      maxLength: 32,
      required: false,
      initialValue: 'fasfasf',
      validate: []
    },
    {
      name: 'deceasedFamilyName',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.familyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'deceasedGender',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      label: formMessageDescriptors.sex,
      required: false,
      initialValue: '',
      validate: [],
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      options: [
        {
          value: 'male',
          label: formMessageDescriptors.sexMale
        },
        {
          value: 'female',
          label: formMessageDescriptors.sexFemale
        },
        {
          value: 'unknown',
          label: formMessageDescriptors.sexUnknown
        }
      ]
    },
    {
      name: 'placeOfDeath',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      ignoreFieldLabelOnErrorMessage: true,
      label: formMessageDescriptors.placeOfDeath,
      required: false,
      initialValue: '',
      validate: [],
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      options: [
        {
          value: 'HEALTH_FACILITY',
          label: formMessageDescriptors.healthInstitution
        },
        {
          value: 'PRIVATE_HOME',
          label: formMessageDescriptors.privateHome
        },
        {
          value: 'OTHER',
          label: formMessageDescriptors.otherInstitution
        }
      ]
    },
    {
      name: 'eventCountry',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      required: false,
      initialValue: window.config.COUNTRY.toUpperCase(),
      validate: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: countries
    }
  ]
}

export const advancedSearchDeathSectionEventDetails: IFormSectionGroup = {
  id: 'BirthEventDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'eventLocationType',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      previewGroup: 'placeOfBirth',
      ignoreFieldLabelOnErrorMessage: true,
      label: formMessageDescriptors.placeOfBirth,
      required: false,
      initialValue: '',
      validate: [],
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      options: [
        {
          value: 'HEALTH_FACILITY',
          label: formMessageDescriptors.healthInstitution
        },
        {
          value: 'PRIVATE_HOME',
          label: formMessageDescriptors.privateHome
        }
      ]
    },
    {
      name: 'eventLocationId',
      customisable: false,
      type: 'LOCATION_SEARCH_INPUT',
      label: formMessageDescriptors.healthInstitution,
      required: false,
      initialValue: '',
      searchableResource: ['facilities'],
      searchableType: ['HEALTH_FACILITY'],
      dynamicOptions: {
        resource: 'facilities'
      },
      validate: [],
      conditionals: [
        {
          action: 'hide',
          expression: '(values.eventLocationType!="HEALTH_FACILITY")'
        }
      ]
    },
    {
      name: 'eventCountry',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      required: false,
      validate: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: countries,
      conditionals: [
        {
          action: 'hide',
          expression: '(values.eventLocationType!=="PRIVATE_HOME")'
        }
      ]
    },
    {
      name: 'eventLocationLevel1',
      customisable: false,
      type: 'SELECT_WITH_DYNAMIC_OPTIONS',
      label: {
        defaultMessage: 'Province',
        description: 'Title for the event location1 select',
        id: 'form.field.label.state'
      },
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
        dependency: 'eventCountry',
        initialValue: 'agentDefault'
      },
      conditionals: [
        {
          action: 'hide',
          expression: '!values.eventCountry'
        },
        {
          action: 'hide',
          expression: `(values.eventLocationType!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.eventCountry)'
        }
      ]
    },
    {
      name: 'eventLocationLevel2',
      customisable: false,
      type: 'SELECT_WITH_DYNAMIC_OPTIONS',
      label: {
        defaultMessage: 'District',
        description: 'Title for the event location 2 select',
        id: 'form.field.label.district'
      },
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
        dependency: 'eventLocationLevel1',
        initialValue: 'agentDefault'
      },
      conditionals: [
        {
          action: 'hide',
          expression: '!values.eventCountry'
        },
        {
          action: 'hide',
          expression: '!values.eventLocationLevel1'
        },
        {
          action: 'hide',
          expression: `(values.eventLocationType!="PRIVATE_HOME")`
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.eventCountry)'
        }
      ]
    }
  ]
}

export const advancedSearchDeathSectionInformantDetails: IFormSectionGroup = {
  id: 'DeathInformantDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'informantDoB',
      customisable: false,
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.dateOfBirth,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'informantFirstNames',

      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.firstName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'informantFamilyName',

      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.familyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    }
  ]
}

export const advancedSearchDeathSections = {
  deathSearchRegistrationSection: advancedSearchDeathSectionRegistrationDetails,
  deathSearchDeceasedSection: advancedSearchDeathSectiondeceasedDetails,
  deathSearchEventSection: advancedSearchDeathSectionEventDetails,
  deathSearchInformantSection: advancedSearchDeathSectionInformantDetails
}
