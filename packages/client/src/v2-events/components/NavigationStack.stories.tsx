/* eslint-disable react/jsx-no-literals */
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
import { expect, userEvent, within } from '@storybook/test'
import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { TRPCProvider } from '@client/v2-events/trpc'

import { NavigationStack } from './NavigationStack'

const meta: Meta<typeof NavigationStack> = {
  title: 'Utilities/NavigationStack',
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const router = {
  path: '/',
  children: [
    {
      path: '/home',
      Component: () => {
        const navigate = useNavigate()
        return (
          <div>
            Home
            <Link data-testid="wizard" to={'/wizard/1'}>
              Open Wizard
            </Link>
            <button data-testid="back" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        )
      }
    },
    {
      path: '/wizard',
      element: (
        <NavigationStack>
          <Outlet />
        </NavigationStack>
      ),
      children: [
        {
          path: '/wizard/1',
          element: (
            <div data-testid="page-1">
              Page 1
              <Link data-testid="next" to={'/wizard/2'}>
                Next
              </Link>
            </div>
          )
        },
        {
          path: '/wizard/2',
          Component: () => {
            const navigate = useNavigate()
            return (
              <div data-testid="page-2">
                Page 2
                <Link data-testid="next" to={'/wizard/3'}>
                  Next
                </Link>
                <button data-testid="back" onClick={() => navigate(-1)}>
                  Go Back
                </button>
              </div>
            )
          }
        },
        {
          path: '/wizard/3',
          element: (
            <div data-testid="page-3">
              Page 3
              <Link data-testid="submit" to={'/home'}>
                Submit
              </Link>
            </div>
          )
        }
      ]
    }
  ]
}

export const NavigationStackBack: StoryObj<typeof NavigationStack> = {
  name: 'Prevents user from navigating back to the stack',
  parameters: {
    reactRouter: {
      router,
      initialPath: '/home'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByTestId('wizard'))
    await userEvent.click(await canvas.findByTestId('next'))
    await userEvent.click(await canvas.findByTestId('next'))
    await userEvent.click(await canvas.findByTestId('submit'))
    await userEvent.click(await canvas.findByTestId('back'))
    await expect(canvas.queryByTestId('submit')).not.toBeInTheDocument()
  }
}
export const NavigationStackDirect: StoryObj<typeof NavigationStack> = {
  name: 'Allows user to directly navigate to a stack view',
  parameters: {
    reactRouter: {
      router,
      initialPath: '/wizard/2'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByTestId('page-2')).toBeInTheDocument()
  }
}
export const NavigationStackView: StoryObj<typeof NavigationStack> = {
  name: 'Allows user to navigate backwards within the stack',
  parameters: {
    reactRouter: {
      router,
      initialPath: '/home'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByTestId('wizard'))
    await userEvent.click(await canvas.findByTestId('next'))
    await userEvent.click(await canvas.findByTestId('back'))
    await expect(await canvas.findByTestId('page-1')).toBeInTheDocument()
  }
}
