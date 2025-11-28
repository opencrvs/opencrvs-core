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
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import {
  Banner,
  Button,
  Icon,
  Pill,
  ResponsiveModal,
  Stack,
  Text
} from '@opencrvs/components'
import * as SupportedIcons from '@opencrvs/components/lib/Icon/all-icons'
import {
  VerificationStatus as VerificationStatusField,
  VerificationStatusValue
} from '@opencrvs/commons/client'
import { useModal } from '@client/v2-events/hooks/useModal'
import { messages as idVerificationMessages } from '@client/i18n/messages/views/id-verification'
import { buttonMessages } from '@client/i18n/messages'

const StyledIcon = styled(Icon)`
  margin-right: 4px;
`

const IconWrapper = styled.div<{
  type: VerificationStatusValue
}>`
  --background-color: ${({ theme, type }) => `
    ${type === 'verified' ? theme.colors.primaryLight : ''}
    ${type === 'authenticated' ? theme.colors.greenLight : ''}
    ${type === 'failed' ? theme.colors.redLight : ''}
  `};
  height: 24px;
  width: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
`

const PILL_FOR_STATUS = {
  verified: 'default',
  authenticated: 'active',
  failed: 'inactive',
  pending: 'pending'
} as const

const ICON_FOR_STATUS = {
  verified: 'CircleWavyCheck',
  authenticated: 'Fingerprint',
  failed: 'X',
  pending: 'CircleWavyQuestion'
} as const satisfies Record<string, keyof typeof SupportedIcons>

const messages = {
  verified: idVerificationMessages.verified,
  authenticated: idVerificationMessages.authenticated,
  failed: idVerificationMessages.failedFetchIdDetails,
  pending: idVerificationMessages.failed,
  actions: idVerificationMessages.actions
}

function Input({
  id,
  configuration,
  value,
  onReset
}: {
  id: string
  configuration: VerificationStatusField['configuration']
  value: VerificationStatusValue | undefined
  onReset: () => void
}) {
  const intl = useIntl()
  const [modal, openModal] = useModal()
  if (!value) {
    return null
  }

  const handleReset = async () => {
    const confirm = await openModal((close) => (
      <ResponsiveModal
        autoHeight
        preventClickOnParent
        show
        actions={[
          <Button
            key="cancel-btn"
            id="cancel"
            type="tertiary"
            onClick={() => close(false)}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            key="confirm-btn"
            id="confirm"
            type="negative"
            onClick={() => close(true)}
          >
            {intl.formatMessage(buttonMessages.continueButton)}
          </Button>
        ]}
        handleClose={() => close(false)}
        id="assignment"
        responsive={false}
        title={intl.formatMessage(messages[value].resetConfirmation.title)}
      >
        {intl.formatMessage(messages[value].resetConfirmation.description)}
      </ResponsiveModal>
    ))
    if (confirm) {
      onReset()
    }
  }

  return (
    <Banner.Container>
      <Banner.Header type={PILL_FOR_STATUS[value]}>
        <Pill
          data-testid={`${id}__${value}`}
          label={
            <>
              <StyledIcon name={ICON_FOR_STATUS[value]} size="small" />
              {intl.formatMessage(configuration.status, { value })}
            </>
          }
          pillTheme="dark"
          size="small"
          type={PILL_FOR_STATUS[value]}
        />

        <IconWrapper type={value}>
          {value === 'verified' && (
            <Icon color="greenDarker" name="Check" size="small" weight="bold" />
          )}
          {value === 'authenticated' && (
            <Icon color="primaryDark" name="Check" size="small" weight="bold" />
          )}
          {value === 'failed' && (
            <Icon color="redDarker" name="X" size="small" weight="bold" />
          )}
        </IconWrapper>
      </Banner.Header>
      <Banner.Body>
        <Text element="span" variant="reg16">
          {intl.formatMessage(configuration.description, { value })}
        </Text>
      </Banner.Body>
      <Banner.Footer justifyContent="flex-end">
        <Button type="secondary" onClick={handleReset}>
          {intl.formatMessage(messages.actions.revoke)}
        </Button>
      </Banner.Footer>

      {modal}
    </Banner.Container>
  )
}

function Output({
  id,
  configuration,
  value
}: {
  id: string
  configuration: VerificationStatusField['configuration']
  value: VerificationStatusValue
}) {
  const intl = useIntl()

  return (
    <Stack alignItems="flex-start" direction="column">
      <Pill
        data-testid={`${id}__${value}`}
        label={
          <>
            <StyledIcon name={ICON_FOR_STATUS[value]} size="small" />
            {intl.formatMessage(configuration.status, { value })}
          </>
        }
        pillTheme="dark"
        size="small"
        type={PILL_FOR_STATUS[value]}
      />
    </Stack>
  )
}

export const VerificationStatus = {
  Input,
  Output
}
