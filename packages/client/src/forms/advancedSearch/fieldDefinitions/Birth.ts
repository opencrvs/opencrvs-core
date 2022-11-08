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
import { AdvancedSearchSection, IFormSectionGroup } from '@client/forms/index'
import { formMessageDescriptors } from '@client/i18n/messages'
import { messages as advancedSearchForm } from '@client/i18n/messages/views/advancedSearchForm'

export const advancedSearchBirthSectionFormType: IFormSectionGroup = {
  id: AdvancedSearchSection.Birth,
  title: advancedSearchForm.registrationDetails,
  fields: [
    {
      name: 'registrationDetails',
      type: 'ACCORDION_WITH_NESTED_FIELDS',
      label: advancedSearchForm.registrationDetails,
      showLabel: formMessageDescriptors.showLabel,
      hideLabel: formMessageDescriptors.hideLabel,
      hideHeader: true,
      required: false,
      hideInPreview: true,
      initialValue: 'no',
      validate: [],
      options: [
        {
          value: 'yes',
          label: advancedSearchForm.registrationDetails
        }
      ],
      placeholder: advancedSearchForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: 'declarationLocationId',
            customisable: false,
            type: 'LOCATION_SEARCH_INPUT',
            label: advancedSearchForm.placeOfRegistrationlabel,
            helperText: advancedSearchForm.placeOfRegistrationHelperText,
            placeholder: formMessageDescriptors.formSelectPlaceholder,
            required: false,
            initialValue: '',
            searchableResource: 'offices',
            searchableType: 'CRVS_OFFICE',
            dynamicOptions: {
              resource: 'CRVS_OFFICES & ADMIN_STRUCTURE'
            },

            validate: [],

            mapping: {}
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
          },
          {
            name: ' eventLocationLevel1',
            customisable: false,
            type: 'LOCATION_SEARCH_INPUT',
            label: formMessageDescriptors.placeOfBirth,
            previewGroup: 'placeOfBirth',
            required: false,
            initialValue: '',
            searchableResource: 'facilities',
            searchableType: 'HEALTH_FACILITY',
            dynamicOptions: {
              resource: 'facilities'
            },
            validate: []
          },
          {
            name: '  eventLocationLevel2',
            customisable: false,
            type: 'TEXT',
            label: formMessageDescriptors.internationalDistrict,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: '  eventLocationLevel1',
            customisable: false,
            type: 'TEXT',
            label: formMessageDescriptors.internationalState,
            required: false,
            initialValue: '',
            validate: []
          }
        ]
      }
    },
    {
      name: 'childDetails',
      type: 'ACCORDION_WITH_NESTED_FIELDS',
      label: formMessageDescriptors.childTitle,
      showLabel: formMessageDescriptors.showLabel,
      hideLabel: formMessageDescriptors.hideLabel,
      hideHeader: true,
      required: false,
      hideInPreview: true,
      initialValue: 'no',
      validate: [],
      options: [
        {
          value: 'yes',
          label: formMessageDescriptors.childTitle
        }
      ],
      placeholder: advancedSearchForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: 'childDoB',
            customisable: false,
            type: 'DATE',
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
    },
    {
      name: 'motherDetails',
      type: 'ACCORDION_WITH_NESTED_FIELDS',
      label: formMessageDescriptors.motherTitle,
      showLabel: formMessageDescriptors.showLabel,
      hideLabel: formMessageDescriptors.hideLabel,
      hideHeader: true,
      required: false,
      hideInPreview: true,
      initialValue: 'no',
      validate: [],
      options: [
        {
          value: 'yes',
          label: formMessageDescriptors.motherTitle
        }
      ],
      placeholder: advancedSearchForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: ' motherDoB',
            customisable: false,
            type: 'DATE',
            label: formMessageDescriptors.motherDateOfBirth,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: ' motherFirstNames',
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
            name: ' motherFamilyName',
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
    },
    {
      name: 'fatherDetails',
      type: 'ACCORDION_WITH_NESTED_FIELDS',
      label: formMessageDescriptors.fatherTitle,
      showLabel: formMessageDescriptors.showLabel,
      hideLabel: formMessageDescriptors.hideLabel,
      hideHeader: true,
      required: false,
      hideInPreview: true,
      initialValue: 'no',
      validate: [],
      options: [
        {
          value: 'yes',
          label: formMessageDescriptors.fatherTitle
        }
      ],
      placeholder: advancedSearchForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: '  fatherDoB',
            customisable: false,
            type: 'DATE',
            label: formMessageDescriptors.fatherDateOfBirth,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'fatherFirstNames',
            previewGroup: 'fatherNameInEnglish',
            customisable: false,
            type: 'TEXT',
            label: formMessageDescriptors.motherFirstNamesEng,
            maxLength: 32,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'fatherFamilyName',
            previewGroup: 'fatherNameInEnglish',
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
    },
    {
      name: 'informantDetails',
      type: 'ACCORDION_WITH_NESTED_FIELDS',
      label: advancedSearchForm.informantDetails,
      showLabel: formMessageDescriptors.showLabel,
      hideLabel: formMessageDescriptors.hideLabel,
      hideHeader: true,
      required: false,
      hideInPreview: true,
      initialValue: 'no',
      validate: [],
      options: [
        {
          value: 'yes',
          label: advancedSearchForm.informantDetails
        }
      ],
      placeholder: advancedSearchForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: ' informantDoB',
            customisable: false,
            type: 'DATE',
            label: formMessageDescriptors.motherDateOfBirth,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: ' informantFirstNames',
            previewGroup: 'informantNameInEnglish',
            customisable: false,
            type: 'TEXT',
            label: formMessageDescriptors.childFirstNames,
            maxLength: 32,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'informantFamilyName',
            previewGroup: 'informantNameInEnglish',
            customisable: false,
            type: 'TEXT',
            label: formMessageDescriptors.childFamilyName,
            maxLength: 32,
            required: false,
            initialValue: '',
            validate: []
          }
        ]
      }
    }
  ]
}
