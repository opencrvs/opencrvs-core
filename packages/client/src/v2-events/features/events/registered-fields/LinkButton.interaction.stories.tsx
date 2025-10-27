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
import React from 'react'
import { fn, expect, within } from '@storybook/test'
import styled from 'styled-components'
import { ConditionalType, user } from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { withValidatorContext } from '../../../../../.storybook/decorators'
import { FormFieldGeneratorProps } from '../../../components/forms/FormFieldGenerator/FormFieldGenerator'

const url = 'https://example.com/authenticate'
const meta: Meta<FormFieldGeneratorProps> = {
  title: 'Inputs/LinkButton',
  args: {
    onChange: fn()
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

const Container = styled.div`
  display: flex;
  justify-content: center;
`
const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export default meta

type Story = StoryObj<FormFieldGeneratorProps>

export const Redirection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const link = await canvas.findByRole('link', {
      name: 'Authenticate by external system'
    })
    await expect(link).toHaveAttribute(
      'href',
      `https://example.com/authenticate?redirect_uri=${encodeURIComponent(window.location.href)}`
    )
  },
  render: (args) => {
    return (
      // To avoid breaking the storybook iframe, we capture the click event and
      // alert the user instead of allowing the link button to perform an actual
      // redirection. This is only done for this specific story.
      <Container
        onClickCapture={(e) => {
          const button = e.target as HTMLButtonElement
          if (button.id === 'person____authenticate') {
            e.preventDefault()
            alert(
              'On click, the link button changes href to\n' +
                url +
                '?redirect_uri=' +
                window.location.href
            )
          }
        }}
      >
        <StyledFormFieldGenerator
          {...args}
          fields={[
            {
              id: 'person.authenticate',
              type: 'LINK_BUTTON',
              label: {
                id: 'event.tennisClubMembership.person.noNID',
                defaultMessage: 'No NID?',
                description: 'Label when the person has no NID'
              },
              conditionals: [
                {
                  type: ConditionalType.ENABLE,
                  conditional: user.isOnline()
                }
              ],
              configuration: {
                text: {
                  id: 'event.tennisClubMembership.person.authenticate',
                  defaultMessage: 'Authenticate by external system',
                  description: 'Authenticate'
                },
                url
              }
            }
          ]}
          id="event.tennisClubMembership"
          onChange={args.onChange}
        />
      </Container>
    )
  }
}
