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

export const advancedSearchBirthSectionRegistrationDetails: IFormSectionGroup =
  {
    id: 'BirthRegistrationDetails',
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
            value: 'REJECTED',
            label: advancedSearchForm.recordStatusRequireUpdate
          },
          {
            value: 'REGISTERED',
            label: advancedSearchForm.recordStatusRegistered
          },
          {
            value: 'CERTIFIED',
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

export const advancedSearchBirthSectionChildDetails: IFormSectionGroup = {
  id: 'BirthChildDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'childDoB',
      customisable: false,
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.childDateOfBirth,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'childFirstNames',
      previewGroup: 'childNameInEnglish',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.childFirstNames,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'childLastName',
      previewGroup: 'childNameInEnglish',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.childFamilyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'childGender',
      customisable: false,
      type: 'SELECT_WITH_OPTIONS',
      label: formMessageDescriptors.childSex,
      required: false,
      initialValue: '',
      validate: [],
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      options: [
        {
          value: 'male',
          label: formMessageDescriptors.childSexMale
        },
        {
          value: 'female',
          label: formMessageDescriptors.childSexFemale
        },
        {
          value: 'unknown',
          label: formMessageDescriptors.childSexUnknown
        }
      ]
    }
  ]
}

export const advancedSearchBirthSectionEventDetails: IFormSectionGroup = {
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
      searchableType: 'HEALTH_FACILITY',
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
      required: false,
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
      required: false,
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

export const advancedSearchBirthSectionMotherDetails: IFormSectionGroup = {
  id: 'BirthMotherDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'motherDoB',
      customisable: false,
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.motherDateOfBirth,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherFirstNames',
      previewGroup: 'motherFirstNamesEng',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.motherFirstNamesEng,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'motherFamilyName',
      previewGroup: 'motherNameInEnglish',
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

export const advancedSearchBirthSectionFatherDetails: IFormSectionGroup = {
  id: 'BirthFatherDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'fatherDoB',
      customisable: false,
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.fatherDateOfBirth,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'fatherFirstNames',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.fatherFirstNamesEng,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    },
    {
      name: 'fatherFamilyName',
      customisable: false,
      type: 'TEXT',
      label: formMessageDescriptors.fatherFamilyNameEng,
      maxLength: 32,
      required: false,
      initialValue: '',
      validate: []
    }
  ]
}

export const advancedSearchBirthSectionInformantDetails: IFormSectionGroup = {
  id: 'BirthInformantDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'informantDoB',
      customisable: false,
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.fatherDateOfBirth,
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

export const advancedSearchBirthSections = {
  birthSearchRegistrationSection: advancedSearchBirthSectionRegistrationDetails,
  birthSearchChildSection: advancedSearchBirthSectionChildDetails,
  birthSearchEventSection: advancedSearchBirthSectionEventDetails,
  birthSearchMotherSection: advancedSearchBirthSectionMotherDetails,
  birthSearchFatherSection: advancedSearchBirthSectionFatherDetails,
  birthSearchInformantSection: advancedSearchBirthSectionInformantDetails
}
