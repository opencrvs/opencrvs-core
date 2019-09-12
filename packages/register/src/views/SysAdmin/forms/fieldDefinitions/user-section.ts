import {
  TEXT,
  FIELD_GROUP_TITLE,
  SEARCH_FIELD,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  ISerializedFormSection,
  SIMPLE_DOCUMENT_UPLOADER,
  UserSection
} from '@register/forms'

import { NATIONAL_ID } from '@register/forms/identity'
import {
  constantsMessages,
  formMessages as messages,
  formMessages
} from '@register/i18n/messages'
import { conditionals } from '@register/forms/utils'

export const userSection: ISerializedFormSection = {
  id: UserSection.User,
  viewType: 'form',
  name: constantsMessages.user,
  title: messages.userFormTitle,
  groups: [
    {
      id: 'user-view-group',
      fields: [
        {
          name: 'userDetails',
          type: FIELD_GROUP_TITLE,
          label: messages.userDetails,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'firstNames',
          type: TEXT,
          label: messages.firstNameBn,
          required: false,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['bn']
            }
          }
        },
        {
          name: 'familyName',
          type: TEXT,
          label: messages.lastNameBn,
          required: true,
          initialValue: '',
          validate: [{ operation: 'bengaliOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['bn']
            }
          }
        },
        {
          name: 'firstNamesEng',
          type: TEXT,
          label: messages.firstNameEn,
          required: false,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'firstNames']
            }
          }
        },
        {
          name: 'familyNameEng',
          type: TEXT,
          label: messages.lastNameEn,
          required: true,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'familyName']
            }
          }
        },
        {
          name: 'phoneNumber',
          type: TEXT,
          label: messages.phoneNumber,
          required: true,
          initialValue: '',
          validate: [{ operation: 'phoneNumberFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldNameTransformer',
              parameters: ['mobile']
            }
          }
        },
        {
          name: 'nid',
          type: TEXT,
          label: messages.NID,
          required: true,
          initialValue: '',
          validate: [{ operation: 'validIDNumber', parameters: [NATIONAL_ID] }],
          mapping: {
            mutation: {
              operation: 'fieldToIdentifierWithTypeTransformer',
              parameters: ['NATIONAL_ID']
            }
          }
        },
        {
          name: 'accountDetails',
          type: FIELD_GROUP_TITLE,
          label: messages.accountDetails,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'role',
          type: SELECT_WITH_OPTIONS,
          label: constantsMessages.labelRole,
          required: true,
          initialValue: '',
          validate: [],
          options: []
        },
        {
          name: 'type',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: constantsMessages.type,
          required: true,
          initialValue: '',
          validate: [],
          dynamicOptions: {
            dependency: 'role',
            options: {}
          }
        },
        {
          name: 'device',
          type: TEXT,
          label: messages.userDevice,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'assignedRegisterOffice',
          type: FIELD_GROUP_TITLE,
          label: messages.assignedRegisterOffice,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'registrationOffice',
          type: SEARCH_FIELD,
          label: messages.registrationOffice,
          required: true,
          initialValue: '',
          validate: [],
          mapping: {
            mutation: {
              operation: 'fieldNameValueTransformer',
              parameters: ['primaryOffice']
            }
          }
        }
      ]
    },
    {
      id: 'signature-attachment',
      title: messages.userSignatureAttachmentTitle,
      conditionals: [conditionals.isRegistrarRoleSelected],
      fields: [
        {
          name: 'attachmentTitle',
          type: FIELD_GROUP_TITLE,
          hidden: true,
          label: messages.userAttachmentSection,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'signature',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: messages.userSignatureAttachment,
          description: messages.userSignatureAttachmentDesc,
          allowedDocType: ['image/png'],
          initialValue: '',
          required: true,
          hideAsterisk: true,
          validate: []
        }
      ]
    }
  ]
}
