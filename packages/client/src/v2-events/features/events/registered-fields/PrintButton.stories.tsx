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
import React, { useState } from 'react'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import styled from 'styled-components'
import { action } from '@storybook/addon-actions'

interface PrintButtonProps {
  id: string
  template: string
  buttonLabel?: { id: string; defaultMessage: string }
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
}

const Container = styled.div`
  width: 400px;
  margin: 0 auto;
`

function MockPrintButton({
  id,
  buttonLabel,
  disabled,
  template = 'v2-birth-certificate',
  value,
  onChange
}: PrintButtonProps) {
  const addedButtonLabel = { id: 'print.certificate', defaultMessage: 'Print' }
  const label = buttonLabel?.defaultMessage ?? addedButtonLabel.defaultMessage
  const alreadyPrinted = Boolean(value)

  const handlePrint = () => {
    onChange?.(new Date().toISOString())
    alert('Simulated print (in a real run, this would open the prepared PDF).')
  }

  return (
    <button
      disabled={disabled || alreadyPrinted}
      id={id}
      style={{
        padding: '8px 14px',
        borderRadius: 6,
        cursor: disabled || alreadyPrinted ? 'not-allowed' : 'pointer'
      }}
      onClick={handlePrint}
    >
      {label}
    </button>
  )
}

const meta: Meta<typeof MockPrintButton> = {
  title: 'Inputs/PrintButton',
  component: MockPrintButton,
  parameters: { layout: 'centered' }
}
export default meta
type Story = StoryObj<typeof MockPrintButton>

export const Default: Story = {
  render: (args: Story['args']) => {
    const [value, setValue] = useState<string | undefined>(undefined)
    return (
      <Container>
        <MockPrintButton
          {...(args as PrintButtonProps)}
          value={value}
          onChange={(val) => {
            setValue(val)
            args?.onChange?.(val)
          }}
        />
      </Container>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = await canvas.findByRole('button', { name: /print/i })
    await expect(button).toBeEnabled()
    await userEvent.click(button)
    await waitFor(async () => expect(button).toBeDisabled())
  },
  args: {
    id: 'print-certificate',
    template: 'v2-birth-certificate',
    buttonLabel: {
      id: 'print.certificate',
      defaultMessage: 'Print'
    },
    disabled: false,
    onChange: action('onChange')
  }
}
