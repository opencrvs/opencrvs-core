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

import { useState } from 'react'
import { useIntl } from 'react-intl'
import * as React from 'react'
import styled from 'styled-components'
import { ResponsiveModal } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { messages } from '@client/i18n/messages/views/review'
import { buttonMessages } from '@client/i18n/messages'
import { SignatureCanvas } from './SignatureCanvas'

/** Based on packages/client/src/components/form/SignatureField/SignatureUploader.tsx */

const SignatureDescription = styled.p`
  margin-top: 0;
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.grey500};
`

interface SignatureInputModalProps {
  onClose: () => void
  onSubmit: (signatureValue: string) => void
  title: string
  id: string
}

export function SignatureCanvasModal({
  onClose,
  onSubmit,
  title,
  id
}: SignatureInputModalProps) {
  const intl = useIntl()
  const [signature, setSignature] = useState<string | undefined>(undefined)

  return (
    <ResponsiveModal
      actions={[
        <Button
          key="cancel"
          id="modal_cancel"
          type="tertiary"
          onClick={onClose}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          key="apply"
          disabled={!signature}
          id="apply_change"
          type="positive"
          onClick={() => {
            if (!signature) {
              return
            }

            onSubmit(signature)
          }}
        >
          {intl.formatMessage(buttonMessages.apply)}
        </Button>
      ]}
      autoHeight={true}
      handleClose={onClose}
      id={`${id}_modal`}
      show={true}
      title={title}
      titleHeightAuto={true}
      width={600}
    >
      <SignatureDescription>
        {intl.formatMessage(messages.signatureInputDescription)}
      </SignatureDescription>
      <SignatureCanvas
        onChange={(base64Src?: string) => {
          setSignature(base64Src)
        }}
      />
    </ResponsiveModal>
  )
}
