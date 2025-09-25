// PrintButton.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import styled from 'styled-components'
import { Button as UI_Button, Icon as UI_Icon } from '@opencrvs/components'

interface PrintButtonProps {
  id: string
  template: string
  buttonLabel?: { id: string; defaultMessage: string }
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`

// Minimal in-story "mock" of PrintButton.Input to avoid calling app hooks
function MockPrintButton({
  id,
  buttonLabel,
  disabled,
  template,
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

  // Try to use your UI Button if available, otherwise a native button
  if (UI_Button && UI_Icon) {
    return (
      <UI_Button
        disabled={disabled || alreadyPrinted}
        id={id}
        size="medium"
        type="secondary"
        onClick={handlePrint}
      >
        <UI_Icon name="Printer" />
        {label}
      </UI_Button>
    )
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
      🖨 {label}
    </button>
  )
}

const meta: Meta<typeof MockPrintButton> = {
  title: 'Inputs/PrintButton (mocked story)',
  component: MockPrintButton,
  parameters: { layout: 'centered' }
}
export default meta
type Story = StoryObj<typeof MockPrintButton>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | undefined>(undefined)
    return (
      <Container>
        <MockPrintButton
          {...(args as any)}
          value={value}
          onChange={(val) => {
            setValue(val)
            ;(args as any).onChange?.(val)
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
    onChange: () => {}
  }
}
