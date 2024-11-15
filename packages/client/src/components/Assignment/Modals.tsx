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
import { ResponsiveModal } from '@opencrvs/components'
import { TertiaryButton, DangerButton } from '@opencrvs/components/lib/buttons'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import { useIntl } from 'react-intl'

export const AssignModal: React.FC<{
  close: (result: boolean) => void
}> = ({ close }) => {
  const intl = useIntl()

  return (
    <ResponsiveModal
      id="assignment"
      show
      title={intl.formatMessage(conflictsMessages.assignTitle)}
      actions={[
        <Button
          key="assign-btn"
          id="assign"
          type="positive"
          onClick={() => close(true)}
        >
          {intl.formatMessage(buttonMessages.assign)}
        </Button>,
        <Button
          key="cancel-btn"
          id="cancel"
          type="tertiary"
          onClick={() => close(false)}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>
      ]}
      autoHeight
      responsive={false}
      preventClickOnParent
      handleClose={() => close(false)}
    >
      {intl.formatMessage(conflictsMessages.assignDesc)}
    </ResponsiveModal>
  )
}

export const ShowAssignmentModal: React.FC<{
  close: (result: boolean) => void
  children: React.ReactNode
}> = ({ close, children }) => {
  const intl = useIntl()

  return (
    <ResponsiveModal
      id="assignment"
      show
      title={intl.formatMessage(conflictsMessages.assignedTitle)}
      actions={[]}
      autoHeight
      responsive={false}
      preventClickOnParent
      handleClose={() => close(false)}
    >
      {children}
    </ResponsiveModal>
  )
}

export const UnassignModal: React.FC<{
  close: (result: boolean | null) => void
  assignedSelf: boolean
  name: string
  officeName: string | null
}> = ({ close, assignedSelf, name, officeName }) => {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title={intl.formatMessage(conflictsMessages.unassignTitle)}
      actions={[
        <TertiaryButton
          id="cancel_unassign"
          key="cancel_unassign"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <DangerButton
          key="confirm_unassign"
          id="confirm_unassign"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(buttonMessages.unassign)}
        </DangerButton>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      {assignedSelf
        ? intl.formatMessage(conflictsMessages.selfUnassignDesc)
        : intl.formatMessage(conflictsMessages.regUnassignDesc, {
            name,
            officeName
          })}
    </ResponsiveModal>
  )
}
