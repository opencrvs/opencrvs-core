import { formMessages as messages } from '@register/i18n/messages'
import {
  IFormSection,
  SELECT_WITH_OPTIONS,
  TEL,
  TEXTAREA,
  WARNING
} from '@register/forms'
import { phoneNumberFormat } from '@register/utils/validate'
import {
  fieldNameTransformer,
  fieldToCommentTransformer,
  sectionFieldToBundleFieldTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import {
  fieldValueTransformer,
  bundleFieldToSectionFieldTransformer,
  commentToFieldTransformer
} from '@register/forms/mappings/query/field-mappings'
import { setRegistrationSectionTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/mutation/registration-mappings'
import { getRegistrationSectionTransformer } from '@register/forms/register/fieldDefinitions/birth/mappings/query/registration-mappings'

export const registrationSection: IFormSection = {
  id: 'registration',
  viewType: 'hidden',
  name: messages.registrationName,
  title: messages.registrationTitle,
  groups: [
    {
      id: 'registration-view-group',
      fields: [
        {
          name: 'presentAtBirthRegistration',
          type: SELECT_WITH_OPTIONS,
          label: messages.whoIsPresentLabel,
          required: false,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: [
            {
              value: 'BOTH_PARENTS',
              label: messages.presentBoth
            },
            {
              value: 'MOTHER_ONLY',
              label: messages.presentMother
            },
            {
              value: 'FATHER_ONLY',
              label: messages.presentFather
            },
            {
              value: 'OTHER',
              label: messages.presentOther
            }
          ],
          mapping: {
            mutation: sectionFieldToBundleFieldTransformer(),
            query: bundleFieldToSectionFieldTransformer()
          }
        },
        {
          name: 'whoseContactDetails',
          type: SELECT_WITH_OPTIONS,
          label: messages.whoseContactDetailsLabel,
          required: false,
          initialValue: '',
          validate: [],
          placeholder: messages.select,
          options: [
            {
              value: 'BOTH',
              label: messages.contactDetailsBoth
            },
            {
              value: 'MOTHER',
              label: messages.contactDetailsMother
            },
            {
              value: 'FATHER',
              label: messages.contactDetailsFather
            }
          ],
          mapping: {
            mutation: fieldNameTransformer('contact'),
            query: fieldValueTransformer('contact')
          }
        },
        {
          name: 'registrationPhone',
          type: TEL,
          label: messages.registrationPhoneLabel,
          required: true,
          initialValue: '',
          validate: [phoneNumberFormat],
          mapping: {
            mutation: fieldNameTransformer('contactPhoneNumber'),
            query: fieldValueTransformer('contactPhoneNumber')
          }
        },
        {
          name: 'phoneVerificationWarning',
          type: WARNING,
          label: messages.phoneVerificationWarning,
          initialValue: '',
          validate: []
        },
        {
          name: 'commentsOrNotes',
          type: TEXTAREA,
          label: messages.commentsOrNotesLabel,
          required: false,
          initialValue: '',
          validate: [],
          description: messages.commentsOrNotesDescription,
          mapping: {
            mutation: fieldToCommentTransformer,
            query: commentToFieldTransformer
          }
        }
      ]
    }
  ],
  mapping: {
    mutation: setRegistrationSectionTransformer,
    query: getRegistrationSectionTransformer
  }
}
