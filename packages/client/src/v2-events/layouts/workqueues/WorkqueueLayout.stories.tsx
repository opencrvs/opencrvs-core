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
import { WorkqueueLayout } from './index'

const meta: Meta<typeof WorkqueueLayout> = {
  title: 'WorkqueueLayout',
  component: WorkqueueLayout,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof WorkqueueLayout>

// has 'record.create[event=birth|death|tennis-club-membership]' scope
const tokenWithCreateScopeForAllEventTypes =
  'yJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCIsInJlY29yZC5jcmVhdGVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UifQ.FTYp5hxSdU2sRQu90IAHu-ZJKss_jsEr_iJ2bQHnuVCvj79Qd89XFW1HgArw386SvOpOxgF3FYoWlrV8UB-ac8V4pirZR3c7jmmqdlI9Q6W8cBOk0hwVLr793oZhrRu28daIJnw7EMblzSSh8jDvF_rJ96aDAgB-Tal5ViK3YjXXOskYiJn-yNzp7CBeu6KKC6CViMBUJ-A7qAwHgCJkaQHkIweVFo04ypIMD7KBTZrt0jSGWU17n1_l2BumAlNtvNZoR3SkQSuQte-n6Ehubwinuj8WNfsOTFKnoTKEd36PEXeUIAMWwyd-zwZ0mrY97oivsHtD-E4zr2I7fbDXzcmGKsyMzVuvqMbBwwlM82snTlRscQ6Ur-11HgErgSwhjntGE1kkEMIbnoHvReI_Yc1QZY4KXYVM6iAlLmIBA66ZighWxWnVLBFCLMCplkY_G6gKs2ZPMNGiEbOwEqLaUVlDv29PS7aiF11Ejfu6CsQj0TVVKzUnVnL9OeVHV9B4ROulLVa722lZa9QmD4Q_eM62j2YHhQ-UwshvPRqrSPje72fcOKSDiZ9NEwbBdvv4Fywe7yyR3oVcaTLcwcyfaxP9b1dZghQU4uU-rmgh7C9v1mEYXSYWrz7J04_DnTD5tvspn-W63f2ukh9hdafLkTLjamub-dLHqIgL67Nb58Q'

// doesnt have 'record.create' scope
const tokenWithNoCreateScope =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInR5cGU9cmVjb3JkLnNlYXJjaCJdLCJpYXQiOjE0ODcwNzY3MDgsImF1ZCI6Im9wZW5jcnZzOmdhdGV3YXktdXNlciIsImlzcyI6Im9wZW5jcnZzOmF1dGgtc2VydmljZSJ9.czDdgR2TMNk_KxCIBagQMxULqN5LBkv17RJ0RDbz7q4wzjl_miyFT2Wi0bySR9tqUm_JIHZoYX7Auj5z3P4whasf9p5slG_LNKfStuDw_jW0hVr6eetBgNSvBFmHWc3I89eEwqEcMxB3CS-owMQn54Sm5J4fCWsbJmEOBA0hiq76aqiXKhA5v03bKNRKjFn2vWcJvvd6l9qxIzy4GUbE-zX7iDPVssPSF2ET7hMY_tHjHpk7Mz1_rS8bfedwME0itiUlowq85rtKG7ATmxE-4woZnbPBm64_1y3zU0YZG3bs3eMoc8CCL6HgLVZtKVBFmOzcl3j4lZsVLuDABFLXupow8S3jH95tdOZ5yaZAjdZ7NeOG9Qs49fL6VWw5weKCV0nq-5FxU-bosigTnvCLsBZXcP40lDmidsmgFtl57t9Z9O_dOOtsjgIvtaudvJjIMoeB6Iw3zum7MlL74t6XkI4Sg6AN-v1pmiSd-R1JvcvhVDgVO9cEcsFCjIQpP5qxMk38Sj7Q3pJZCnxsEpMMxliIwkx8qclxmqnMODak3_jLRv_859sosNY5rMHWRm0ELu5Hk5KZVsXqkkoWJikazYuzUFumXN4B-G-xr9l61P9XTpLLz9GTEOMgmDMC3FUMKpYVJn8n7OBhJYk2zTbIknP_oqdLGpi7f21EFRgmpuc'

export const LayoutWithCreateAllowed: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        tokenWithCreateScopeForAllEventTypes
      )

      // Ensure state is stable before seeding the mutation cache
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ]
}

export const LayoutWithNoCreateAllowed: Story = {
  loaders: [
    async () => {
      window.localStorage.setItem('opencrvs', tokenWithNoCreateScope)

      // Ensure state is stable before seeding the mutation cache
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  ]
}
