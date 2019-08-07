import {
  IFormSection,
  TEXT,
  FIELD_GROUP_TITLE,
  SEARCH_FIELD,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  DOCUMENT_UPLOADER_WITH_OPTION,
  SIMPLE_DOCUMENT_UPLOADER
} from '@register/forms'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  phoneNumberFormat,
  validIDNumber
} from '@register/utils/validate'
import {
  fieldToNameTransformer,
  fieldNameTransformer,
  fieldToIdentifierWithTypeTransformer,
  fieldNameValueTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import { NATIONAL_ID } from '@register/forms/identity'
import {
  constantsMessages,
  formMessages as messages
} from '@register/i18n/messages'
import { conditionals } from '@register/forms/utils'

export const userSection: IFormSection = {
  id: 'user',
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
          validate: [bengaliOnlyNameFormat],
          mapping: {
            mutation: fieldToNameTransformer('bn')
          }
        },
        {
          name: 'familyName',
          type: TEXT,
          label: messages.lastNameBn,
          required: true,
          initialValue: '',
          validate: [bengaliOnlyNameFormat],
          mapping: {
            mutation: fieldToNameTransformer('bn')
          }
        },
        {
          name: 'firstNamesEng',
          type: TEXT,
          label: messages.firstNameEn,
          required: false,
          initialValue: '',
          validate: [englishOnlyNameFormat],
          mapping: {
            mutation: fieldToNameTransformer('en', 'firstNames')
          }
        },
        {
          name: 'familyNameEng',
          type: TEXT,
          label: messages.lastNameEn,
          required: true,
          initialValue: '',
          validate: [englishOnlyNameFormat],
          mapping: {
            mutation: fieldToNameTransformer('en', 'familyName')
          }
        },
        {
          name: 'phoneNumber',
          type: TEXT,
          label: messages.phoneNumber,
          required: true,
          initialValue: '',
          validate: [phoneNumberFormat],
          mapping: {
            mutation: fieldNameTransformer('mobile')
          }
        },
        {
          name: 'nid',
          type: TEXT,
          label: messages.NID,
          required: true,
          initialValue: '',
          validate: [validIDNumber(NATIONAL_ID)],
          mapping: {
            mutation: fieldToIdentifierWithTypeTransformer('NATIONAL_ID')
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
            mutation: fieldNameValueTransformer('primaryOffice')
          }
        }
      ]
    },
    {
      id: 'signature',
      title: messages.userSignatureAttachmentTitle,
      conditionals: [conditionals.isRegistrarRoleSeleted],
      fields: [
        {
          name: 'signature',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: messages.userSignatureAttachment,
          description: messages.userSignatureAttachmentDesc,
          allowedDocType: ['image/png'],
          initialValue: '',
          hideAsterisk: true,
          validate: []
        }
      ]
    }
  ]
}
