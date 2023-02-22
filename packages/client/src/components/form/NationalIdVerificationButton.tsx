/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { useIntl } from 'react-intl'
import React from 'react'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { Text } from '@opencrvs/components/lib/Text'
import { Icon } from '@opencrvs/components/lib/Icon'

type NationalIdVerificationButtonProps = {
  label: string
}

export const NationalIdVerificationButtonField = ({
  label
}: NationalIdVerificationButtonProps) => {
  const intl = useIntl()

  return (
    <Stack>
      <Text variant="reg14" element="span">
        {label}
      </Text>

      <Button type="secondary" onClick={() => alert('todo!')}>
        <Icon name="CheckCircle" />
        Authenticate
      </Button>
    </Stack>
  )
}
