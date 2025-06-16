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
import { TRPCProvider } from '@client/v2-events/trpc'
import { getUnsignedFileUrl } from '@client/v2-events/cache'
import { DocumentViewer } from './DocumentViewer'

const meta: Meta<typeof DocumentViewer> = {
  title: 'Inputs/DocumentViewer',
  component: DocumentViewer,
  args: {},
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

export const EmptyDocumentViewer: StoryObj<typeof DocumentViewer> = {
  name: 'Empty Document Viewer',
  args: {
    options: []
  }
}

export const DocumentViewerSingleOption: StoryObj<typeof DocumentViewer> = {
  name: 'Document Viewer, Single Option',
  args: {
    options: [
      {
        value: {
          filename: 'fish.svg',
          url: getUnsignedFileUrl('fish.svg'),
          id: '1'
        },
        label: 'Option 1'
      }
    ]
  }
}
