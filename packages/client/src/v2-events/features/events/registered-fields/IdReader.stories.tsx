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
import {
  ConditionalType,
  field,
  FieldType,
  never
} from '@opencrvs/commons/client'
import { Stack, Text } from '@opencrvs/components'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'

const StyledImg = styled.img`
  width: 300px;
`

interface Args {
  onScan: (data: unknown) => void
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

export const Default: StoryObj<Args> = {
  name: 'Default Demo',
  render: () => {
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
            fields={[
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
            ]}
            id="id-form"
            onChange={fn()}
          />
        </Stack>
      </Stack>
    )
  }
}
