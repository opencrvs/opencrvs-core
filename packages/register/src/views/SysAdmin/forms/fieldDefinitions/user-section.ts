import {
  IFormSection,
  TEXT,
  FIELD_GROUP_TITLE,
  SEARCH_FIELD,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS
} from '@register/forms'
import { defineMessages } from 'react-intl'
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

const messages = defineMessages({
  userForm: {
    id: 'constants.user',
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
    id: 'user.form.label.firstNameBN',
    defaultMessage: 'Bengali first name',
    description: 'Bengali first name'
  },
  lastNameBn: {
    id: 'user.form.label.lastNameBN',
    defaultMessage: 'Bengali last name',
    description: 'Bengali last name'
  },
  firstNameEn: {
    id: 'user.form.label.firstNameEN',
    defaultMessage: 'English first name',
    description: 'English first name'
  },
  lastNameEn: {
    id: 'user.form.label.lastNameEN',
    defaultMessage: 'English last name',
    description: 'English last name'
  },
  phoneNumber: {
    id: 'constants.phoneNumber',
    defaultMessage: 'Phone number',
    description: 'Phone number'
  },
  NID: {
    id: 'user.form.label.NID',
    defaultMessage: 'NID',
    description: 'National ID'
  },
  username: {
    id: 'user.form.label.username',
    defaultMessage: 'Username',
    description: 'Username'
  },
  userRole: {
    id: 'constants.role',
    defaultMessage: 'Role',
    description: 'User role'
  },
  userType: {
    id: 'constants.type',
    defaultMessage: 'Type',
    description: 'User type'
  },
  userDevice: {
    id: 'user.form.label.userDevice',
    defaultMessage: 'Device',
    description: 'User device'
  },
  registrationOffice: {
    id: 'user.form.label.registrationOffice',
    defaultMessage: 'Registration Office',
    description: 'Registration office'
  }
})

export const userSection: IFormSection = {
  id: 'user',
  viewType: 'form',
  name: messages.userForm,
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
          label: messages.userRole,
          required: true,
          initialValue: '',
          validate: [],
          options: []
        },
        {
          name: 'type',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: messages.userType,
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
    }
  ]
}
