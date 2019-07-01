import {
  IFormSection,
  TEXT,
  FIELD_GROUP_TITLE,
  SEARCH_FIELD,
  SELECT_WITH_OPTIONS
} from '@register/forms'
import { defineMessages } from 'react-intl'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  phoneNumberFormat
} from '@register/utils/validate'
import {
  fieldToNameTransformer,
  fieldNameTransformer,
  fieldToIdentifierWithTypeTransformer,
  fieldNameValueTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import { roleMessages, typeMessages } from '@register/utils/roleTypeMessages'

const messages = defineMessages({
  userForm: {
    id: 'user.form.name',
    defaultMessage: 'User',
    description: 'The name of the user form'
  },
  userFormTitle: {
    id: 'user.title.create',
    defaultMessage: 'Create new user',
    description: 'The title of user form'
  },
  userDetails: {
    id: 'user.section.userDetails',
    defaultMessage: 'User details',
    description: 'User details section'
  },
  accountDetails: {
    id: 'user.section.accountDetails',
    defaultMessage: 'Account details',
    description: 'Account details section'
  },
  assignedRegisterOffice: {
    id: 'user.section.assignedRegisterOffice',
    defaultMessage: 'Assigned Register Office',
    description: 'Assigned Register Office section'
  },
  firstNameBn: {
    id: 'label.firstNameBN',
    defaultMessage: 'Bangla first name',
    description: 'Bangla first name'
  },
  lastNameBn: {
    id: 'label.lastNameBN',
    defaultMessage: 'Bangla last name',
    description: 'Bangla last name'
  },
  firstNameEn: {
    id: 'label.firstNameEN',
    defaultMessage: 'English first name',
    description: 'English first name'
  },
  lastNameEn: {
    id: 'label.lastNameEN',
    defaultMessage: 'English last name',
    description: 'English last name'
  },
  phoneNumber: {
    id: 'label.phone',
    defaultMessage: 'Phone number',
    description: 'Phone number'
  },
  NID: {
    id: 'label.NID',
    defaultMessage: 'NID',
    description: 'National ID'
  },
  username: {
    id: 'label.username',
    defaultMessage: 'Username',
    description: 'Username'
  },
  userRole: {
    id: 'label.role',
    defaultMessage: 'Role',
    description: 'User role'
  },
  userType: {
    id: 'label.type',
    defaultMessage: 'Type',
    description: 'User type'
  },
  userDevice: {
    id: 'label.userDevice',
    defaultMessage: 'Device',
    description: 'User device'
  },
  registrationOffice: {
    id: 'label.registrationOffice',
    defaultMessage: 'Registration Office',
    description: 'Registration office'
  }
})

export const userSection: IFormSection = {
  id: 'user',
  viewType: 'form',
  name: messages.userForm,
  title: messages.userFormTitle,
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
      validate: [],
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
      name: 'username',
      type: TEXT,
      label: messages.username,
      required: false,
      disabled: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'role',
      type: SELECT_WITH_OPTIONS,
      label: messages.userRole,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { label: roleMessages.FIELD_AGENT, value: 'FIELD_AGENT' },
        { label: roleMessages.REGISTRATION_CLERK, value: 'REGISTRATION_CLERK' },
        { label: roleMessages.LOCAL_REGISTRAR, value: 'LOCAL_REGISTRAR' },
        { label: roleMessages.DISTRICT_REGISTRAR, value: 'DISTRICT_REGISTRAR' },
        { label: roleMessages.STATE_REGISTRAR, value: 'STATE_REGISTRAR' },
        { label: roleMessages.NATIONAL_REGISTRAR, value: 'NATIONAL_REGISTRAR' },
        { label: roleMessages.LOCAL_SYSTEM_ADMIN, value: 'LOCAL_SYSTEM_ADMIN' }
      ]
    },
    {
      name: 'type',
      type: SELECT_WITH_OPTIONS,
      label: messages.userType,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { label: typeMessages.HOSPITAL, value: 'HOSPITAL' },
        { label: typeMessages.CHA, value: 'CHA' },
        { label: typeMessages.ENTREPENEUR, value: 'ENTREPENEUR' },
        { label: typeMessages.DATA_ENTRY_CLERK, value: 'DATA_ENTRY_CLERK' },
        { label: typeMessages.SECRETARY, value: 'SECRETARY' },
        { label: typeMessages.CHAIRMAN, value: 'CHAIRMAN' },
        { label: typeMessages.MAYOR, value: 'MAYOR' },
        { label: typeMessages.LOCAL_SYSTEM_ADMIN, value: 'LOCAL_SYSTEM_ADMIN' },
        {
          label: typeMessages.NATIONAL_SYSTEM_ADMIN,
          value: 'NATIONAL_SYSTEM_ADMIN'
        }
      ]
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
}
