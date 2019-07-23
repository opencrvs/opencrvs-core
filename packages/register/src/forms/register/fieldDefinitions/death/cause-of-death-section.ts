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
import { RadioSize } from '@opencrvs/components/lib/forms'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  causeOfDeathTab: {
    id: 'register.form.section.causeOfDeath.name',
    defaultMessage: 'What is the official cause of death?',
    description: 'Form section name for Cause of Death'
  },
  causeOfDeathTitle: {
    id: 'register.form.section.causeOfDeath.title',
    defaultMessage: 'What is the official cause of death?',
    description: 'Form section title for Cause of Death'
  },
  causeOfDeathNotice: {
    id: 'register.form.section.causeOfDeathNotice',
    defaultMessage:
      'Official cause of death is not mandatory to submit the application. A cause of death can be added at a later date.',
    description: 'Form section notice for Cause of Death'
  },
  causeOfDeathEstablished: {
    id: 'form.field.label.causeOfDeathEstablished',
    defaultMessage: 'Has an official cause of death been established ?',
    description: 'Label for form field: Cause of Death Established'
  },
  confirm: {
    id: 'form.field.label.confirm',
    defaultMessage: 'Yes',
    description: 'confirmation label for yes / no radio button'
  },
  deny: {
    id: 'form.field.label.deny',
    defaultMessage: 'No',
    description: 'deny label for yes / no radio button'
  },
  methodOfCauseOfDeath: {
    id: 'form.field.label.methodOfCauseOfDeath',
    defaultMessage: 'Method of Cause of Death',
    description: 'Label for form field: Method of Cause of Death'
  },
  causeOfDeathCode: {
    id: 'form.field.label.causeOfDeathCode',
    defaultMessage: 'Cause of Death Code',
    description: 'Label for form field: Cause of Death Code'
  },
  verbalAutopsy: {
    id: 'form.field.label.verbalAutopsy',
    defaultMessage: 'Verbal autopsy',
    description: 'Option for form field: Method of Cause of Death'
  },
  medicallyCertified: {
    id: 'form.field.label.medicallyCertified',
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: Method of Cause of Death'
  },
  blockAlphaNumericDot: {
    id: 'validations.blockAlphaNumericDot',
    defaultMessage:
      'Can contain only block character, number and dot (e.g. C91.5)',
    description: 'The error message that appears when an invalid value is used'
  },
  select: {
    id: 'register.select.placeholder',
    defaultMessage: 'Select'
  }
})

export const causeOfDeathSection: IFormSection = {
  id: 'causeOfDeath',
  viewType: 'form' as ViewType,
  name: messages.causeOfDeathTab,
  title: messages.causeOfDeathTitle,
  groups: [
    {
      id: 'causeOfDeath-causeOfDeathEstablished',
      fields: [
        {
          name: 'causeOfDeathEstablished',
          type: RADIO_GROUP,
          label: messages.causeOfDeathEstablished,
          notice: messages.causeOfDeathNotice,
          required: false,
          initialValue: false,
          size: RadioSize.LARGE,
          validate: [],
          options: [
            { value: true, label: messages.confirm },
            {
              value: false,
              label: messages.deny
            }
          ],
          mapping: {
            mutation: ignoreFieldTransformer,
            query: hasCaseOfDeathSectionTransformer
          }
        }
      ]
    },
    {
      id: 'causeOfDeath-methodOfCauseOfDeathSection',
      title: messages.causeOfDeathTitle,
      conditionals: [conditionals.causeOfDeathEstablished],
      fields: [
        {
          name: 'methodOfCauseOfDeath',
          type: SELECT_WITH_OPTIONS,
          initialValue: '',
          label: messages.methodOfCauseOfDeath,
          validate: [],
          placeholder: messages.select,
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
          mapping: {
            mutation: sectionFieldToBundleFieldTransformer(
              'causeOfDeathMethod'
            ),
            query: bundleFieldToSectionFieldTransformer('causeOfDeathMethod')
          }
        },
        {
          name: 'causeOfDeathCode',
          type: TEXT,
          initialValue: '',
          label: messages.causeOfDeathCode,
          required: false,
          validate: [blockAlphaNumericDot, maxLength(17)],
          mapping: {
            mutation: sectionFieldToBundleFieldTransformer('causeOfDeath'),
            query: bundleFieldToSectionFieldTransformer('causeOfDeath')
          }
        }
      ]
    }
  ]
}
