import {
  DATE,
  NUMBER,
  SELECT_WITH_OPTIONS,
  SUBSECTION,
  TEXT,
  ViewType
} from '@register/forms'
import { countries } from '@register/forms/countries'
import { NATIONAL_ID, SOCIAL_SECURITY_NO } from '@register/forms/identity'
import { IFormSection } from '@register/forms/index'
import {
  fieldNameTransformer,
  fieldToArrayTransformer,
  fieldToIdentityTransformer,
  fieldToNameTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import {
  arrayToFieldTransformer,
  fieldValueTransformer,
  identityToFieldTransformer,
  nameToFieldTransformer
} from '@register/forms/mappings/query/field-mappings'
import { formMessages as messages } from '@register/i18n/messages'
import {
  isValidBirthDate,
  numeric,
  validLength
} from '@register/utils/validate'

export interface IMotherSectionFormData {
  firstName: string
}

export const motherSection: IFormSection = {
  id: 'mother',
  viewType: 'form' as ViewType,
  name: messages.motherName,
  title: messages.motherTitle,
  hasDocumentSection: true,
  groups: [
    {
      id: 'mother-view-group',
      fields: [
        {
          name: 'nationality',
          type: SELECT_WITH_OPTIONS,
          label: messages.nationality,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: countries,
          mapping: {
            mutation: fieldToArrayTransformer,
            query: arrayToFieldTransformer
          }
        },
        {
          name: 'nationalID',
          type: NUMBER,
          label: messages.fetchPersonByNIDModalInfo,
          required: true,
          initialValue: '',
          validate: [numeric, validLength(9)],
          conditionals: [],
          mapping: {
            mutation: fieldToIdentityTransformer('id', NATIONAL_ID),
            query: identityToFieldTransformer('id', NATIONAL_ID)
          }
        },
        {
          name: 'socialSecurityNo',
          type: NUMBER,
          label: {
            defaultMessage: 'Social Security No',
            description: 'text for social security number form field',
            id: 'form.field.label.socialSecurityNumber'
          },
          required: false,
          initialValue: '',
          validate: [],
          conditionals: [],
          mapping: {
            mutation: fieldToIdentityTransformer('id', SOCIAL_SECURITY_NO),
            query: identityToFieldTransformer('id', SOCIAL_SECURITY_NO)
          }
        },
        {
          name: 'firstNames',
          type: TEXT,
          label: messages.motherFirstNamesEng,
          required: false,
          initialValue: '',
          validate: [],
          conditionals: [],
          mapping: {
            mutation: fieldToNameTransformer('en', 'firstNames'),
            query: nameToFieldTransformer('en', 'firstNames')
          }
        },
        {
          name: 'familyName',
          type: TEXT,
          label: messages.motherFamilyNameEng,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [],
          mapping: {
            mutation: fieldToNameTransformer('en', 'familyName'),
            query: nameToFieldTransformer('en', 'familyName')
          }
        },
        {
          name: 'motherBirthDate',
          type: DATE,
          label: messages.motherDateOfBirth,
          required: true,
          initialValue: '',
          validate: [isValidBirthDate],
          mapping: {
            mutation: fieldNameTransformer('birthDate'),
            query: fieldValueTransformer('birthDate')
          }
        },
        {
          name: 'seperator',
          type: SUBSECTION,
          label: {
            defaultMessage: ' ',
            description: 'empty string',
            id: 'form.field.label.empty'
          },
          initialValue: '',
          validate: [],
          conditionals: []
        },
        {
          name: 'maritalStatus',
          type: SELECT_WITH_OPTIONS,
          label: messages.maritalStatus,
          required: false,
          initialValue: 'MARRIED',
          validate: [],
          placeholder: messages.select,
          options: [
            {
              value: 'SINGLE',
              label: messages.maritalStatusSingle
            },
            {
              value: 'MARRIED',
              label: messages.maritalStatusMarried
            },
            {
              value: 'WIDOWED',
              label: messages.maritalStatusWidowed
            },
            {
              value: 'DIVORCED',
              label: messages.maritalStatusDivorced
            },
            {
              value: 'SEPARATED',
              label: messages.maritalStatusSeparated
            },
            {
              value: 'NOT_STATED',
              label: messages.maritalStatusNotStated
            }
          ],
          conditionals: []
        },
        {
          name: 'occupation',
          type: TEXT,
          label: {
            defaultMessage: 'Occupation',
            description: 'text for occupation form field',
            id: 'form.field.label.occupation'
          },
          required: true,
          initialValue: '',
          validate: [],
          conditionals: []
        },
        {
          name: 'educationalAttainment',
          type: SELECT_WITH_OPTIONS,
          label: {
            defaultMessage: 'Level of education',
            description: 'Label for form field: Mother education',
            id: 'form.field.label.motherEducationAttainment'
          },
          required: false,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: [
            {
              value: 'NO_SCHOOLING',
              label: messages.educationAttainmentNone
            },
            {
              value: 'PRIMARY_ISCED_1',
              label: messages.educationAttainmentISCED1
            },
            {
              value: 'LOWER_SECONDARY_ISCED_2',
              label: messages.educationAttainmentISCED2
            },
            {
              value: 'UPPER_SECONDARY_ISCED_3',
              label: messages.educationAttainmentISCED3
            },
            {
              value: 'POST_SECONDARY_ISCED_4',
              label: messages.educationAttainmentISCED4
            },
            {
              value: 'FIRST_STAGE_TERTIARY_ISCED_5',
              label: messages.educationAttainmentISCED5
            },
            {
              value: 'SECOND_STAGE_TERTIARY_ISCED_6',
              label: messages.educationAttainmentISCED6
            },
            {
              value: 'NOT_STATED',
              label: messages.educationAttainmentNotStated
            }
          ]
        }
      ]
    }
  ]
}
