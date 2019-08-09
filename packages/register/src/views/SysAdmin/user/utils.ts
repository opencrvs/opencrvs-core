import { createUserMutation } from '@register/views/SysAdmin/user/mutations'
import { draftToGqlTransformer } from '@register/transformer'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import {
  IFormField,
  ISelectFormFieldWithOptions,
  ISelectFormFieldWithDynamicOptions
} from '@register/forms'
import { userMessages } from '@register/i18n/messages'
import { getRolesQuery } from './queries'

export enum UserStatus {
  ACTIVE,
  PENDING,
  DISABLED
}

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

export const mockDataWithRegistarRoleSelected = {
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
  role: 'LOCAL_REGISTRAR',
  type: 'SECRETARY',
  userDetails: '',
  username: '',
  signature: {
    type: 'image/png',
    data:
      'iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RW'
  }
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
      label: userMessages[type],
      value: type
    }))

  return fields.map(field => {
    if (field.name === 'role') {
      ;(field as ISelectFormFieldWithOptions).options = roles.map(
        ({ value }: { value: string }) => ({
          label: userMessages[value],
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
