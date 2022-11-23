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
      label: formMessageDescriptors.deceasedDateOfBirth,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'deceasedFirstNames',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.deceasedGivenNames,
      maxLength: 32,
      required: false,
      initialValue: 'fasfasf',
      validate: []
    },
    {
      name: 'deceasedFamilyName',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.deceasedFamilyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'deceasedGender',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      label: formMessageDescriptors.deceasedSex,
      required: false,
      initialValue: '',
      validate: [],
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      options: [
        {
          value: 'male',
          label: formMessageDescriptors.deceasedSexMale
        },
        {
          value: 'female',
          label: formMessageDescriptors.deceasedSexFemale
        },
        {
          value: 'unknown',
          label: formMessageDescriptors.deceasedSexUnknown
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

export const advancedSearchDeathSectionInformantDetails: IFormSectionGroup = {
  id: 'DeathInformantDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'informantDoB',
      customisable: false,
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.fatherDateOfDeath,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'informantFirstNames',

      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.motherFirstNamesEng,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'informantFamilyName',

      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.motherFamilyNameEng,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    }
  ]
}

export const advancedSearchDeathSections = {
  registrationSection: advancedSearchDeathSectionRegistrationDetails,
  deceasedSection: advancedSearchDeathSectiondeceasedDetails,
  informantSection: advancedSearchDeathSectionInformantDetails
}
