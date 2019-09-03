import {
  DATE,
  NUMBER,
  RADIO_GROUP,
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
  fieldToNameTransformer,
  sectionRemoveTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import {
  arrayToFieldTransformer,
  fieldValueTransformer,
  identityToFieldTransformer,
  nameToFieldTransformer
} from '@register/forms/mappings/query/field-mappings'
import { emptyFatherSectionTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/query/father-mappings'
import { conditionals } from '@register/forms/utils'
import { formMessages as messages } from '@register/i18n/messages'
import {
  isValidBirthDate,
  numeric,
  validLength
} from '@register/utils/validate'

export interface IFatherSectionFormData {
  firstName: string
  foo: string
  bar: string
  baz: string
}

export const fatherSection: IFormSection = {
  id: 'father',
  viewType: 'form' as ViewType,
  name: messages.fatherName,
  title: messages.fatherTitle,
  hasDocumentSection: true,
  groups: [
    {
      id: 'father-view-group',
      fields: [
        {
          name: 'fathersDetailsExist',
          type: RADIO_GROUP,
          label: messages.fathersDetailsExist,
          required: true,
          initialValue: true,
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            { value: false, label: messages.deny }
          ],
          conditionals: [conditionals.fatherContactDetailsRequired],
          mapping: {
            mutation: sectionRemoveTransformer
          }
        },
        {
          name: 'nationalID',
          type: NUMBER,
          label: messages.fetchPersonByNIDModalInfo,
          required: true,
          initialValue: '',
          validate: [numeric, validLength(9)],
          conditionals: [conditionals.fathersDetailsExist],
          mapping: {
            mutation: fieldToIdentityTransformer('id', NATIONAL_ID),
            query: identityToFieldTransformer('id', NATIONAL_ID)
          }
        },
        {
          name: 'socialSecurityNo',
          type: NUMBER,
          label: {
            defaultMessage: 'Social Secirity No',
            description: 'text for social security number form field',
            id: 'form.field.label.fileUploadError'
          },
          required: false,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.fathersDetailsExist],
          mapping: {
            mutation: fieldToIdentityTransformer('id', SOCIAL_SECURITY_NO),
            query: identityToFieldTransformer('id', SOCIAL_SECURITY_NO)
          }
        },
        {
          name: 'nationality',
          type: SELECT_WITH_OPTIONS,
          label: messages.nationality,
          required: true,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: countries,
          conditionals: [conditionals.fathersDetailsExist],
          mapping: {
            mutation: fieldToArrayTransformer,
            query: arrayToFieldTransformer
          }
        },
        {
          name: 'firstNames',
          type: TEXT,
          label: messages.fatherFirstNamesEng,
          required: false,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.fathersDetailsExist],
          mapping: {
            mutation: fieldToNameTransformer('en', 'firstNames'),
            query: nameToFieldTransformer('en', 'firstNames')
          }
        },
        {
          name: 'familyName',
          type: TEXT,
          label: messages.fatherFamilyNameEng,
          required: true,
          initialValue: '',
          validate: [],
          conditionals: [conditionals.fathersDetailsExist],
          mapping: {
            mutation: fieldToNameTransformer('en', 'familyName'),
            query: nameToFieldTransformer('en', 'familyName')
          }
        },
        {
          name: 'motherBirthDate',
          type: DATE,
          label: messages.fatherDateOfBirth,
          required: true,
          initialValue: '',
          validate: [isValidBirthDate],
          conditionals: [conditionals.fathersDetailsExist],
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
          conditionals: [conditionals.fathersDetailsExist]
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
          conditionals: [conditionals.fathersDetailsExist]
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
          conditionals: [conditionals.fathersDetailsExist]
        },
        {
          name: 'educationalAttainment',
          type: SELECT_WITH_OPTIONS,
          conditionals: [conditionals.fathersDetailsExist],
          label: {
            defaultMessage: 'Level of education',
            description: 'Label for form field: Father education',
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
  ],
  mapping: {
    query: emptyFatherSectionTransformer
  }
}
