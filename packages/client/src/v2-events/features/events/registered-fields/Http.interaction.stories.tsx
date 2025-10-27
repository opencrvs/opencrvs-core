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

const fetchNidFields: FieldConfig[] = [
  {
    id: 'child.http-fetch',
    type: FieldType.HTTP,
    label: {
      defaultMessage: 'NID for child',
      description: 'NID for child',
      id: 'event.birth.child.nid.label'
    },
    configuration: {
      trigger: field('child.http-button'),
      url: '/api/nid',
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
    id: 'child.http-button',
    type: FieldType.BUTTON,
    label: {
      defaultMessage: 'NID',
      description: 'NID',
      id: 'event.birth.child.nid.label'
    },
    validation: [
      {
        message: {
          defaultMessage: 'Unexpected error while fetching NID',
          description: 'Error message when NID request fails',
          id: 'event.birth.child.nid-fetch-failure'
        },
        validator: field('child.http-fetch').get('error').isFalsy()
      }
    ],
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: and(
          field('child.http-fetch').isUndefined(),
          user.isOnline()
        )
      },
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('child.http-fetch').get('loading').isFalsy(),
          field('child.http-fetch').get('data').isFalsy()
        )
      }
    ],
    configuration: {
      icon: 'IdentificationCard',
      text: {
        defaultMessage: 'Generate NID',
        description: 'Generate NID',
        id: 'event.birth.child.nid.label'
      }
    }
  },
  {
    id: 'child.http-button',
    type: FieldType.BUTTON,
    label: {
      defaultMessage: 'NID',
      description: 'NID',
      id: 'event.birth.child.nid.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      },
      {
        type: ConditionalType.SHOW,
        conditional: field('child.http-fetch').get('loading').isEqualTo(true)
      }
    ],
    configuration: {
      loading: true,
      text: {
        defaultMessage: 'Generating NID...',
        description: 'Generating NID...',
        id: 'event.birth.child.nid-generation.label'
      }
    }
  },
  {
    id: 'child.http-button',
    type: FieldType.BUTTON,
    label: {
      defaultMessage: 'NID',
      description: 'NID',
      id: 'event.birth.child.nid.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      },
      {
        type: ConditionalType.SHOW,
        conditional: not(field('child.http-text').isFalsy())
      }
    ],
    configuration: {
      icon: 'Check',
      text: {
        defaultMessage: 'NID generated',
        description: 'NID generated',
        id: 'event.birth.child.nid-generated.label'
      }
    }
  },
  {
    id: 'child.http-text',
    type: FieldType.TEXT,
    parent: field('child.http-fetch'),
    label: {
      defaultMessage: 'Generate NID',
      description: 'Generate NID',
      id: 'event.birth.child.nid.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('child.http-fetch').get('error').isFalsy()
      },
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      }
    ],
    value: field('child.http-fetch').get('data')
  },
  {
    id: 'child.http-text-manual',
    type: FieldType.TEXT,
    label: {
      defaultMessage: 'Enter NID manually',
      description: 'Enter NID manually',
      id: 'event.birth.child.nid.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          not(field('child.http-fetch').isUndefined()),
          field('child.http-fetch').get('loading').isFalsy(),
          field('child.http-fetch').get('data').isFalsy()
        )
      }
    ]
  }
]

