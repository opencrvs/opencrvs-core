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
import { IDReader } from '.'
import React from 'react'
import { QRReader } from './readers/QRReader/QRReader'

const meta: Meta<typeof IDReader> = {
  title: 'Controls/IDReader',
  component: IDReader
}

export default meta

type Story = StoryObj<typeof IDReader>

const IDReaderWithAlertFeedback = (args: any) => (
  <IDReader
    dividerLabel="Or"
    manualInputInstructionLabel="Complete fields below"
  >
    <QRReader
      labels={{
        button: 'Scan ID QR code',
        scannerDialogSupportingCopy:
          "Place the Notifier's ID card in front of the camera.",
        tutorial: {
          cameraCleanliness: 'Ensure your camera is clean and functional.',
          distance:
            'Hold the device steadily 6-12 inches away from the QR code.',
          lightBalance:
            'Ensure the QR code is well-lit and not damaged or blurry.'
        }
      }}
      onScan={(data) => alert(JSON.stringify(data))}
      onError={(error) => console.error(error)}
    />
  </IDReader>
)

export const IDReaderWithAlertFeedbackStory: Story = {
  render: (args) => <IDReaderWithAlertFeedback {...args} />
}
