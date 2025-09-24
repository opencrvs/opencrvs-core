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
  user
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

interface Args {
  onChange: (val: unknown) => void
}

const meta: Meta<Args> = {
  title: 'Inputs/Http',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export const FetchNid: StoryObj<typeof FormFieldGenerator> = {
  name: 'Fetch NID',
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
