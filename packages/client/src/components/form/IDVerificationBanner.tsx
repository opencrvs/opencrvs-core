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
import { BannerType, IFormFieldValue } from '@client/forms'
import { useIntl } from 'react-intl'
import {
  Pill,
  Banner,
  Icon,
  Button,
  Text,
  ResponsiveModal
} from '@opencrvs/components'
import { messages } from '@client/i18n/messages/views/id-verification-banner'
import { useModal } from '@client/hooks/useModal'
import { buttonMessages } from '@client/i18n/messages'
import styled from 'styled-components'

function Authenticated() {
  const intl = useIntl()
  return (
    <Pill
      type="active"
      size="small"
      pillTheme="dark"
      label={
        <>
          <Icon name="Fingerprint" size="small" />
          {intl.formatMessage(messages.authenticated.title)}
        </>
      }
    />
  )
}

function Verified() {
  const intl = useIntl()
  return (
    <Pill
      type="default"
      size="small"
      pillTheme="dark"
      label={
        <>
          <Icon name="CircleWavyCheck" size="small" />
          {intl.formatMessage(messages.verified.title)}
        </>
      }
    />
  )
}

function Failed() {
  const intl = useIntl()
  return (
    <Pill
      type="inactive"
      size="small"
      pillTheme="dark"
      label={
        <>
          <Icon name="X" size="small" />
          {intl.formatMessage(messages.failed.title)}
        </>
      }
    />
  )
}

export function VerificationPill({ type }: { type: string }) {
  if (type === 'authenticated') {
    return <Authenticated />
  } else if (type === 'verified') {
    return <Verified />
  } else if (type === 'failed') {
    return <Failed />
  }
  return null
}

const ConfirmationModal: React.FC<{
  close: (result: boolean) => void
  type: BannerType
}> = ({ close, type }) => {
  const intl = useIntl()
  return (
    <ResponsiveModal
      id="assignment"
      show
      title={intl.formatMessage(messages[type].resetConfirmation.title)}
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
      autoHeight
      responsive={false}
      preventClickOnParent
      handleClose={() => close(false)}
    >
      {intl.formatMessage(messages[type].resetConfirmation.description)}
    </ResponsiveModal>
  )
}

const StyledIcon = styled(Icon)<{ type: BannerType }>`
  border-radius: 50%;
  background-color: ${({ theme, type }) =>
    type === 'authenticated'
      ? theme.colors.positiveLight
      : type === 'failed'
      ? theme.colors.redLight
      : theme.colors.blueLight};
`

const StatusIcon = ({ type }: { type: BannerType }) => {
  if (type === 'authenticated') {
    return (
      <StyledIcon
        name="Check"
        size="large"
        weight="bold"
        color="greenDarker"
        type={type}
      />
    )
  } else if (type === 'verified') {
    return (
      <StyledIcon
        name="Check"
        size="large"
        weight="bold"
        color="blueDarker"
        type={type}
      />
    )
  } else if (type === 'failed') {
    return (
      <StyledIcon
        name="X"
        size="large"
        weight="bold"
        color="redDarker"
        type={type}
      />
    )
  }
  return null
}

export const IDVerificationBanner = ({
  type,
  idFieldName,
  setFieldValue
}: {
  type: BannerType
  setFieldValue: (name: string, value: IFormFieldValue) => void
  idFieldName: string
}) => {
  const intl = useIntl()
  const [modal, openModal] = useModal()
  const handleReset = async () => {
    const confirm = await openModal((close) => (
      <ConfirmationModal close={close} type={type} />
    ))
    if (confirm) {
      setFieldValue(idFieldName, '')
    }
  }
  if (type === 'authenticated') {
    return (
      <Banner.Container>
        <Banner.Header type="active">
          <Authenticated />
          <StatusIcon type={type} />
        </Banner.Header>
        <Banner.Body>
          <Text variant="reg16" element="span">
            {intl.formatMessage(messages.authenticated.description)}
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
  } else if (type === 'verified') {
    return (
      <Banner.Container>
        <Banner.Header type="default">
          <Verified />
          <StatusIcon type={type} />
        </Banner.Header>
        <Banner.Body>
          <Text variant="reg16" element="span">
            {intl.formatMessage(messages.verified.description)}
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
  } else if (type === 'failed') {
    return (
      <Banner.Container>
        <Banner.Header type="inactive">
          <Failed />
          <StatusIcon type={type} />
        </Banner.Header>
        <Banner.Body>
          <Text variant="reg16" element="span">
            {intl.formatMessage(messages.failed.description)}
          </Text>
        </Banner.Body>
        <Banner.Footer justifyContent="flex-end">
          <Button type="secondary" onClick={handleReset}>
            {intl.formatMessage(messages.actions.reset)}
          </Button>
        </Banner.Footer>
        {modal}
      </Banner.Container>
    )
  } else return null
}
