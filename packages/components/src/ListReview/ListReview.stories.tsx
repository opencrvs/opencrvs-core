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
import React from 'react'
import { ListReview } from './index'
import { Link } from '../Link'
import { Toggle } from '../Toggle'
import { Stack } from '../Stack'
import { Text } from '../Text'
import { Meta } from '@storybook/react'

export default {
  title: 'Data/List Review',
  parameters: {
    docs: {
      description: {
        component: `
\`<ListReview>\` provides a three column simple list. Useful for displaying content that requires a label, value and action button(s).
`
      }
    }
  },
  component: ListReview
} as Meta

const LinkExample = (
  <Link font="reg16" key="linkButton">
    Change
  </Link>
)

export const Default = () => (
  <ListReview>
    <ListReview.Header label="FIELD" value="INPUT" />
    <ListReview.Row
      label="Firstname(s)"
      value="Peter Jonathan"
      actions={LinkExample}
    />
    <ListReview.Row label="Lastname" value="Jones" actions={LinkExample} />
    <ListReview.Row
      label="Usual place of residence"
      value={
        <Stack direction="column" alignItems="flex-start">
          <Text variant="reg16" element="span">
            New Hampton
          </Text>
          <Text variant="reg16" element="span">
            Larjde
          </Text>
          <Text variant="reg16" element="span">
            Farajaland
          </Text>
        </Stack>
      }
      actions={LinkExample}
    />
  </ListReview>
)

export const WithToggle = () => {
  const [selected1, setSelected1] = React.useState(true)
  const [selected2, setSelected2] = React.useState(true)
  const [selected3, setSelected3] = React.useState(true)

  const Toggle1 = (
    <Toggle
      defaultChecked={selected1}
      onChange={() => setSelected1(!selected1)}
    />
  )
  const Toggle2 = (
    <Toggle
      defaultChecked={selected2}
      onChange={() => setSelected2(!selected2)}
    />
  )
  const Toggle3 = (
    <Toggle
      defaultChecked={selected3}
      onChange={() => setSelected3(!selected3)}
    />
  )

  return (
    <ListReview>
      <ListReview.Header label="FIELD" value="INPUT" />
      <ListReview.Row
        label="In review"
        value="Your declaration is in review. Your tracking ID is {TRACKING ID}. Use this for any follow up queries"
        actions={Toggle1}
      />
      <ListReview.Row
        label="Registered"
        value="The birth of {CHILDS NAME} has been registered. Their registration no. is {REG NO.}. Please visit your local registration office to collect their certificate"
        actions={Toggle2}
      />
      <ListReview.Row
        label="Certified"
        value="This is to confirm that a certificate has been printed and issued for {CHILDS NAME}"
        actions={Toggle3}
      />
    </ListReview>
  )
}
