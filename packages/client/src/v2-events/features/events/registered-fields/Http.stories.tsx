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
import { fn, userEvent, within, expect, waitFor } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { http, HttpResponse } from 'msw'
import {
  and,
  not,
  field,
  FieldType,
  ConditionalType,
  never,
  user,
  FieldConfig
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { useFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withValidatorContext } from '../../../../../.storybook/decorators'
import { Review } from '../components/Review'

interface Args {
  onChange: (val: unknown) => void
}

const meta: Meta<Args> = {
  title: 'Inputs/Http',
  args: { onChange: fn() },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

const fetchBrnFields: FieldConfig[] = [
  {
    id: 'groom.http-fetch',
    type: FieldType.HTTP,
    label: {
      defaultMessage: 'BRN for groom',
      description: 'BRN for groom',
      id: 'event.marriage.groom.brn.label'
    },
    configuration: {
      trigger: field('groom.http-button'),
      url: '/api/brn',
      timeout: 5000,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        user: '$user.province'
      }
    }
  },
  {
    id: 'groom.http-button',
    type: FieldType.BUTTON,
    label: {
      defaultMessage: 'BRN',
      description: 'BRN',
      id: 'event.marriage.groom.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: and(
          field('groom.http-fetch').isUndefined(),
          user.isOnline()
        )
      },
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('groom.http-fetch').get('loading').isFalsy(),
          field('groom.http-fetch').get('data').isFalsy()
        )
      }
    ],
    configuration: {
      icon: 'IdentificationCard',
      text: {
        defaultMessage: 'Fetch BRN',
        description: 'Fetch BRN',
        id: 'event.marriage.groom.brn.label'
      }
    }
  },
  {
    id: 'groom.http-button',
    type: FieldType.BUTTON,
    label: {
      defaultMessage: 'BRN',
      description: 'BRN',
      id: 'event.marriage.groom.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      },
      {
        type: ConditionalType.SHOW,
        conditional: field('groom.http-fetch').get('loading').isEqualTo(true)
      }
    ],
    configuration: {
      loading: true,
      text: {
        defaultMessage: 'Fetching BRN...',
        description: 'Fetching BRN...',
        id: 'event.marriage.groom.brn-fetching.label'
      }
    }
  },
  {
    id: 'groom.http-button',
    type: FieldType.BUTTON,
    label: {
      defaultMessage: 'BRN',
      description: 'BRN',
      id: 'event.marriage.groom.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      },
      {
        type: ConditionalType.SHOW,
        conditional: not(field('groom.brn').isFalsy())
      }
    ],
    configuration: {
      icon: 'Check',
      text: {
        defaultMessage: 'BRN fetched',
        description: 'BRN fetched',
        id: 'event.marriage.groom.brn-fetched.label'
      }
    }
  },
  {
    id: 'groom.brn',
    type: FieldType.TEXT,
    parent: field('groom.http-fetch'),
    label: {
      defaultMessage: 'Fetch BRN',
      description: 'Fetch BRN',
      id: 'event.marriage.groom.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      }
    ],
    value: field('groom.http-fetch').get('data.brn')
  }
]

export const FetchBrn: StoryObj<typeof FormFieldGenerator> = {
  name: 'Fetch BRN - Response with a Content-Type: application/json',
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    msw: {
      handlers: {
        brnApi: [
          http.post('/api/brn', () => HttpResponse.json({ brn: 'BRN-123456' }))
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /fetch brn/i })
    )
    await waitFor(async () => {
      await expect(canvas.queryByTestId('text__groom____brn')).toHaveValue(
        'BRN-123456'
      )
    })
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fetchBrnFields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const HttpJsonResponseInCopy: StoryObj<typeof Review> = {
  name: 'HTTP data response JSON to string',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    const allFields = fetchBrnFields.flat()
    const stringifier = useFormDataStringifier()
    const flattenedIntl = useIntlFormatMessageWithFlattenedParams()
    const FORM_DATA = {
      'groom.http-fetch': {
        data: { brn: 'BRN-123456' },
        loading: false,
        error: null
      }
    }
    return (
      <div>
        <p>
          {flattenedIntl.formatMessage(
            {
              id: 'storybook.http.json.example',
              defaultMessage:
                'This is an example of how HTTP Field type data JSON responses look like'
            },
            stringifier(allFields, FORM_DATA)
          )}
        </p>
        <pre>{JSON.stringify(stringifier(allFields, FORM_DATA), null, 2)}</pre>
      </div>
    )
  }
}
