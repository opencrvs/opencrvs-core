/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  and,
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  never,
  not,
  or,
  PageTypes
} from '@opencrvs/toolkit/events'
import { COUNTRY_CONFIG_URL } from '@countryconfig/constants'
import { emptyMessage } from '@countryconfig/events/utils'
import { SourceCauseDeathType } from './eventDetails'

const durationOptions = [
  {
    value: 'Minutes',
    label: {
      id: 'unit.minutes',
      defaultMessage: 'Minutes',
      description: 'Minutes'
    }
  },
  {
    value: 'Hours',
    label: {
      id: 'unit.hours',
      defaultMessage: 'Hours',
      description: 'Hours'
    }
  },
  {
    value: 'Days',
    label: {
      id: 'unit.days',
      defaultMessage: 'Days',
      description: 'Days'
    }
  },
  {
    value: 'Weeks',
    label: {
      id: 'unit.weeks',
      defaultMessage: 'Weeks',
      description: 'Weeks'
    }
  },
  {
    value: 'Months',
    label: {
      id: 'unit.months',
      defaultMessage: 'Months',
      description: 'Months'
    }
  },
  {
    value: 'Years',
    label: {
      id: 'unit.years',
      defaultMessage: 'Years',
      description: 'Years'
    }
  }
]

type CauseLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'Other'

const symptomNumber = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight'
] as const

function getLabelForCause(
  letter: CauseLetter,
  index: number,
  basePath: string
) {
  switch (letter) {
    case 'A':
      return {
        defaultMessage: `A.${index + 1}. Direct cause`,
        description: 'This is the label for the field',
        id: `${basePath}.label`
      }
    case 'Other':
      return {
        defaultMessage: `${index + 1}. Antecedent cause`,
        description: 'This is the label for the field',
        id: `${basePath}.label`
      }
    default:
      return {
        defaultMessage: `${letter}.${index + 1}. Antecedent cause`,
        description: 'This is the label for the field',
        id: `${basePath}.label`
      }
  }
}

