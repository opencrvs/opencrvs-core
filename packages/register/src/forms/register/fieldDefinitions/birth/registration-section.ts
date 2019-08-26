import { formMessages as messages } from '@register/i18n/messages'
import {
  SELECT_WITH_OPTIONS,
  TEL,
  TEXTAREA,
  WARNING,
  ISerializedFormSection
} from '@register/forms'

export const registrationSection: ISerializedFormSection = {
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
              value: 'MOTHER',
              label: messages.presentMother
            },
            {
              value: 'FATHER',
              label: messages.presentFather
            },
            {
              value: 'OTHER',
              label: messages.presentOther
            }
          ],
          mapping: {
            mutation: {
              operation: 'sectionFieldToBundleFieldTransformer',
              parameters: []
            },
            query: {
              operation: 'bundleFieldToSectionFieldTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'fieldNameTransformer',
              parameters: ['contact']
            },
            query: {
              operation: 'fieldValueTransformer',
              parameters: ['contact']
            }
          }
        },
        {
          name: 'registrationPhone',
          type: TEL,
          label: messages.registrationPhoneLabel,
          required: true,
          initialValue: '',
          validate: [{ operation: 'phoneNumberFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldNameTransformer',
              parameters: ['contactPhoneNumber']
            },
            query: {
              operation: 'fieldValueTransformer',
              parameters: ['contactPhoneNumber']
            }
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
            mutation: {
              operation: 'fieldToCommentTransformer'
            },
            query: { operation: 'commentToFieldTransformer' }
          }
        }
      ]
    }
  ],
  mapping: {
    mutation: {
      operation: 'setBirthRegistrationSectionTransformer'
    },
    query: {
      operation: 'getBirthRegistrationSectionTransformer'
    }
  }
}
