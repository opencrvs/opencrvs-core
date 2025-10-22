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
import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import { http, HttpResponse } from 'msw'
import { fn, expect, within } from '@storybook/test'
import { waitFor } from '@storybook/testing-library'
import { useSearchParams } from 'react-router-dom'
import {
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  never
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '../../../components/forms/FormFieldGenerator'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

interface Args {
  fields: FieldConfig[]
  onChange: (value: unknown) => void
}

const meta: Meta<Args> = {
  title: 'Inputs/QueryParamReader',
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

const defaultFields: FieldConfig[] = [
  {
    id: 'applicant.query-param-reader',
    type: FieldType.QUERY_PARAM_READER,
    label: {
      id: 'event.query-param-reader.label',
      defaultMessage: 'Query param reader',
      description: 'This is the label for the query param reader field'
    },
    configuration: {
      pickParams: ['auth_token', 'client_session']
    }
  },
  {
    id: 'applicant.http-fetch',
    type: FieldType.HTTP,
    label: {
      defaultMessage: 'Fetch applicant information',
      description: 'Fetch applicant information',
      id: 'applicant.http-fetch.label'
    },
    configuration: {
      trigger: field('applicant.query-param-reader'),
      url: '/api/user-info',
      timeout: 5000,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  },
  {
    id: 'applicant.firstname',
    type: FieldType.TEXT,
    parent: field('applicant.http-fetch'),
    label: {
      defaultMessage: 'First name',
      description: 'First name label',
      id: 'applicant.firstname.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      }
    ],
    value: field('applicant.http-fetch').get('data.firstName')
  },
  {
    id: 'applicant.familyName',
    type: FieldType.TEXT,
    parent: field('applicant.http-fetch'),
    label: {
      defaultMessage: 'Surname',
      description: 'Family name label',
      id: 'applicant.familyName.label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      }
    ],
    value: field('applicant.http-fetch').get('data.familyName')
  }
]

const testQueryParamReader = {
  id: 'test.query-param-reader',
  type: FieldType.QUERY_PARAM_READER,
  label: {
    id: 'event.query-param-reader.label',
    defaultMessage: 'Query param reader',
    description: 'This is the label for the query param reader field'
  },
  configuration: {
    pickParams: ['auth_token', 'client_session']
  }
}

const testHttpFetch = {
  id: 'test.http-fetch',
  type: FieldType.HTTP,
  label: {
    defaultMessage: 'Fetch test information',
    description: 'Fetch test information',
    id: 'test.http-fetch.label'
  },
  configuration: {
    trigger: field('test.query-param-reader'),
    url: '/api/test',
    timeout: 5000,
    method: 'GET' as const,
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      token: field('test.query-param-reader').get('auth_token'),
      session: field('test.query-param-reader').get('client_session')
    }
  }
}

const tokenTextField = {
  id: 'test.token',
  type: FieldType.TEXT,
  parent: field('test.http-fetch'),
  label: {
    defaultMessage: 'Token',
    description: 'Token label',
    id: 'token.label'
  },
  conditionals: [
    {
      type: ConditionalType.ENABLE,
      conditional: never()
    }
  ],
  value: field('test.http-fetch').get('data.token')
}

const sessionTextField = {
  id: 'test.session',
  type: FieldType.TEXT,
  parent: field('test.http-fetch'),
  label: {
    defaultMessage: 'Session',
    description: 'Session label',
    id: 'session.label'
  },
  conditionals: [
    {
      type: ConditionalType.ENABLE,
      conditional: never()
    }
  ],
  value: field('test.http-fetch').get('data.session')
}

const forwardedParams: FieldConfig[] = [
  testQueryParamReader,
  testHttpFetch,
  tokenTextField,
  sessionTextField
]

function Form(args: Args) {
  return (
    <FormFieldGenerator
      fields={args.fields}
      id="test-event-form"
      validatorContext={getTestValidatorContext()}
      onChange={args.onChange}
    />
  )
}

export const Default: StoryObj<Args> = {
  name: 'Default',
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/',
        element: <Form fields={defaultFields} onChange={fn()} />
      },
      initialPath: '/?auth_token=123&client_session=abc'
    },
    msw: {
      handlers: {
        userInfoApi: [
          http.get('/api/user-info', () =>
            HttpResponse.json({ firstName: 'John', familyName: 'Doe' })
          )
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('firstname and surname are populated from api', async () => {
      await waitFor(async () => {
        await expect(
          canvas.queryByTestId('text__applicant____firstname')
        ).toHaveValue('John')
        await expect(
          canvas.queryByTestId('text__applicant____familyName')
        ).toHaveValue('Doe')
      })
    })
  }
}

export const WithForwardedParams: StoryObj<Args> = {
  name: 'With Forwarded Params',
  parameters: {
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/',
        element: <Form fields={forwardedParams} onChange={fn()} />
      },
      initialPath: '/?auth_token=123&client_session=abc'
    },
    msw: {
      handlers: {
        userInfoApi: [
          http.get('/api/test', ({ request }) =>
            HttpResponse.json(
              Object.fromEntries(new URL(request.url).searchParams)
            )
          )
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('token and session are populated from api', async () => {
      await waitFor(async () => {
        await expect(canvas.queryByTestId('text__test____token')).toHaveValue(
          '123'
        )
        await expect(canvas.queryByTestId('text__test____session')).toHaveValue(
          'abc'
        )
      })
    })
  }
}

function DebugLocation() {
  const [searchParams] = useSearchParams()
  return (
    <span data-testid="current-params" style={{ display: 'none' }}>
      {searchParams.toString()}
    </span>
  )
}

export const WithExtraUnpickedParameters: StoryObj<Args> = {
  name: 'With Extra Unpicked Parameters',
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/',
        element: (
          <>
            <DebugLocation />
            <Form fields={defaultFields} onChange={fn()} />
          </>
        )
      },
      initialPath:
        '/?auth_token=123&client_session=abc&from=page1&ref=ad_campaign'
    },
    msw: {
      handlers: {
        userInfoApi: [
          http.get('/api/user-info', () =>
            HttpResponse.json({ firstName: 'John', familyName: 'Doe' })
          )
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('firstname and surname are populated from api', async () => {
      await waitFor(async () => {
        await expect(
          canvas.queryByTestId('text__applicant____firstname')
        ).toHaveValue('John')
        await expect(
          canvas.queryByTestId('text__applicant____familyName')
        ).toHaveValue('Doe')
      })
    })
    await step('unpicked query params remain in the URL', async () => {
      const params = await canvas.findByTestId('current-params')
      await expect(params).toHaveTextContent('from=page1&ref=ad_campaign')
    })
  }
}