function createSymptomFields(letter: CauseLetter) {
  return symptomNumber.flatMap((number, index) => {
    const basePath = `causeOfDeathDetails.causeOfDeath${letter}.symptom.${number}`

    const autocompleteField: any = {
      id: basePath,
      type: FieldType.AUTOCOMPLETE,
      analytics: true,
      label: getLabelForCause(letter, index, basePath),
      configuration: {
        url: `${COUNTRY_CONFIG_URL}/causes-of-death?terms=`,
        defaultOptions: [{ label: 'Other', value: 'OTHER' }]
      }
    }

    if (index === 0) {
      autocompleteField.helperText = {
        defaultMessage:
          'Select the condition that most directly led to death, or choose "Other" to enter a diagnosis not listed',
        description: 'This is the label for the field',
        id: `causeOfDeathDetails.causeOfDeath${letter}.symptom.one.helperText`
      }
    }

    if (index > 0) {
      autocompleteField.conditionals = [
        {
          type: ConditionalType.SHOW,
          conditional: field(
            `causeOfDeathDetails.causeOfDeath${letter}.add.symptom.button`
          ).isGreaterThan(index - 1)
        }
      ]
    }

    const otherField = {
      id: `${basePath}.other`,
      type: FieldType.TEXTAREA,
      required: false,
      analytics: true,
      label: {
        defaultMessage:
          'Enter the diagnosis or condition not found in the list above',
        description: 'This is the label for the field',
        id: `${basePath}.other.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field(basePath).get('value').isEqualTo('OTHER')
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must not contain semicolon(s)',
            description: 'This is the label for the field',
            id: 'event.death.action.declare.other.condition.error'
          },
          validator: field(`${basePath}.other`).matches('^[^;]*$')
        }
      ]
    }

    return [autocompleteField, otherField]
  })
}

export function createCauseOfDeathFields(letter: CauseLetter) {
  const base = `causeOfDeathDetails.causeOfDeath${letter}`

  return [
    {
      id: base,
      type: FieldType.HEADING,
      label: {
        defaultMessage:
          letter === 'Other'
            ? 'Part II: Other significant causes'
            : `${letter}. Cause of death`,
        description: 'This is the label for the field',
        id: `${base}.label`
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    ...createSymptomFields(letter),
    {
      id: `${base}.add.symptom.button`,
      type: FieldType.BUTTON,
      hideLabel: true,
      defaultValue: 0,
      label: {
        defaultMessage: 'Add another symptom',
        description: 'This is the label for the field',
        id: `${base}.add.symptom.buttonText`
      },
      configuration: {
        text: {
          defaultMessage: 'Add another cause',
          description: 'This is the label for the field',
          id: `${base}.add.symptom.buttonText`
        },
        buttonType: 'tertiary',
        buttonSize: 'small',
        textColor: 'primary',
        textVariant: 'bold14'
      },
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: and(
            not(field(`${base}.add.symptom.button`).isEqualTo(7)),
            or(
              and(
                field(`${base}.add.symptom.button`).isEqualTo(0),
                not(field(`${base}.symptom.one`).get('value').isFalsy())
              ),
              and(
                field(`${base}.add.symptom.button`).isEqualTo(1),
                not(field(`${base}.symptom.two`).get('value').isFalsy())
              ),
              and(
                field(`${base}.add.symptom.button`).isEqualTo(2),
                not(field(`${base}.symptom.three`).get('value').isFalsy())
              ),
              and(
                field(`${base}.add.symptom.button`).isEqualTo(3),
                not(field(`${base}.symptom.four`).get('value').isFalsy())
              ),
              and(
                field(`${base}.add.symptom.button`).isEqualTo(4),
                not(field(`${base}.symptom.five`).get('value').isFalsy())
              ),
              and(
                field(`${base}.add.symptom.button`).isEqualTo(5),
                not(field(`${base}.symptom.six`).get('value').isFalsy())
              ),
              and(
                field(`${base}.add.symptom.button`).isEqualTo(6),
                not(field(`${base}.symptom.seven`).get('value').isFalsy())
              )
            )
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: `${base}.interval`,
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      analytics: true,
      helperText: {
        defaultMessage: 'Interval between onset and death',
        description: 'This is the label for the field',
        id: `spcCodingGroup.causeOfDeath${letter}.interval.helperText`
      },
      label: {
        defaultMessage: 'Duration',
        description: 'This is the label for the field',
        id: `spcCodingGroup.causeOfDeath${letter}.interval`
      },
      options: durationOptions
    }
  ]
}

const causeOfDeathA = createCauseOfDeathFields('A')
const causeOfDeathB = createCauseOfDeathFields('B')
const causeOfDeathC = createCauseOfDeathFields('C')
const causeOfDeathD = createCauseOfDeathFields('D')
const causeOfDeathE = createCauseOfDeathFields('E')
const otherSignificantSymptoms = createCauseOfDeathFields('Other')

export const causeOfDeathDetails = defineFormPage({
  id: 'causeOfDeathDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Cause of death details',
    description: 'Form section title for event details',
    id: 'form.death.causeOfDeathDetails.title'
  },
  fields: [
    ...causeOfDeathA,
    {
      id: 'causeOfDeathDetails.divider1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    ...causeOfDeathB,
    {
      id: 'causeOfDeathDetails.divider2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    ...causeOfDeathC,
    {
      id: 'causeOfDeathDetails.divider3',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    ...causeOfDeathD,
    {
      id: 'causeOfDeathDetails.divider4',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    ...causeOfDeathE,
    {
      id: 'causeOfDeathDetails.divider5',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    ...otherSignificantSymptoms
  ],
  conditional: and(
    field('eventDetails.causeOfDeathEstablished').isEqualTo(true),
    or(
      field('eventDetails.sourceCauseDeath').isEqualTo(
        SourceCauseDeathType.PHYSICIAN
      ),
      field('eventDetails.sourceCauseDeath').isEqualTo(
        SourceCauseDeathType.MEDICALLY_CERTIFIED
      )
    )
  )
})
