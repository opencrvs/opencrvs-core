import {
  IFormSection,
  ViewType,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  TEXT
} from '@register/forms'
import { formMessages as messages } from '@register/i18n/messages'
import { maxLength, blockAlphaNumericDot } from '@register/utils/validate'
import { conditionals } from '@register/forms/utils'
import {
  sectionFieldToBundleFieldTransformer,
  ignoreFieldTransformer
} from '@register/forms/mappings/mutation/field-mappings'
import { bundleFieldToSectionFieldTransformer } from '@register/forms/mappings/query/field-mappings'
import { hasCaseOfDeathSectionTransformer } from '@register/forms/register/fieldDefinitions/death/mappings/query/cause-of-death-mappings'
import { RadioSize } from '@opencrvs/components/lib/forms'

export const causeOfDeathSection: IFormSection = {
  id: 'causeOfDeath',
  viewType: 'form' as ViewType,
  name: messages.causeOfDeathName,
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
          initialValue: '',
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