export const FetchNid: StoryObj<typeof FormFieldGenerator> = {
  name: 'Fetch NID - Response with Content-Type: text/plain',
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    msw: {
      handlers: {
        nidApi: [http.post('/api/nid', () => HttpResponse.text('1234567890'))]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /generate nid/i })
    )
    await waitFor(async () => {
      await expect(
        canvas.queryByTestId('text__child____http-text')
      ).toHaveValue('1234567890')
    })
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'child.http-fetch',
            type: FieldType.HTTP,
            label: {
              defaultMessage: 'NID for child',
              description: 'NID for child',
              id: 'event.birth.child.nid.label'
            },
            configuration: {
              trigger: field('child.http-button'),
              url: '/api/nid',
              timeout: 5000,
              method: 'POST',
              headers: {
                'Content-Type': 'text/plain'
              },
              body: {
                user: '$user.province'
              }
            }
          },
          {
            id: 'child.http-button',
            type: FieldType.BUTTON,
            label: {
              defaultMessage: 'NID',
              description: 'NID',
              id: 'event.birth.child.nid.label'
            },
            conditionals: [
              {
                type: ConditionalType.ENABLE,
                conditional: and(
                  field('child.http-fetch').isUndefined(),
                  user.isOnline()
                )
              },
              {
                type: ConditionalType.SHOW,
                conditional: and(
                  field('child.http-fetch').get('loading').isFalsy(),
                  field('child.http-fetch').get('data').isFalsy()
                )
              }
            ],
            configuration: {
              icon: 'IdentificationCard',
              text: {
                defaultMessage: 'Generate NID',
                description: 'Generate NID',
                id: 'event.birth.child.nid.label'
              }
            }
          },
          {
            id: 'child.http-button',
            type: FieldType.BUTTON,
            label: {
              defaultMessage: 'NID',
              description: 'NID',
              id: 'event.birth.child.nid.label'
            },
            conditionals: [
              {
                type: ConditionalType.ENABLE,
                conditional: never()
              },
              {
                type: ConditionalType.SHOW,
                conditional: field('child.http-fetch')
                  .get('loading')
                  .isEqualTo(true)
              }
            ],
            configuration: {
              loading: true,
              text: {
                defaultMessage: 'Generating NID...',
                description: 'Generating NID...',
                id: 'event.birth.child.nid-generation.label'
              }
            }
          },
          {
            id: 'child.http-button',
            type: FieldType.BUTTON,
            label: {
              defaultMessage: 'NID',
              description: 'NID',
              id: 'event.birth.child.nid.label'
            },
            conditionals: [
              {
                type: ConditionalType.ENABLE,
                conditional: never()
              },
              {
                type: ConditionalType.SHOW,
                conditional: not(field('child.http-text').isFalsy())
              }
            ],
            configuration: {
              icon: 'Check',
              text: {
                defaultMessage: 'NID generated',
                description: 'NID generated',
                id: 'event.birth.child.nid-generated.label'
              }
            }
          },
          {
            id: 'child.http-text',
            type: FieldType.TEXT,
            parent: field('child.http-fetch'),
            label: {
              defaultMessage: 'Generate NID',
              description: 'Generate NID',
              id: 'event.birth.child.nid.label'
            },
            conditionals: [
              {
                type: ConditionalType.ENABLE,
                conditional: never()
              }
            ],
            value: field('child.http-fetch').get('data')
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const FetchNidErrors: StoryObj<typeof FormFieldGenerator> = {
  name: 'Fetch NID - Response has errors - can enter NID manually',
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    msw: {
      handlers: {
        nidApi: [
          http.post('/api/nid', () => HttpResponse.json({}, { status: 500 }))
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /generate nid/i })
    )
    await waitFor(async () => {
      await expect(
        canvas.queryByTestId('text__child____http-text-manual')
      ).toBeDefined()
    })
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fetchNidFields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const HttpTextResponseInCopy: StoryObj<typeof Review> = {
  name: 'HTTP data response text to string',
  parameters: {
    layout: 'centered'
  },
  render: function Component() {
    const allFields = fetchNidFields.flat()
    const stringifier = useFormDataStringifier()
    const flattenedIntl = useIntlFormatMessageWithFlattenedParams()

    const FORM_DATA = {
      'child.http-fetch': {
        data: '1234567890',
        loading: false,
        error: null
      }
    }
    return (
      <div>
        <p>
          {flattenedIntl.formatMessage(
            {
              id: 'storybook.http.text.example',
              defaultMessage:
                'This is an example of how HTTP Field type data text responses look like'
            },
            stringifier(allFields, FORM_DATA)
          )}
        </p>
        <pre>{JSON.stringify(stringifier(allFields, FORM_DATA), null, 2)}</pre>
      </div>
    )
  }
}
