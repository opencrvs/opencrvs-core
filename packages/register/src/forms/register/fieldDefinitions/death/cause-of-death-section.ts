import {
  IFormSection,
  ViewType,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  TEXT
} from '@register/forms'
import { defineMessages } from 'react-intl'
import { maxLength, blockAlphaNumericDot } from '@register/utils/validate'
import { conditionals } from '@register/forms/utils'
import {
  sectionFieldToBundleFieldTransformer,
  ignoreFieldTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import { bundleFieldToSectionFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import { hasCaseOfDeathSectionTransformer } from '@register/forms/register/fieldDefinitions/death/mappings/query/cause-of-death-mappings'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  causeOfDeathTab: {
    id: 'register.form.tabs.causeOfDeathTab',
    defaultMessage: 'Cause of Death',
    description: 'Tab title for Cause of Death'
  },
  causeOfDeathTitle: {
    id: 'register.form.section.causeOfDeathTitle',
    defaultMessage: 'Cause of Death',
    description: 'Form section title for Cause of Death'
  },
  causeOfDeathNotice: {
    id: 'register.form.section.causeOfDeathNotice',
    defaultMessage:
      'Official cause of death is not mandatory to submit the application. A cause of death can be added at a later date.',
    description: 'Form section notice for Cause of Death'
  },
  causeOfDeathEstablished: {
    id: 'formFields.causeOfDeathEstablished',
    defaultMessage: 'Has a Cause of Death been established ?',
    description: 'Label for form field: Cause of Death Established'
  },
  confirm: {
    id: 'formFields.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'formFields.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
  },
  methodOfCauseOfDeath: {
    id: 'formFields.methodOfCauseOfDeath',
    defaultMessage: 'Method of Cause of Death',
    description: 'Label for form field: Method of Cause of Death'
  },
  causeOfDeathCode: {
    id: 'formFields.causeOfDeathCode',
    defaultMessage: 'Cause of Death Code',
    description: 'Label for form field: Cause of Death Code'
  },
  verbalAutopsy: {
    id: 'formFields.verbalAutopsy',
    defaultMessage: 'Verbal autopsy',
    description: 'Option for form field: Method of Cause of Death'
  },
  medicallyCertified: {
    id: 'formFields.medicallyCertified',
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: Method of Cause of Death'
  },
  blockAlphaNumericDot: {
    id: 'validations.blockAlphaNumericDot',
    defaultMessage:
      'Can contain only block character, number and dot (e.g. C91.5)',
    description: 'The error message that appears when an invalid value is used'
  }
})

export const causeOfDeathSection: IFormSection = {
  id: 'causeOfDeath',
  viewType: 'form' as ViewType,
  name: messages.causeOfDeathTab,
  title: messages.causeOfDeathTitle,
  optional: true,
  notice: messages.causeOfDeathNotice,
  fields: [
    {
      name: 'causeOfDeathEstablished',
      type: RADIO_GROUP,
      label: messages.causeOfDeathEstablished,
      required: false,
      initialValue: false,
      validate: [],
      options: [
        {
          value: false,
          label: messages.deny
        },
        { value: true, label: messages.confirm }
      ],
      mapping: {
        mutation: ignoreFieldTransformer,
        query: hasCaseOfDeathSectionTransformer
      }
    },
    {
      name: 'methodOfCauseOfDeath',
      type: SELECT_WITH_OPTIONS,
      initialValue: '',
      label: messages.methodOfCauseOfDeath,
      validate: [],
      required: false,
      options: [
        {
          value: 'VERBAL_AUTOPSY',
          label: messages.verbalAutopsy
        },
        {
          value: 'MEDICALLY_CERTIFIED',
          label: messages.medicallyCertified
        }
      ],
      conditionals: [conditionals.causeOfDeathEstablished],
      mapping: {
        mutation: sectionFieldToBundleFieldTransformer('causeOfDeathMethod'),
        query: bundleFieldToSectionFieldTransformer('causeOfDeathMethod')
      }
    },
    {
      name: 'causeOfDeathCode',
      type: TEXT,
      initialValue: '',
      label: messages.causeOfDeathCode,
      required: false,
      conditionals: [conditionals.causeOfDeathEstablished],
      validate: [blockAlphaNumericDot, maxLength(17)],
      mapping: {
        mutation: sectionFieldToBundleFieldTransformer('causeOfDeath'),
        query: bundleFieldToSectionFieldTransformer('causeOfDeath')
      }
    }
  ]
}
