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

import * as React from 'react'
import { useIntl } from 'react-intl'
import { Button, ResponsiveModal } from '@opencrvs/components'
import { buttonMessages } from '@client/i18n/messages'
import { duplicateMessages } from './ReviewDuplicate'

export function MarkAsNotDuplicateModal({
  close,
  trackingId,
  name
}: {
  close: (result: boolean) => void
  trackingId: string
  name: string
}) {
  const intl = useIntl()

  return (
    <ResponsiveModal
      actions={[
        <Button
          key="not-duplicateRegistration-cancel"
          id="not-duplicate-cancel"
          type="tertiary"
          onClick={() => close(false)}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          key="not-duplicateRegistration-confirm"
          id="not-duplicate-confirm"
          type="primary"
          onClick={() => close(true)}
        >
          {intl.formatMessage(buttonMessages.confirm)}
        </Button>
      ]}
      autoHeight={true}
      handleClose={() => close(false)}
      id="not-duplicate-modal"
      responsive={false}
      show={true}
      title={intl.formatMessage(
        duplicateMessages.notDuplicateContentConfirmationTitle,
        {
          name,
          trackingId: trackingId
        }
      )}
      titleHeightAuto={true}
    />
  )
}
