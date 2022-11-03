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
import { messages as advancedSearchBirthForm } from '@client/i18n/messages/views/advancedSearchBirthForm'

export const advancedSearchBirthSectionFormType: IFormSectionGroup = {
  id: AdvancedSearchSection.Birth,
  title: advancedSearchBirthForm.registrationDetails,
  fields: [
    {
      name: 'registrationDetails',
      type: 'ACCORDION_WITH_NESTED_FIELDS',
      label: advancedSearchBirthForm.registrationDetails,
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
          label: advancedSearchBirthForm.registrationDetails
        }
      ],
      placeholder: advancedSearchBirthForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: 'placeOfRegistration',
            customisable: false,
            type: 'LOCATION_SEARCH_INPUT',
            label: advancedSearchBirthForm.placeOfRegistrationlabel,
            helperText: advancedSearchBirthForm.placeOfRegistrationHelperText,
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
            type: 'DATE',
            label: advancedSearchBirthForm.dateOfRegistration,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'statusOfRecord',
            customisable: false,
            type: 'SELECT_WITH_OPTIONS',
            label: advancedSearchBirthForm.statusOfRecordLabel,
            required: false,
            initialValue: '',
            validate: [],
            placeholder: formMessageDescriptors.formSelectPlaceholder,
            options: [
              {
                value: 'ALL',
                label: advancedSearchBirthForm.recordStatusAny
              },
              {
                value: 'IN_PROGRESS',
                label: advancedSearchBirthForm.recordStatusInprogress
              },
              {
                value: 'IN_REVIEW',
                label: advancedSearchBirthForm.recordStatusInReview
              },
              {
                value: ' REJECTED',
                label: advancedSearchBirthForm.recordStatusRequireUpdate
              },
              {
                value: 'REGISTERED',
                label: advancedSearchBirthForm.recordStatusRegistered
              },
              {
                value: ' CERTIFIED',
                label: advancedSearchBirthForm.recordStatusCertified
              },
              {
                value: 'ARCHIVED',
                label: advancedSearchBirthForm.recordStatusAchived
              }
            ]
          },
          // {
          //   name: 'placeOfBirthTitle',
          //   type: 'SUBSECTION',
          //   label: formMessageDescriptors.placeOfBirth,
          //   previewGroup: 'placeOfBirth',
          //   ignoreBottomMargin: true,
          //   initialValue: '',
          //   validate: []
          // },
          {
            name: 'location',
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
            name: 'internationalDistrict',
            customisable: false,
            type: 'TEXT',
            label: formMessageDescriptors.internationalDistrict,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'internationalState',
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
          label: advancedSearchBirthForm.registrationDetails
        }
      ],
      placeholder: advancedSearchBirthForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: 'childBirthDate',
            customisable: false,
            type: 'DATE',
            label: formMessageDescriptors.childDateOfBirth,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'firstNamesEng',
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
            name: 'familyNameEng',
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
            name: 'gender',
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
          label: advancedSearchBirthForm.registrationDetails
        }
      ],
      placeholder: advancedSearchBirthForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: 'motherDateOfBirth',
            customisable: false,
            type: 'DATE',
            label: formMessageDescriptors.motherDateOfBirth,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'firstNamesEng',
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
            name: 'familyNameEng',
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
          label: advancedSearchBirthForm.registrationDetails
        }
      ],
      placeholder: advancedSearchBirthForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: 'fatherBirthDate',
            customisable: false,
            type: 'DATE',
            label: formMessageDescriptors.fatherDateOfBirth,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'firstNamesEng',
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
            name: 'familyNameEng',
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
      label: advancedSearchBirthForm.informantDetails,
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
          label: advancedSearchBirthForm.registrationDetails
        }
      ],
      placeholder: advancedSearchBirthForm.registrationDetails,
      nestedFields: {
        yes: [
          {
            name: 'informantBirthDate',
            customisable: false,
            type: 'DATE',
            label: formMessageDescriptors.motherDateOfBirth,
            required: false,
            initialValue: '',
            validate: []
          },
          {
            name: 'firstNamesEng',
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
            name: 'familyNameEng',
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
