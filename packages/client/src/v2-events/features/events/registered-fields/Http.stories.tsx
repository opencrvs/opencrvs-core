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
import { fn, userEvent, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { HttpFieldValue } from '@opencrvs/commons/client'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TRPCProvider } from '@client/v2-events/trpc'
import { Text } from './Text'
import { Button } from './Button'
import { Http } from './Http'

interface Args {
  onChange: (val: unknown) => void
}

const meta: Meta<Args> = {
  title: 'Inputs/Http',
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

const Container = styled.div`
  width: 500px;
  display: grid;
  grid-auto-rows: min-content;
  gap: 12px;
`

export const FetchOnButtonClick: StoryObj<Args> = {
  parameters: { layout: 'centered' },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Type a query', async () => {
      await userEvent.type(
        await canvas.findByTestId('text__storybook.http.query'),
        'https://jsonplaceholder.typicode.com/todos/1'
      )
    })
    await step('Click fetch', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: /fetch/i })
      )
    })
  },
  render: function Component(args) {
    const [query, setQuery] = React.useState<string | undefined>('')
    const [clicks, setClicks] = React.useState(0)
    const [httpValue, setHttpValue] = React.useState<{
      loading: boolean
      error: { statusCode: number | null; message: string } | null
      data?: unknown
    }>({ loading: false, error: null, data: null })

    // Build configuration with current query; the request fires when `clicks` changes
    const configuration = React.useMemo(
      () => ({
        method: 'GET' as const,
        url: query ?? '',
        timeout: 8000,
        headers: {
          'X-Example-Header': 'Demo'
        }
      }),
      [query]
    )

    // Bubble any change out
    React.useEffect(() => {
      args.onChange({ query, clicks, httpValue })
    }, [args, query, clicks, httpValue])

    return (
      <Container>
        <InputField id="storybook.http.query" label={`URL`} touched={false}>
          <Text.Input
            id="storybook.http.query"
            placeholder="e.g. https://jsonplaceholder.typicode.com/todos/1"
            value={query}
            onChange={setQuery}
          />
        </InputField>

        <Button.Input
          configuration={{
            text: {
              id: 'storybook.http.fetch',
              defaultMessage: 'Fetch',
              description: 'Trigger HTTP fetch'
            },
            icon: 'MagnifyingGlass'
          }}
          value={clicks}
          onChange={setClicks}
        />

        {/* Http.Input will run when `parentValue` changes (i.e., button clicked) */}
        <Http.Input
          configuration={configuration}
          parentValue={clicks}
          onChange={(val: HttpFieldValue) => setHttpValue(val)}
        />

        {httpValue.loading && <p>{`Loading...`}</p>}
        {httpValue.error && <p>{`Error :(`}</p>}
        {!httpValue.loading &&
          !httpValue.error &&
          httpValue.data !== undefined && (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(httpValue.data, null, 2)}
            </pre>
          )}
      </Container>
    )
  }
}
