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
import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { within, expect, fireEvent } from 'storybook/test'
import { userEvent } from 'storybook/test'
import { SearchableSelect } from './SearchableSelect'

const meta: Meta<typeof SearchableSelect> = {
  title: 'SearchableSelect/Interaction',
  component: SearchableSelect
}

export default meta

export const SearchOptions: StoryObj<typeof SearchableSelect> = {
  args: {
    options: [
      {
        label: 'Option 1',
        value: 'option1'
      },
      {
        label: 'Option 2',
        value: 'option2'
      },
      {
        label: 'Option 3',
        value: 'option3'
      }
    ],
    'data-testid': 'ordinary-select',
    id: 'select-field'
  },
  render(args) {
    return (
      <div>
        <label htmlFor={args.id}>{'Search'}</label>
        <SearchableSelect {...args} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const searchInput = await canvas.findByLabelText('Search')
    await userEvent.click(await canvas.findByLabelText('Search'))
    await canvas.findByText('Option 1')
    await canvas.findByText('Option 2')
    await canvas.findByText('Option 3')

    await userEvent.type(searchInput, '3')

    await expect(canvas.queryByText('Option 1')).toBeNull()
    await expect(canvas.queryByText('Option 2')).toBeNull()
    await userEvent.click(await canvas.findByText('Option 3'))
  }
}

export const ClearSelectedOption: StoryObj<typeof SearchableSelect> = {
  name: 'Selected value can be removed with the clear indicator',
  args: {
    options: [
      {
        label: 'Central',
        value: 'central'
      },
      {
        label: 'Sulaka',
        value: 'sulaka'
      }
    ],
    'data-testid': 'clearable-searchable-select',
    id: 'clearable-select-field'
  },
  render: function Component(args) {
    const [value, setValue] =
      React.useState<React.ComponentProps<typeof SearchableSelect>['value']>(
        null
      )

    return (
      <div>
        <label htmlFor={args.id}>{'Province'}</label>
        <SearchableSelect {...args} value={value} onChange={setValue} />
        <div data-testid="searchable-select-value-output">
          {JSON.stringify(value?.value ?? null)}
        </div>
      </div>
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Nothing is selected, so there is nothing to clear',
      async () => {
        await expect(
          canvasElement.querySelector('.react-select__clear-indicator')
        ).toBeNull()
      }
    )

    await step('Selecting an option reveals the clear indicator', async () => {
      await userEvent.click(await canvas.findByLabelText('Province'))
      await userEvent.click(await canvas.findByText('Sulaka'))

      await expect(
        await canvas.findByTestId('searchable-select-value-output')
      ).toHaveTextContent('"sulaka"')
      await expect(
        canvasElement.querySelector('.react-select__clear-indicator')
      ).not.toBeNull()
    })

    await step('Clicking the clear indicator removes the value', async () => {
      const clearIndicator = canvasElement.querySelector(
        '.react-select__clear-indicator'
      )
      // react-select handles clearing on mousedown rather than click
      await fireEvent.mouseDown(clearIndicator as Element)

      await expect(
        await canvas.findByTestId('searchable-select-value-output')
      ).toHaveTextContent('null')
    })
  }
}

const dynamicOptions = Array.from({ length: 1000 }).map((_, index) => ({
  label: `Option ${index + 1}`,
  value: `option${index + 1}`
}))

export const VirtualzedOptions: StoryObj<typeof SearchableSelect> = {
  args: {
    options: dynamicOptions,
    'data-testid': 'virtualized-select',
    id: 'virtualized-select-field'
  },
  render(args) {
    return (
      <div>
        <label htmlFor={args.id}>{'Virtualized Select'}</label>
        <SearchableSelect {...args} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const searchInput = await canvas.findByLabelText('Virtualized Select')
    await userEvent.click(await canvas.findByLabelText('Virtualized Select'))

    await canvas.findByText('Option 1')
    await canvas.findByText('Option 50')
    await expect(canvas.queryByText('Option 51')).toBeNull()

    await userEvent.type(searchInput, 'Option 600')

    await expect(canvas.queryByText('Option 1')).toBeNull()
    await expect(canvas.queryByText('Option 50')).toBeNull()
    await expect(canvas.queryByText('Option 599')).toBeNull()
    await canvas.findByText('Option 600')
  }
}
