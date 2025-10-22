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

import { Decorator, Meta, StoryObj } from '@storybook/react'
import { fn, expect, waitFor } from '@storybook/test'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { http, HttpResponse } from 'msw'
import { useNavigate } from 'react-router-dom'
import { within, userEvent } from '@storybook/testing-library'
import { noop } from 'lodash'
import {
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  never,
  not
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { withValidatorContext } from '../../../../../.storybook/decorators'

interface HTMLMediaElementWithCaptureStream extends HTMLVideoElement {
  captureStream(fps: number): MediaStream
}

async function makeStreamFromVideo(src: string): Promise<MediaStream> {
  const v = document.createElement('video') as HTMLMediaElementWithCaptureStream
  v.src = src
  v.crossOrigin = 'anonymous'
  v.muted = true
  v.loop = true
  v.playsInline = true
  await v.play().catch(noop)
  if (v.readyState < 2) {
    await new Promise<void>((r) => (v.oncanplay = () => r()))
  }
  return v.captureStream(30)
}

function mockCamera(src: string): Decorator {
  return (Story, ctx) => {
    const original = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(navigator as any).mediaDevices ??= {}
    ;(navigator.mediaDevices as MediaDevices).getUserMedia = async () =>
      makeStreamFromVideo(src)

    ctx.cleanup?.(() => {
      ;(navigator.mediaDevices as MediaDevices).getUserMedia = original
    })

    return <Story />
  }
}

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/IdReader/Interaction',
  args: { onChange: fn() },
  decorators: [
    mockCamera('/assets/qr-sample.webm'),
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
  width: 600px;
  padding: 1rem;
`

const fields = [
  {
    id: `storybook.query-params`,
    type: FieldType.QUERY_PARAM_READER,
    label: {
      id: 'form.query-params.label',
      defaultMessage: 'Query param reader',
      description:
        'This is the label for the query param reader field - usually this is hidden'
    },
    configuration: {
      pickParams: ['nid-reverse']
    }
  },
  {
    id: 'storybook.verify-nid-http-fetch',
    type: FieldType.HTTP,
    label: {
      id: 'storybook.verify-nid-http-fetch.label',
      defaultMessage: 'Fetch individual information',
      description: 'This is the label for fetch individual information field'
    },
    configuration: {
      trigger: field(`storybook.query-params`),
      url: '/api/nid',
      timeout: 5000,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        nidReverse: field(`storybook.query-params`).get('nid-reverse')
      },
      errorValue: {
        verificationStatus: 'failed'
      }
    }
  },
  {
    id: `storybook.verify-nid-http-fetch-loader`,
    type: FieldType.LOADER,
    parent: field(`storybook.verify-nid-http-fetch`),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: not(
          field(`storybook.verify-nid-http-fetch`).get('loading').isFalsy()
        )
      }
    ],
    label: {
      id: 'form.fetch-loader.label',
      defaultMessage: "Fetching individual's information...",
      description:
        'This is the label for the fetch individual information loader'
    },
    configuration: {
      text: {
        id: 'form.fetch-loader.label',
        defaultMessage: "Fetching individual's information...",
        description:
          'This is the label for the fetch individual information loader'
      }
    }
  },
  {
    id: 'storybook.id-reader',
    type: FieldType.ID_READER,
    label: {
      id: 'storybook.id-reader.label',
      defaultMessage: 'ID Reader',
      description: 'ID Reader label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field(`storybook.verify-nid-http-fetch`).get('loading').isFalsy(),
          field(`storybook.verify-nid-http-fetch`).get('data').isFalsy()
        )
      }
    ],
    methods: [
      {
        id: 'storybook.qr-reader',
        type: FieldType.QR_READER,
        label: {
          id: 'storybook.qr-reader.label',
          defaultMessage: 'Scan QR code',
          description: 'This is the label for the field'
        }
      },
      {
        id: 'storybook.authentication',
        type: FieldType.LINK_BUTTON,
        label: {
          id: 'storybook.authentication.label',
          defaultMessage: 'Use authentication',
          description: 'This is the label for the field'
        },
        configuration: {
          icon: 'Globe',
          url: 'https://fake-auth-service.opencrvs.org',
          text: {
            id: 'storybook.authentication.button.label',
            defaultMessage: 'Authenticate online',
            description: 'The title for the authentication button'
          }
        }
      }
    ]
  },
  {
    id: 'storybook.verified',
    type: FieldType.VERIFICATION_STATUS,
    parent: [
      field('storybook.verify-nid-http-fetch'),
      field('storybook.id-reader')
    ],
    label: {
      id: 'storybook.verified.status',
      defaultMessage: 'Verification Status',
      description: 'Status field label'
    },
    configuration: {
      status: {
        id: 'storybook.verified.status.text',
        defaultMessage:
          '{value, select, authenticated {ID Authenticated} verified {ID Verified} failed {Unverified ID} pending {Pending verification} other {Invalid value}}',
        description:
          'Status text shown on the pill on both form declaration and review page'
      },
      description: {
        id: 'storybook.verified.status.description',
        defaultMessage:
          "{value, select, authenticated {This identity has been successfully authenticated with the Farajaland’s National ID System. To make edits, please remove the authentication first.} verified {This identity data has been successfully verified with the Farajaland’s National ID System. Please note that their identity has not been authenticated using the individual's biometrics. To make edits, please remove the verification first.} pending {Identity pending verification with Farajaland’s National ID system} failed {The identity data does not match an entry in Farajaland’s National ID System} other {Invalid value}}",
        description: 'Description text of the status'
      }
    },
    value: field(`storybook.verify-nid-http-fetch`).get(
      'data.verificationStatus'
    )
  },
  {
    parent: [
      field('storybook.id-reader'),
      field('storybook.verify-nid-http-fetch')
    ],
    id: 'storybook.nid',
    type: FieldType.TEXT,
    value: [
      field('storybook.id-reader').get('data.nid'),
      field('storybook.verify-nid-http-fetch').get('data.nid')
    ],
    label: {
      id: 'storybook.nid.label',
      defaultMessage: 'National ID',
      description: 'National ID label'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      }
    ]
  }
] as const satisfies FieldConfig[]

export const AuthenticationFlow: StoryObj<typeof FormFieldGenerator> = {
  name: 'Authentication flow',
  parameters: {
    layout: 'centered',
    msw: {
      handlers: {
        nidApi: [
          http.post('/api/nid', async ({ request }) => {
            const url = new URL(request.url)
            const nidReverse = url.searchParams.get('nidReverse')

            await new Promise((resolve) => setTimeout(resolve, 1000))

            return HttpResponse.json({
              nid: nidReverse?.split('').toReversed().join(''),
              verificationStatus: 'authenticated'
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup({ document: canvasElement.ownerDocument })

    await step('Renders ID Reader', async () => {
      await canvas.findByText('Scan QR code')
      await canvas.findByText('Authenticate online')
    })

    await step('No NID field populated', async () => {
      await expect(canvas.queryByTestId('text__storybook____nid')).toHaveValue(
        ''
      )
    })

    await step('Click on authentication link button', async () => {
      const linkButton = await canvas.findByRole('link', {
        name: 'Authenticate online'
      })
      await user.click(linkButton)
    })

    await step('Spinner shown', async () => {
      await canvas.findByText("Fetching individual's information...")
    })

    await step('ID Authenticated shown', async () => {
      await canvas.findByText('ID Authenticated', {}, { timeout: 2000 })
    })

    await step('NID field populated', async () => {
      const nidField = await canvas.findByTestId('text__storybook____nid')
      await waitFor(async () => expect(nidField).toHaveValue('0987654321'))
    })

    await step('Revocation clears NID field', async () => {
      const revokeButton = await canvas.findByRole('button', {
        name: 'Revoke'
      })
      await user.click(revokeButton)

      const continueButton = await canvas.findByRole('button', {
        name: 'Continue'
      })
      await user.click(continueButton)

      const nidField = await canvas.findByTestId('text__storybook____nid')
      await waitFor(async () => expect(nidField).toHaveValue(''))
    })
  },
  render: function Component(args) {
    const navigate = useNavigate()

    // mock <a> clicks to simulate redirect to authentication service (e.g. E-Signet) and back
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a[href]')
        if (!target) {
          return
        }

        const href = target.getAttribute('href')

        if (href?.startsWith('https://fake-auth-service.opencrvs.org')) {
          e.preventDefault()
          navigate('/?nid-reverse=1234567890')
        }
      }

      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }, [navigate])

    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const QrReaderFlow: StoryObj<typeof FormFieldGenerator> = {
  name: 'QR Reader flow',
  parameters: {
    layout: 'centered'
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const user = userEvent.setup({ document: canvasElement.ownerDocument })

    await step('Renders ID Reader', async () => {
      await canvas.findByText('Scan QR code')
      await canvas.findByText('Authenticate online')
    })

    await step('No NID field populated', async () => {
      await expect(canvas.queryByTestId('text__storybook____nid')).toHaveValue(
        ''
      )

      // warm-up the QR Scanner engine - it takes a bit of time to load
      await new Promise((r) => setTimeout(r, 100))
    })

    await step('Click on QR scan button', async () => {
      const linkButton = await canvas.findByRole('button', {
        name: 'Scan QR code'
      })
      await user.click(linkButton)
    })

    await step('Wait for QR scanner to load and inject mock QR', async () => {
      await canvas.findByText('Ensure your camera is clean and functional.')
    })

    await step('NID field populated', async () => {
      const nidField = await canvas.findByTestId('text__storybook____nid')
      await waitFor(async () => expect(nidField).toHaveValue('1234567890'))
    })
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={fields}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}
