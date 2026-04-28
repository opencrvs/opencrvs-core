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
import { buttonMessages } from '@client/i18n/messages'
import { User } from '@opencrvs/commons/client'
import { ResponsiveModal } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import React from 'react'
import { useIntl } from 'react-intl'
import { useUsers } from '../../../../v2-events/hooks/useUsers'
import { messages } from '@client/i18n/messages/views/sysAdmin'
import { getUserName } from '@client/utils/userUtils'

const activateConfig = {
  title: messages.reactivateUserTitle,
  subtitle: messages.reactivateUserSubtitle,
  cta: messages.reactivate
}

const deactivateConfig = {
  title: messages.deactivateUserTitle,
  subtitle: messages.deactivateUserSubtitle,
  cta: messages.deactivate
}

/**
 *
 * Modal for activating or deactivating a user. The action is determined by the current status of the user.
 */
export function UserActivationModal({
  onClose,
  user,
  onSuccess,
  onError
}: {
  onClose: () => void
  user: User
  onSuccess: () => void
  onError?: () => void
}) {
  const intl = useIntl()
  const updatedStatus = user.status === 'active' ? 'deactivate' : 'activate'
  const actionConfig =
    updatedStatus === 'activate' ? activateConfig : deactivateConfig

  const name = getUserName(user)
  const users = useUsers()
  const updateUser = users.updateUser({
    onSuccess,
    onError
  })

  const onClick = () =>
    updateUser.mutate({
      id: user.id,
      status: updatedStatus === 'activate' ? 'active' : 'deactivated'
    })

  return (
    <ResponsiveModal
      id={`${updatedStatus}-user-modal`}
      show={true}
      handleClose={onClose}
      title={intl.formatMessage(actionConfig.title, {
        name
      })}
      actions={[
        <Button
          type="tertiary"
          id={`cancel-${updatedStatus}-user`}
          key={`cancel-${updatedStatus}-user`}
          onClick={onClose}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          type="negative"
          id={`${updatedStatus}-user`}
          key={`${updatedStatus}-user`}
          onClick={onClick}
        >
          {intl.formatMessage(actionConfig.cta)}
        </Button>
      ]}
      responsive={false}
      autoHeight={true}
    >
      {intl.formatMessage(actionConfig.subtitle, {
        name
      })}
    </ResponsiveModal>
  )
}
