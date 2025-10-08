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
import type { Meta, StoryObj } from '@storybook/react'

import React from 'react'
import { FieldType } from '@opencrvs/commons/client'
import { Box } from '@opencrvs/components'
import { TRPCProvider } from '@client/v2-events/trpc'
import { Output } from './Output'

const meta: Meta<typeof Output> = {
  title: 'Components/Output',
  component: Output,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Box>
          <Story />
        </Box>
      </TRPCProvider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof Output>

export const TextOutput: Story = {
  args: {
    value: 'Cat',
    field: {
      type: FieldType.TEXT,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      }
    }
  }
}

export const TextAreaOutput: Story = {
  args: {
    value:
      'The quick brown fox jumps over the lazy dog while juggling flaming torches and reciting Shakespeare in ancient Latin backwards on a unicycle during a thunderstorm',
    field: {
      type: FieldType.TEXTAREA,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      }
    }
  }
}

export const TextOutputWithoutPreviouslyMissingValueAsChanged: Story = {
  args: {
    value: 'Cat',
    showPreviouslyMissingValuesAsChanged: false,
    field: {
      type: FieldType.TEXT,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      }
    }
  }
}

export const TextOutputWithSamePreviousValue: Story = {
  args: {
    value: 'Cat',
    previousValue: 'Cat',
    field: {
      type: FieldType.TEXT,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      }
    }
  }
}

export const TextOutputWithPreviousValue: Story = {
  args: {
    value: 'CAt',
    previousValue: 'Dog',
    field: {
      type: FieldType.TEXT,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      }
    }
  }
}

export const NumberOutput: Story = {
  args: {
    value: 5,
    field: {
      type: FieldType.NUMBER,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      }
    }
  }
}

export const NumberOutputWithPostfix: Story = {
  args: {
    value: 5,
    field: {
      type: FieldType.NUMBER,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      },
      configuration: {
        postfix: {
          defaultMessage: ' grammes',
          description: 'This is the postfix for the weight field',
          id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.postfix'
        }
      }
    }
  }
}

export const NumberOutputValueUndefinedWithPostfix: Story = {
  args: {
    value: undefined,
    field: {
      type: FieldType.NUMBER,
      id: 'applicant.firstname',
      label: {
        id: 'applicant.firstname',
        defaultMessage: 'First name',
        description: 'The first name of the applicant'
      },
      configuration: {
        postfix: {
          defaultMessage: ' grammes',
          description: 'This is the postfix for the weight field',
          id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.postfix'
        }
      }
    }
  }
}

export const CheckboxOutput: Story = {
  args: {
    value: true,
    previousValue: true,
    field: {
      type: FieldType.CHECKBOX,
      id: 'recommender.none',
      defaultValue: false,
      label: {
        id: 'recommender.none',
        defaultMessage: 'No recommender',
        description: 'No recommender'
      }
    }
  }
}

export const CheckboxOutputWithUndefinedPreviousValue: Story = {
  args: {
    value: true,
    previousValue: undefined,
    field: {
      type: FieldType.CHECKBOX,
      id: 'recommender.none',
      defaultValue: false,
      label: {
        id: 'recommender.none',
        defaultMessage: 'No recommender',
        description: 'No recommender'
      }
    }
  }
}

export const CheckboxOutputChangedFromUndefinedToTrue: Story = {
  args: {
    value: true,
    previousValue: undefined,
    field: {
      type: FieldType.CHECKBOX,
      id: 'recommender.none',
      defaultValue: false,
      label: {
        id: 'recommender.none',
        defaultMessage: 'No recommender',
        description: 'No recommender'
      }
    }
  }
}

export const CheckboxOutputChangedFromTrueToFalse: Story = {
  args: {
    value: false,
    previousValue: true,
    field: {
      type: FieldType.CHECKBOX,
      id: 'recommender.none',
      defaultValue: false,
      label: {
        id: 'recommender.none',
        defaultMessage: 'No recommender',
        description: 'No recommender'
      }
    }
  }
}

export const CheckboxOutputChangedFromFalseToTrue: Story = {
  args: {
    value: true,
    previousValue: false,
    field: {
      type: FieldType.CHECKBOX,
      id: 'recommender.none',
      defaultValue: false,
      label: {
        id: 'recommender.none',
        defaultMessage: 'No recommender',
        description: 'No recommender'
      }
    }
  }
}
