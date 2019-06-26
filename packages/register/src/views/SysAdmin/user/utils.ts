import { defineMessages } from 'react-intl'
import { createUserMutation } from '@register/views/SysAdmin/user/mutations'
import { draftToGqlTransformer } from '@register/transformer'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'

export enum UserStatus {
  ACTIVE,
  PENDING,
  DISABLED
}

export const messages = defineMessages({
  name: {
    id: 'table.column.header.name',
    defaultMessage: 'Name',
    description: 'Title for column'
  },
  role: {
    id: 'table.column.header.role',
    defaultMessage: 'Role',
    description: 'Title for column'
  },
  type: {
    id: 'table.column.header.type',
    defaultMessage: 'Type',
    description: 'Title for column'
  },
  status: {
    id: 'table.column.header.status',
    defaultMessage: 'Status',
    description: 'Title for column'
  },
  queryError: {
    id: 'system.user.queryError',
    defaultMessage: 'An error occured while loading system users',
    description: 'The text when error ocurred loading system users'
  }
})

export const mockIncompleteFormData = {
  accountDetails: '',
  assignedRegisterOffice: '',
  device: '',
  familyName: 'হোসেন',
  familyNameEng: 'Hossain',
  firstNames: '',
  firstNamesEng: '',
  nid: '1014881922',
  phoneNumber: '',
  registrationOffice: '895cc945-94a9-4195-9a29-22e9310f3385',
  role: 'Field Agent',
  userDetails: '',
  username: ''
}

export const mockCompleteFormData = {
  accountDetails: '',
  assignedRegisterOffice: '',
  device: '',
  familyName: 'হোসেন',
  familyNameEng: 'Hossain',
  firstNames: '',
  firstNamesEng: '',
  nid: '1014881922',
  phoneNumber: '01662132132',
  registrationOffice: '895cc945-94a9-4195-9a29-22e9310f3385',
  role: 'Field Agent',
  userDetails: '',
  username: ''
}

export const mockUserGraphqlOperation = {
  request: {
    query: createUserMutation,
    variables: draftToGqlTransformer(
      { sections: [userSection] },
      { user: mockCompleteFormData }
    )
  },
  result: {
    data: { createUser: { username: 'hossain123', __typename: 'User' } }
  }
}
