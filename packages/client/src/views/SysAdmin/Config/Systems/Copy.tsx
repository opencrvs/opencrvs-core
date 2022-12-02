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

import { TertiaryButton } from '@opencrvs/components/lib/buttons'
import { Icon } from '@opencrvs/components/lib/Icon'
import React from 'react'
import { useCopyToClipboard } from '@client/views/SysAdmin/Config/Systems/useCopyToClipboard'
import { Text } from '@opencrvs/components/lib/Text'
import { useIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'

interface CopyProps {
  data: string
}

export function Copy({ data }: CopyProps) {
  const [clipToCopy, setClipToCopy] = useCopyToClipboard()
  const intl = useIntl()
  return (
    <TertiaryButton
      align={0}
      icon={() =>
        clipToCopy ? (
          <Icon color="green" name="CheckSquare" />
        ) : (
          <Icon name="Copy" />
        )
      }
      id="myButton"
      onClick={() => setClipToCopy(data)!}
    >
      {clipToCopy ? (
        <Text variant="reg16" color="green" element="span">
          {intl.formatMessage(buttonMessages.copied)}
        </Text>
      ) : (
        <Text variant="reg16" element="span" color="blue">
          {intl.formatMessage(buttonMessages.copy)}
        </Text>
      )}
    </TertiaryButton>
  )
}
