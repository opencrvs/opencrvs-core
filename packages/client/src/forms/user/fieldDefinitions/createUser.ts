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
  FIELD_GROUP_TITLE,
  LOCATION_SEARCH_INPUT,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SIMPLE_DOCUMENT_UPLOADER,
  TEXT,
  UserSection,
  ISerializedFormSection,
  HIDDEN
} from '@client/forms/index'
import { NATIONAL_ID } from '@client/forms/identity'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { userMessages } from '@client/i18n/messages/user'

const TITLES_AND_ROLES = {
  FIELD_AGENT: ['FIELD_AGENT'],
  REGISTRATION_AGENT: ['REGISTRAR'],
  LOCAL_REGISTRAR: ['DCR'],
  LOCAL_SYSTEM_ADMIN: ['STATE_SYSTEM_ADMIN'],
  NATIONAL_SYSTEM_ADMIN: ['NATIONAL_SYSTEM_ADMIN', 'E_CRVS_PROJECT_ADMIN'],
  PERFORMANCE_MANAGEMENT: [
    'HEAD_OF_DEPARTMENT',
    'E_CRVS_PROJECT_SUPPORT',
    'STATE_DIRECTOR',
    'FEDERAL_COMMISSIONER',
    'DIRECTOR_VRD',
    'DIRECTOR_GENERAL',
    'CHAIRMAN'
  ],
  NATIONAL_REGISTRAR: []
}

