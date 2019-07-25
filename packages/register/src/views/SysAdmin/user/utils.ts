import { defineMessages } from 'react-intl'
import { createUserMutation } from '@register/views/SysAdmin/user/mutations'
import { draftToGqlTransformer } from '@register/transformer'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import {
  IFormField,
  ISelectFormFieldWithOptions,
  ISelectFormFieldWithDynamicOptions
} from '@register/forms'
import { roleMessages, typeMessages } from '@register/utils/roleTypeMessages'
import { getRolesQuery } from './queries'

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
  username: {
    id: 'table.column.header.username',
    defaultMessage: 'Username',
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
  role: 'FIELD_AGENT',
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
  nid: '1014881922121',
  phoneNumber: '01662132132',
  registrationOffice: '895cc945-94a9-4195-9a29-22e9310f3385',
  role: 'FIELD_AGENT',
  type: 'HOSPITAL',
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

export const mockFetchRoleGraphqlOperation = {
  request: {
    query: getRolesQuery,
    variables: {}
  },
  result: {
    data: {
      getRoles: [
        {
          title: 'Field Agent',
          value: 'FIELD_AGENT',
          types: ['HOSPITAL', 'CHA']
        },
        {
          title: 'Registration Agent',
          value: 'REGISTRATION_AGENT',
          types: ['ENTREPENEUR', 'DATA_ENTRY_CLERK']
        },
        {
          title: 'Registrar',
          value: 'LOCAL_REGISTRAR',
          types: ['SECRETARY', 'CHAIRMAN', 'MAYOR']
        },
        {
          title: 'System admin (local)',
          value: 'LOCAL_SYSTEM_ADMIN',
          types: ['LOCAL_SYSTEM_ADMIN']
        },
        {
          title: 'System admin (national)',
          value: 'NATIONAL_SYSTEM_ADMIN',
          types: ['NATIONAL_SYSTEM_ADMIN']
        },
        {
          title: 'Performance Oversight',
          value: 'PERFORMANCE_OVERSIGHT',
          types: ['CABINET_DIVISION', 'BBS']
        },
        {
          title: 'Performance Management',
          value: 'PERFORMANCE_MANAGEMENT',
          types: ['HEALTH_DIVISION', 'ORG_DIVISION']
        }
      ]
    }
  }
}

export const transformRoleDataToDefinitions = (
  fields: IFormField[],
  data: any
): IFormField[] => {
  const roles = data.data.getRoles as Array<any>
  const transformTypes = (types: string[]) =>
    types.map(type => ({
      label: typeMessages[type],
      value: type
    }))

  return fields.map(field => {
    if (field.name === 'role') {
      ;(field as ISelectFormFieldWithOptions).options = roles.map(
        ({ value }: { value: string }) => ({
          label: roleMessages[value],
          value
        })
      )
      return field
    } else if (field.name === 'type') {
      ;(field as ISelectFormFieldWithDynamicOptions).dynamicOptions.options = roles.reduce(
        (options, { value, types }) => ({
          ...options,
          [value]: transformTypes(types)
        }),
        {}
      )
      return field
    } else return field
  })
}
