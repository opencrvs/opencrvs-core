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
import { countries } from '@client/utils/countries'
import { IFormSectionGroup } from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { messages as advancedSearchForm } from '@client/i18n/messages/views/advancedSearchForm'
import { isValidDate } from '@client/search/advancedSearch/validators'
import { TIME_PERIOD } from './utils'
import { UUID } from '@opencrvs/commons/client'

const createBirthSearchRegistrationSection = (
  hasBirthSearchJurisdictionScope?: boolean,
  userOfficeId?: UUID
): IFormSectionGroup => ({
  id: 'BirthRegistrationDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'placeOfRegistration',
      type: 'LOCATION_SEARCH_INPUT',
      label: advancedSearchForm.placeOfRegistrationlabel,
      helperText: advancedSearchForm.placeOfRegistrationHelperText,
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      required: false,
      initialValue: '',
      searchableResource: ['locations', 'offices'],
      searchableType: ['CRVS_OFFICE', 'ADMIN_STRUCTURE'],
      ...(hasBirthSearchJurisdictionScope && {
        userOfficeId
      }),
      validator: []
    },
    {
      name: 'dateOfRegistration',
      type: 'DATE_RANGE_PICKER',
      label: advancedSearchForm.dateOfRegistration,
      required: false,
      initialValue: '',
      validator: [isValidDate]
    },
    {
      name: 'registrationStatuses',
      type: 'SELECT_WITH_OPTIONS',
      label: advancedSearchForm.statusOfRecordLabel,
      required: false,
      initialValue: '',
      validator: [],
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
        },
        {
          value: 'CORRECTION_REQUESTED',
          label: advancedSearchForm.recordStatusCorrectionRequested
        },
        {
          value: 'VALIDATED',
          label: advancedSearchForm.recordStatusValidated
        }
      ]
    },
    {
      name: 'registrationByPeriod',
      type: 'SELECT_WITH_OPTIONS',
      label: advancedSearchForm.timePeriodLabel,
      required: false,
      initialValue: '',
      validator: [],
      helperText: advancedSearchForm.timePeriodHelperText,
      placeholder: formMessageDescriptors.formSelectPlaceholder,
      options: [
        {
          value: TIME_PERIOD.LAST_7_DAYS,
          label: advancedSearchForm.timePeriodLast7Days
        },
        {
          value: TIME_PERIOD.LAST_30_DAYS,
          label: advancedSearchForm.timePeriodLast30Days
        },
        {
          value: TIME_PERIOD.LAST_90_DAYS,
          label: advancedSearchForm.timePeriodLast90Days
        },
        {
          value: TIME_PERIOD.LAST_YEAR,
          label: advancedSearchForm.timePeriodLastYear
        }
      ]
    }
  ]
})

const advancedSearchBirthSectionChildDetails: IFormSectionGroup = {
  id: 'BirthChildDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'childDoB',
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.dateOfBirth,
      required: false,
      initialValue: '',
      validator: [isValidDate]
    },
    {
      name: 'childFirstNames',
      previewGroup: 'childNameInEnglish',
      type: 'TEXT',
      label: formMessageDescriptors.firstNames,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    },
    {
      name: 'childLastName',
      previewGroup: 'childNameInEnglish',
      type: 'TEXT',
      label: formMessageDescriptors.familyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    },
    {
      name: 'childGender',
      type: 'SELECT_WITH_OPTIONS',
      label: formMessageDescriptors.sex,
      required: false,
      initialValue: '',
      validator: [],
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
    }
  ]
}

const advancedSearchBirthSectionEventDetails: IFormSectionGroup = {
  id: 'BirthEventDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'eventLocationType',
      type: 'SELECT_WITH_OPTIONS',
      previewGroup: 'placeOfBirth',
      ignoreFieldLabelOnErrorMessage: true,
      label: formMessageDescriptors.placeOfBirth,
      required: false,
      initialValue: '',
      validator: [],
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
      type: 'LOCATION_SEARCH_INPUT',
      label: formMessageDescriptors.healthInstitution,
      required: false,
      initialValue: '',
      searchableResource: ['facilities'],
      searchableType: ['HEALTH_FACILITY'],
      dynamicOptions: {
        resource: 'facilities'
      },
      validator: [],
      conditionals: [
        {
          action: 'hide',
          expression: '(values.eventLocationType!="HEALTH_FACILITY")'
        }
      ]
    },
    {
      name: 'eventCountry',
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      required: false,
      validator: [],
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
      type: 'SELECT_WITH_DYNAMIC_OPTIONS',
      label: {
        defaultMessage: 'Province',
        description: 'Title for the event location1 select',
        id: 'form.field.label.state'
      },
      required: false,
      initialValue: '',
      validator: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      dynamicOptions: {
        resource: 'locations',
        dependency: 'eventCountry'
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
      type: 'SELECT_WITH_DYNAMIC_OPTIONS',
      label: {
        defaultMessage: 'District',
        description: 'Title for the event location 2 select',
        id: 'form.field.label.district'
      },
      required: false,
      initialValue: '',
      validator: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      dynamicOptions: {
        resource: 'locations',
        dependency: 'eventLocationLevel1'
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

const advancedSearchBirthSectionMotherDetails: IFormSectionGroup = {
  id: 'BirthMotherDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'motherDoB',
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.dateOfBirth,
      required: false,
      initialValue: '',
      validator: [isValidDate]
    },
    {
      name: 'motherFirstNames',
      previewGroup: 'motherFirstNamesEng',
      type: 'TEXT',
      label: formMessageDescriptors.firstNames,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    },
    {
      name: 'motherFamilyName',
      previewGroup: 'motherNameInEnglish',
      type: 'TEXT',
      label: formMessageDescriptors.familyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    }
  ]
}

const advancedSearchBirthSectionFatherDetails: IFormSectionGroup = {
  id: 'BirthFatherDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'fatherDoB',
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.dateOfBirth,
      required: false,
      initialValue: '',
      validator: [isValidDate]
    },
    {
      name: 'fatherFirstNames',
      type: 'TEXT',
      label: formMessageDescriptors.firstNames,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    },
    {
      name: 'fatherFamilyName',
      type: 'TEXT',
      label: formMessageDescriptors.familyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    }
  ]
}

const advancedSearchBirthSectionInformantDetails: IFormSectionGroup = {
  id: 'BirthInformantDetails',
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'informantDoB',
      type: 'DATE_RANGE_PICKER',
      label: formMessageDescriptors.dateOfBirth,
      required: false,
      initialValue: '',
      validator: [isValidDate]
    },
    {
      name: 'informantFirstNames',
      type: 'TEXT',
      label: formMessageDescriptors.firstNames,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    },
    {
      name: 'informantFamilyName',
      type: 'TEXT',
      label: formMessageDescriptors.familyName,
      maxLength: 32,
      required: false,
      initialValue: '',
      validator: []
    }
  ]
}

export const createAdvancedSearchBirthSections = (
  hasBirthSearchJurisdictionScope?: boolean,
  userOfficeId?: UUID
) => ({
  birthSearchRegistrationSection: createBirthSearchRegistrationSection(
    hasBirthSearchJurisdictionScope,
    userOfficeId
  ),
  birthSearchChildSection: advancedSearchBirthSectionChildDetails,
  birthSearchEventSection: advancedSearchBirthSectionEventDetails,
  birthSearchMotherSection: advancedSearchBirthSectionMotherDetails,
  birthSearchFatherSection: advancedSearchBirthSectionFatherDetails,
  birthSearchInformantSection: advancedSearchBirthSectionInformantDetails
})
