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
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from 'styled-components'
import { Modal } from '@opencrvs/components/lib/Modal'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@client/i18n/messages/views/review'
import { buttonMessages } from '@client/i18n/messages'

const PreviewButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`

interface IProps {
  show: boolean
  handleEdit: () => void
  handleClose: () => void
}

const EditConfirmationComponent = ({
  show,
  handleEdit,
  handleClose,
  intl
}: IProps & IntlShapeProps) => {
  return (
    <Modal
      title={intl.formatMessage(messages.editDeclarationConfirmation)}
      actions={[
        <PrimaryButton key="edit" id="edit_confirm" onClick={handleEdit}>
          {intl.formatMessage(buttonMessages.edit)}
        </PrimaryButton>,
        <PreviewButton key="preview" id="preview_back" onClick={handleClose}>
          {intl.formatMessage(messages.backToPreview)}
        </PreviewButton>
      ]}
      show={show}
      handleClose={handleClose}
    >
      <></>
    </Modal>
  )
}

export const EditConfirmation = injectIntl(EditConfirmationComponent)
