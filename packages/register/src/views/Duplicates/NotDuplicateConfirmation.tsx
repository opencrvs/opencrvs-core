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
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import styled from '@register/styledComponents'
import { Modal } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@register/i18n/messages/views/duplicates'
import { buttonMessages } from '@register/i18n/messages'

const ConfirmButton = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`

// cast to any because of styled-components bug
// https://stackoverflow.com/questions/53724583/why-this-wrapped-styled-component-errors-has-no-properties-in-common-with/53902817#53902817
const StyledModal = styled(Modal)`
  z-index: 4;
` as any

interface IProps {
  show: boolean
  handleYes: () => void
  handleClose: () => void
}

const NotDuplicateConfirmationComponent = ({
  show,
  handleYes,
  handleClose,
  intl
}: IProps & IntlShapeProps) => {
  return (
    <StyledModal
      title={intl.formatMessage(messages.notDuplicateConfirmationTxt)}
      actions={[
        <PrimaryButton
          key="confirm"
          id="not_duplicate_confirm"
          onClick={handleYes}
        >
          {intl.formatMessage(buttonMessages.yes)}
        </PrimaryButton>,
        <ConfirmButton
          key="close"
          id="not_duplicate_close"
          onClick={handleClose}
        >
          {intl.formatMessage(buttonMessages.back)}
        </ConfirmButton>
      ]}
      show={show}
      handleClose={handleClose}
    >
      <></>
    </StyledModal>
  )
}

export const NotDuplicateConfirmation = injectIntl(
  NotDuplicateConfirmationComponent
)
