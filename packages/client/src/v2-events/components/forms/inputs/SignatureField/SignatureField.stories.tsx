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
import { FileFieldValue } from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { noop } from '@client/v2-events'
import { SignatureField } from './SignatureField'

const meta: Meta<typeof SignatureField> = {
  title: 'Inputs/SignatureField',
  args: {},
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ],
  parameters: {
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <SignatureField
            maxFileSize={5 * 1024 * 1024}
            modalTitle={'Upload Signature'}
            name={'Upload Signature'}
            onChange={() => noop()}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
  }
}

export default meta

export const EmptySignatureField: StoryObj<typeof SignatureField> = {
  args: {}
}
