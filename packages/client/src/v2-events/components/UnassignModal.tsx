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
import { useIntl } from 'react-intl'
import { Dialog, Button, Text } from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'

export function UnassignModal({
  close,
  assignedSelf,
  name,
  officeName
}: {
  close: (result: boolean) => void
  assignedSelf: boolean
  name: string | null
  officeName?: string | null
}) {
  const intl = useIntl()
  return (
    <Dialog
      actions={[
        <Button
          key="cancel_unassign"
          id="cancel_unassign"
          size="medium"
          type="tertiary"
          onClick={() => {
            close(false)
          }}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          key="confirm_unassign"
          id="confirm_unassign"
          size="medium"
          type="negative"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(buttonMessages.unassign)}
        </Button>
      ]}
      isOpen={true}
      title={intl.formatMessage(conflictsMessages.unassignTitle)}
      onClose={() => close(false)}
    >
      <Text color="grey500" element="p" variant="reg16">
        {assignedSelf
          ? intl.formatMessage(conflictsMessages.selfUnassignDesc)
          : intl.formatMessage(conflictsMessages.regUnassignDesc, {
              name,
              officeName
            })}
      </Text>
    </Dialog>
  )
}
