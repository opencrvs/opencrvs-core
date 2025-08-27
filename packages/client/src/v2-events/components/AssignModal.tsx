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
import { ResponsiveModal, Button } from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'

export function AssignModal({ close }: { close: (result: boolean) => void }) {
  const intl = useIntl()

  return (
    <ResponsiveModal
      autoHeight
      preventClickOnParent
      show
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
      handleClose={() => close(false)}
      id="assignment"
      responsive={false}
      title={intl.formatMessage(conflictsMessages.assignTitle)}
    >
      {intl.formatMessage(conflictsMessages.assignDesc)}
    </ResponsiveModal>
  )
}
