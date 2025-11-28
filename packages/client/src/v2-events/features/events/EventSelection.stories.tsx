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
import { tennisClubMembershipEvent } from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { EventSelection } from './EventSelection'
import { addLocalEventConfig } from './useEvents/api'

const meta: Meta<typeof EventSelection> = {
  title: 'EventSelection',
  component: EventSelection,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventSelection>

// has 'record.create[event=birth|death|tennis-club-membership]' scope
const tokenWithCreateScopeForAllEventTypes =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWNvcmQuZGVjbGFyYXRpb24tc3VibWl0LWZvci1yZXZpZXciLCJzZWFyY2guYmlydGgiLCJzZWFyY2guZGVhdGgiLCJzZWFyY2gubWFycmlhZ2UiLCJ3b3JrcXVldWVbaWQ9YWxsLWV2ZW50c3xhc3NpZ25lZC10by15b3V8cmVjZW50fHJlcXVpcmVzLXVwZGF0ZXN8c2VudC1mb3ItcmV2aWV3XSIsInNlYXJjaFtldmVudD1iaXJ0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD1kZWF0aCxhY2Nlc3M9YWxsXSIsInNlYXJjaFtldmVudD10ZW5uaXMtY2x1Yi1tZW1iZXJzaGlwLGFjY2Vzcz1hbGxdIiwic2VhcmNoW2V2ZW50PUZPT1RCQUxMX0NMVUJfTUVNQkVSU0hJUCxhY2Nlc3M9YWxsXSIsInJlY29yZC5jcmVhdGVbZXZlbnQ9YmlydGh8ZGVhdGh8dGVubmlzLWNsdWItbWVtYmVyc2hpcF0iXSwiaWF0IjoxNDg3MDc2NzA4LCJhdWQiOiJvcGVuY3J2czpnYXRld2F5LXVzZXIiLCJpc3MiOiJvcGVuY3J2czphdXRoLXNlcnZpY2UiLCJzdWIiOiI2N2VmN2Y4M2Q2YTljYjkyZTllZGFhOTkifQ.fr2bUI9j1ubODKoiiSIr3xN3BZaP7842Lld1loX6pqHSQiylvOC2ncTV_1bFC0ndGei2Ae0osHx4KmBfwnk-AmqkigSVdmhuuChhR8SG9t3OeASwPNHkFSNWzRSUoskdoTgjeAyiO-_pICEOKcavuRYKbxdyYTxPJyTXQyXXhrN65-8hAU3xMR6LaHQMU8GHyqeVNk0HRsBRlmK6ukk-CPXa2far-rm_gW_tQxBVeobNEkN8-TR87gm8-4U68Br7L12y0oeCWmlYeF4GnvtDfIEj-0U4fEy3N8c_Kr2a9AZLEQw6wC-6T42iahomvIOydpyxeUH0fOkNzHyQiiCe-31NzGq5sBLkxg4iFnuL62h6ZPlYMNuulrNdVHPIMDpMlxJBlJoQPZBZVvTH23mEPhLgJv65b3pICN_2HSfvfnWCde58biyWya3aNLb97qwk-dHxMOsFk5r-um5lgIxS2NGsyVctvpBlXUInCCGOWAk_xxoYUG2_DmFsta98W0CWrIHvgDIIbnn61GLECjvduvWAPDZSIP5twf0UYiFzSvhzaDPxyypd3tzzs76Vkex9bwhjoDeVbBQC35WSgl52gy2RD_i4LJdP44uaI80BMisaFTONbegblpBGEYE9i0ESSkzyYCy6nVY4-J7TVizTvoEjQgk19WIYlK08S3apv5U'

const birthConfig = {
  ...tennisClubMembershipEvent,
  id: 'birth',
  label: {
    id: 'birth',
    defaultMessage: 'Birth',
    description: 'birth'
  }
}

// This is not shown because it is not in the scope
const randomConfig = {
  ...tennisClubMembershipEvent,
  id: 'foo',
  label: {
    id: 'foo',
    defaultMessage: 'Foo',
    description: 'Foo'
  }
}

export const EventSelectionWithCreateScopeForAllEventTypes: Story = {
  beforeEach: () => {
    addLocalEventConfig(birthConfig)
    addLocalEventConfig(randomConfig)
  },
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
