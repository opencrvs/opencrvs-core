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

import { Meta, StoryObj } from '@storybook/react'
import React, { useEffect, useState } from 'react'
import { fn } from '@storybook/test'
import styled from 'styled-components'
import QRCode from 'qrcode'
import { config } from 'localforage'
import {
  ConditionalType,
  field,
  FieldType,
  never,
  TestUserRole
} from '@opencrvs/commons/client'
import { Stack, Text } from '@opencrvs/components'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { getTestValidatorContext } from '../../../../../.storybook/decorators'

const StyledImg = styled.img`
  width: 300px;
`

interface Args {
  onChange: (data: unknown) => void
}

const meta: Meta<Args> = {
  title: 'Inputs/IdReader',
  argTypes: {},
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

function QRCodeGenerator({ content }: { content: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    if (!content) {
      return
    }

    void QRCode.toDataURL(content, { width: 300, margin: 2 }).then((url) =>
      setQrCodeUrl(url)
    )
  }, [content])

  return (
    <div>
      {qrCodeUrl ? (
        <StyledImg alt="QR Code" src={qrCodeUrl} />
      ) : (
        <Text element="p" variant="reg16">
          {'Generating QR code...'}
        </Text>
      )}
    </div>
  )
}

const fieldsWithQrReader = [
  {
    id: 'id-reader',
    type: FieldType.ID_READER,
    label: {
      id: 'events.id-reader.label',
      defaultMessage: 'ID Reader',
      description: 'Label for the ID reader'
    },
    methods: [
      {
        id: 'id-reader.qr',
        label: {
          id: 'events.qr-reader.label',
          defaultMessage: 'QR Reader',
          description: 'Label for the QR reader'
        },
        type: FieldType.QR_READER
      }
    ]
  },
  {
    id: 'name',
    type: FieldType.NAME,
    parent: field('id-reader'),
    label: {
      id: 'events.name.label',
      defaultMessage: 'Fields',
      description: 'Label for the name'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      }
    ],
    value: field('id-reader').get('name')
  }
]

const fieldsWithQrReaderAndLinkButton = [
  {
    id: 'id-reader',
    type: FieldType.ID_READER,
    label: {
      id: 'events.id-reader.label',
      defaultMessage: 'ID Reader',
      description: 'Label for the ID reader'
    },
    methods: [
      {
        id: 'id-reader.qr',
        label: {
          id: 'events.qr-reader.label',
          defaultMessage: 'QR Reader',
          description: 'Label for the QR reader'
        },
        type: FieldType.QR_READER
      },
      {
        id: 'id-reader.link',
        label: {
          id: 'events.link-button.label',
          defaultMessage: 'Link Button',
          description: 'Label for the link button'
        },
        type: FieldType.LINK_BUTTON,
        configuration: {
          url: 'https://opencrvs.org',
          text: {
            id: 'events.link-button.label',
            defaultMessage: 'Link Button',
            description: 'Label for the link button'
          }
        }
      }
    ]
  },
  {
    id: 'name',
    type: FieldType.NAME,
    parent: field('id-reader'),
    label: {
      id: 'events.name.label',
      defaultMessage: 'Fields',
      description: 'Label for the name'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      }
    ],
    value: field('id-reader').get('name')
  },
  {
    id: 'name',
    type: FieldType.NAME,
    parent: field('id-reader'),
    label: {
      id: 'events.name.label',
      defaultMessage: 'Fields',
      description: 'Label for the name'
    },
    conditionals: [
      {
        type: ConditionalType.ENABLE,
        conditional: never()
      },
      {
        type: ConditionalType.SHOW,
        conditional: field('id-reader').get('name').isEqualTo('John Doe')
      }
    ],
    value: field('id-reader').get('name')
  }
]

const onChangeSpy = fn()

export const WithQrReader: StoryObj<Args> = {
  name: 'With QR Reader',
  render: ({ onChange }) => {
    return (
      <Stack direction="column">
        <Text element="h2" variant="h2">
          {'Scan below QR code to fill the form'}
        </Text>
        <Stack>
          <QRCodeGenerator
            content={JSON.stringify({
              name: { firstname: 'John', surname: 'Doe' }
            })}
          />
          <FormFieldGenerator
            fields={fieldsWithQrReader}
            id="id-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.LOCAL_REGISTRAR
            )}
            onChange={onChange}
          />
        </Stack>
      </Stack>
    )
  },
  args: {
    onChange: onChangeSpy
  }
}

export const WithQrReaderAndLinkButton: StoryObj<Args> = {
  name: 'With QR Reader & Link Button',
  render: ({ onChange }) => {
    return (
      <Stack direction="column">
        <Text element="h2" variant="h2">
          {'Scan below QR code to fill the form'}
        </Text>
        <Stack>
          <QRCodeGenerator
            content={JSON.stringify({
              name: { firstname: 'John', surname: 'Doe' }
            })}
          />
          <FormFieldGenerator
            fields={fieldsWithQrReaderAndLinkButton}
            id="id-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.LOCAL_REGISTRAR
            )}
            onChange={onChange}
          />
        </Stack>
      </Stack>
    )
  },
  args: {
    onChange: onChangeSpy
  }
}
