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
import React, { useEffect } from 'react'
import { BannerType, IFormFieldValue, IFormSectionData } from '@client/forms'
import { useIntl } from 'react-intl'
import { Banner, Button, Text, ResponsiveModal } from '@opencrvs/components'
import { messages } from '@client/i18n/messages/views/id-verification'
import { useModal } from '@client/hooks/useModal'
import { buttonMessages } from '@client/i18n/messages'
import { VerificationPill } from './VerificationPill'
import { StatusIcon } from './StatusIcon'
import { useDeclaration } from '@client/declarations/selectors'
import { useSelector } from 'react-redux'
import { merge } from 'lodash'
import { useParams } from 'react-router-dom'
import { getUserDetails } from '@client/profile/profileSelectors'
import { writeDeclarationByUserWithoutStateUpdate } from '@client/declarations'

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

export const IDVerificationBanner = ({
  type,
  idFieldName,
  setFieldValue,
  form
}: {
  type: BannerType
  setFieldValue: (name: string, value: IFormFieldValue) => void
  idFieldName: string
  form: IFormSectionData
}) => {
  const intl = useIntl()
  const [modal, openModal] = useModal()
  const { declarationId = '', pageId: section } = useParams()
  const declaration = useDeclaration(declarationId)
  const userId = useSelector(getUserDetails)?.id
  useEffect(() => {
    if (
      (type === 'authenticated' || type === 'failedFetchIdDetails') &&
      !!form[idFieldName] &&
      !!declaration &&
      section &&
      userId
    ) {
      // update and save the declaration in indexedDB
      // to persist the ID verification details
      // we have to do it here because the updated values of entire section
      // of the fields depending on id field are not available
      // when the link button is rendered
      writeDeclarationByUserWithoutStateUpdate(userId, {
        ...declaration,
        data: {
          ...declaration.data,
          [section]: merge(declaration.data[section], form)
        }
      })
    }
  }, [declaration, form, idFieldName, section, type, userId])
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
          <VerificationPill type={type} />
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
          <VerificationPill type={type} />
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
          <VerificationPill type={type} />
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
  } else if (type === 'failedFetchIdDetails') {
    return (
      <Banner.Container>
        <Banner.Header type="inactive">
          <VerificationPill type={type} />
          <StatusIcon type={type} />
        </Banner.Header>
        <Banner.Body>
          <Text variant="reg16" element="span">
            {intl.formatMessage(messages.failedFetchIdDetails.description)}
          </Text>
        </Banner.Body>
        <Banner.Footer justifyContent="flex-end">
          <Button
            type="secondary"
            onClick={() => setFieldValue(idFieldName, '')}
          >
            {intl.formatMessage(messages.actions.reset)}
          </Button>
        </Banner.Footer>
        {modal}
      </Banner.Container>
    )
  } else return null
}
