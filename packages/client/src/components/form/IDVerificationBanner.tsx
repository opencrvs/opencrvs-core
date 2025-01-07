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
import { Pill, Banner, Icon, Button, Text } from '@opencrvs/components'
import { messages } from '@client/i18n/messages/views/id-verification-banner'

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
  const handleReset = () => {
    setFieldValue(idFieldName, '')
  }
  if (type === 'pending') {
    return (
      <Banner.Container>
        <Banner.Header type="pending">
          <Pill
            type="pending"
            size="small"
            pillTheme="dark"
            label={
              <>
                <Icon name="QrCode" size="small" />
                {intl.formatMessage(messages.pending.title)}
              </>
            }
          />
          <Icon name="Clock" size="large" />
        </Banner.Header>
        <Banner.Body>
          <Text variant="reg16" element="span">
            {intl.formatMessage(messages.pending.description)}
          </Text>
        </Banner.Body>
        <Banner.Footer justifyContent="flex-end">
          <Button type="secondary" onClick={handleReset}>
            {intl.formatMessage(messages.actions.reset)}
          </Button>
        </Banner.Footer>
      </Banner.Container>
    )
  } else if (type === 'verified') {
    return (
      <Banner.Container>
        <Banner.Header type="default">
          <Pill
            type="default"
            size="small"
            pillTheme="dark"
            label={
              <>
                <Icon name="CircleWavyCheck" size="small" />
                {intl.formatMessage(messages.success.title)}
              </>
            }
          />
          <Icon name="FilledCheck" size="large" />
        </Banner.Header>
        <Banner.Body>
          <Text variant="reg16" element="span">
            {intl.formatMessage(messages.success.description)}
          </Text>
        </Banner.Body>
        <Banner.Footer justifyContent="flex-end">
          <Button type="secondary" onClick={handleReset}>
            {intl.formatMessage(messages.actions.revoke)}
          </Button>
        </Banner.Footer>
      </Banner.Container>
    )
  } else if (type === 'failed') {
    return (
      <Banner.Container>
        <Banner.Header type="inactive">
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
          <Icon name="Close" size="large" />
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
      </Banner.Container>
    )
  } else return null
}