export const userSectionFormType: ISerializedFormSection = {
  id: UserSection.User,
  viewType: 'form',
  name: userFormMessages.user,
  title: userFormMessages.userFormTitle,
  groups: [
    {
      id: 'registration-office',
      title: userFormMessages.assignedRegistrationOffice,
      conditionals: [
        {
          action: 'hide',
          expression:
            'values.skippedOfficeSelction && values.registrationOffice'
        }
      ],
      fields: [
        {
          name: 'assignedRegistrationOffice',
          type: FIELD_GROUP_TITLE,
          label: userFormMessages.assignedRegistrationOfficeGroupTitle,
          required: false,
          hidden: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'registrationOffice',
          type: LOCATION_SEARCH_INPUT,
          label: userFormMessages.registrationOffice,
          required: true,
          initialValue: '',
          searchableResource: 'offices',
          searchableType: 'CRVS_OFFICE',
          validate: [
            {
              operation: 'officeMustBeSelected'
            }
          ],
          locationList: [],
          mapping: {
            mutation: {
              operation: 'fieldNameTransformer',
              parameters: ['primaryOffice']
            },
            query: {
              operation: 'locationIDToFieldTransformer',
              parameters: ['primaryOffice']
            }
          }
        }
      ]
    },
    {
      id: 'user-view-group',
      title: userFormMessages.userDetails,
      fields: [
        {
          name: 'firstNamesEng',
          type: TEXT,
          label: userFormMessages.firstNameEn,
          required: true,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'firstNames']
            },
            query: {
              operation: 'nameToFieldTransformer',
              parameters: ['en', 'firstNames']
            }
          }
        },
        {
          name: 'familyNameEng',
          type: TEXT,
          label: userFormMessages.lastNameEn,
          required: true,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'familyName']
            },
            query: {
              operation: 'nameToFieldTransformer',
              parameters: ['en', 'familyName']
            }
          }
        },
        {
          name: 'username',
          type: TEXT,
          label: userFormMessages.username,
          previewGroup: 'userNameGroup',
          required: false,
          initialValue: '',
          validate: [],
          readonly: true,
          hidden: true
        },
        {
          name: 'phoneNumber',
          type: TEXT,
          label: userFormMessages.phoneNumber,
          required: true,
          initialValue: '',
          validate: [{ operation: 'phoneNumberFormat' }],
          mapping: {
            mutation: {
              operation: 'msisdnTransformer',
              parameters: ['user.mobile']
            },
            query: {
              operation: 'localPhoneTransformer',
              parameters: ['user.mobile']
            }
          }
        },
        {
          name: 'nid',
          type: TEXT,
          label: userFormMessages.NID,
          required: false,
          initialValue: '',
          validate: [
            {
              operation: 'validIDNumber',
              parameters: [NATIONAL_ID]
            }
          ],
          mapping: {
            mutation: {
              operation: 'fieldToIdentifierWithTypeTransformer',
              parameters: [NATIONAL_ID]
            },
            query: {
              operation: 'identifierWithTypeToFieldTransformer',
              parameters: [NATIONAL_ID]
            }
          }
        },
        {
          name: 'seperator',
          type: 'SUBSECTION',
          label: {
            defaultMessage: ' ',
            description: 'empty string',
            id: 'form.field.label.empty'
          },
          initialValue: '',
          ignoreBottomMargin: true,
          validate: [],
          conditionals: []
        },
        {
          name: 'title',
          type: SELECT_WITH_OPTIONS,
          label: userFormMessages.labelRole,
          required: true,
          initialValue: '',
          validate: [],
          options: [
            { value: 'FIELD_AGENT', label: userMessages.FIELD_AGENT },
            { value: 'REGISTRAR', label: userMessages.REGISTRAR },
            { value: 'DCR', label: userMessages.DCR },
            {
              value: 'HEAD_OF_DEPARTMENT',
              label: userMessages.HEAD_OF_DEPARTMENT
            },
            { value: 'STATE_DIRECTOR', label: userMessages.STATE_DIRECTOR },
            {
              value: 'FEDERAL_COMMISSIONER',
              label: userMessages.FEDERAL_COMMISSIONER
            },
            { value: 'DIRECTOR_VRD', label: userMessages.DIRECTOR_VRD },
            {
              value: 'DIRECTOR_GENERAL',
              label: userMessages.DIRECTOR_GENERAL
            },
            { value: 'CHAIRMAN', label: userMessages.CHAIRMAN },
            {
              value: 'STATE_SYSTEM_ADMIN',
              label: userMessages.STATE_SYSTEM_ADMIN
            },
            {
              value: 'NATIONAL_SYSTEM_ADMIN',
              label: userMessages.NATIONAL_SYSTEM_ADMIN
            },
            {
              value: 'E_CRVS_PROJECT_ADMIN',
              label: userMessages.E_CRVS_PROJECT_ADMIN
            },
            {
              value: 'E_CRVS_PROJECT_SUPPORT',
              label: userMessages.E_CRVS_PROJECT_SUPPORT
            }
          ]
        },
        {
          name: 'role',
          type: HIDDEN,
          label: userFormMessages.labelRole,
          required: true,
          initialValue: '',
          validate: [],
          dependsOn: {
            fieldName: 'title',
            valueMapping: TITLES_AND_ROLES
          }
        },
        {
          name: 'type',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: userFormMessages.type,
          required: true,
          initialValue: '',
          validate: [],
          dynamicOptions: {
            dependency: 'role',
            options: {}
          },
          conditionals: [
            {
              action: 'hide',
              expression: '(values.role!="FIELD_AGENT")'
            }
          ]
        },
        {
          name: 'device',
          type: TEXT,
          label: userFormMessages.userDevice,
          required: false,
          initialValue: '',
          validate: []
        }
      ]
    },
    {
      id: 'signature-attachment',
      title: userFormMessages.userSignatureAttachmentTitle,
      conditionals: [
        {
          action: 'hide',
          expression:
            'values.role!=="LOCAL_REGISTRAR" && values.role!=="NATIONAL_REGISTRAR"'
        }
      ],
      fields: [
        {
          name: 'attachmentTitle',
          type: FIELD_GROUP_TITLE,
          hidden: true,
          label: userFormMessages.userAttachmentSection,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'signature',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: userFormMessages.userSignatureAttachment,
          description: userFormMessages.userSignatureAttachmentDesc,
          allowedDocType: ['image/png'],
          initialValue: '',
          required: true,
          validate: []
        }
      ]
    }
  ]
}

const getPreviewGroups = () => {
  return userSectionFormType.groups.map((group) => {
    return {
      id: `preview-${group.id}`,
      fields: group.fields
    }
  })
}

export const userSectionPreviewType: ISerializedFormSection = {
  id: UserSection.Preview,
  viewType: 'preview',
  name: userFormMessages.userFormReviewTitle,
  title: userFormMessages.userFormTitle,
  groups: getPreviewGroups()
}

export const createUserForm = {
  sections: [userSectionFormType, userSectionPreviewType]
}
