import {
  ViewType,
  RADIO_GROUP,
  SELECT_WITH_OPTIONS,
  TEXT,
  ISerializedFormSection
} from '@register/forms'
import { formMessages as messages } from '@register/i18n/messages'
import { conditionals } from '@register/forms/utils'
import { RadioSize } from '@opencrvs/components/lib/forms'

export const causeOfDeathSection: ISerializedFormSection = {
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
            mutation: { operation: 'ignoreFieldTransformer', parameters: [] },
            query: {
              operation: 'hasCaseOfDeathSectionTransformer',
              parameters: []
            }
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
            mutation: {
              operation: 'sectionFieldToBundleFieldTransformer',
              parameters: ['causeOfDeathMethod']
            },
            query: {
              operation: 'bundleFieldToSectionFieldTransformer',
              parameters: ['causeOfDeathMethod']
            }
          }
        },
        {
          name: 'causeOfDeathCode',
          type: TEXT,
          initialValue: '',
          label: messages.causeOfDeathCode,
          required: false,
          validate: [
            { operation: 'blockAlphaNumericDot', parameters: [] },
            { operation: 'maxLength', parameters: [17] }
          ],
          mapping: {
            mutation: {
              operation: 'sectionFieldToBundleFieldTransformer',
              parameters: ['causeOfDeath']
            },
            query: {
              operation: 'bundleFieldToSectionFieldTransformer',
              parameters: ['causeOfDeath']
            }
          }
        }
      ]
    }
  ]
}
