import { IFormSection, TEXT, FIELD_GROUP_TITLE } from '@register/forms'
import { defineMessages } from 'react-intl'
import {
  bengaliOnlyNameFormat,
  englishOnlyNameFormat,
  phoneNumberFormat
} from '@register/utils/validate'

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
  id: 'userForm',
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
      name: 'firstNameBn',
      type: TEXT,
      label: messages.firstNameBn,
      required: false,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'lastNameBn',
      type: TEXT,
      label: messages.lastNameBn,
      required: true,
      initialValue: '',
      validate: [bengaliOnlyNameFormat]
    },
    {
      name: 'firstNameEn',
      type: TEXT,
      label: messages.firstNameEn,
      required: false,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'lastNameEn',
      type: TEXT,
      label: messages.lastNameEn,
      required: true,
      initialValue: '',
      validate: [englishOnlyNameFormat]
    },
    {
      name: 'phoneNumber',
      type: TEXT,
      label: messages.phoneNumber,
      required: true,
      initialValue: '',
      validate: [phoneNumberFormat]
    },
    {
      name: 'nid',
      type: TEXT,
      label: messages.NID,
      required: true,
      initialValue: '',
      validate: []
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
      type: TEXT,
      label: messages.userRole,
      required: true,
      initialValue: '',
      validate: []
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
      type: TEXT,
      label: messages.registrationOffice,
      required: true,
      initialValue: '',
      validate: []
    }
  ]
}
