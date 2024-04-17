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
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { ProfileMenu } from '@client/components/ProfileMenu'
import {
  InputField,
  TextArea,
  TextInput,
  Button,
  Icon,
  ResponsiveModal
} from '@opencrvs/components'
import styled from 'styled-components'
import { useLazyQuery } from '@apollo/client'
import { EMAIL_ALL_USERS } from '@client/views/SysAdmin/Communications/AllUserEmail/queries'
import { useDispatch } from 'react-redux'
import { toggleEmailAllUsersFeedbackToast } from '@client/notification/actions'

const Form = styled.form`
  & > :not(:last-child) {
    margin-bottom: 24px;
  }
`
const FullWidthInputField = styled(InputField)`
  input {
    width: 100%;
  }
`
const AllUserEmail = () => {
  const intl = useIntl()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [sendEmail, { data, error }] = useLazyQuery(EMAIL_ALL_USERS)
  const dispatch = useDispatch()
  const hideModal = () => setConfirmationModalOpen(false)
  const resetForm = () => {
    setSubject('')
    setBody('')
  }
  const handleConfirmSubmit = () => {
    sendEmail({
      variables: {
        subject,
        body,
        locale: intl.locale
      }
    })
    hideModal()
    resetForm()
  }

  useEffect(() => {
    if (data) {
      dispatch(
        toggleEmailAllUsersFeedbackToast({ visible: true, type: 'success' })
      )
    }
  }, [data, dispatch])

  useEffect(() => {
    if (error) {
      dispatch(
        toggleEmailAllUsersFeedbackToast({ visible: true, type: 'error' })
      )
    }
  }, [error, dispatch])

  return (
    <>
      <Frame
        header={
          <AppBar
            desktopLeft={<HistoryNavigator />}
            desktopRight={<ProfileMenu key="profileMenu" />}
            mobileLeft={<HistoryNavigator hideForward />}
            mobileTitle={intl.formatMessage(messages.emailAllUsersTitle)}
          />
        }
        navigation={<Navigation />}
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Content
          title={intl.formatMessage(messages.emailAllUsersTitle)}
          titleColor="copy"
          subtitle={intl.formatMessage(messages.emailAllUsersSubtitle)}
        >
          <Form
            onSubmit={(e) => {
              e.preventDefault()
              setConfirmationModalOpen(true)
            }}
          >
            <FullWidthInputField
              id="subject"
              label={intl.formatMessage(constantsMessages.emailSubject)}
              touched={false}
              required={true}
              hideAsterisk
            >
              <TextInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </FullWidthInputField>
            <FullWidthInputField
              id="body"
              label={intl.formatMessage(constantsMessages.emailBody)}
              touched={false}
              required={true}
              hideAsterisk
            >
              <TextArea
                ignoreMediaQuery
                {...{
                  value: body,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    setBody(e.target.value)
                }}
              />
            </FullWidthInputField>
            <Button type="primary" disabled={!subject || !body}>
              <Icon name="PaperPlaneTilt" size="medium" />
              {intl.formatMessage(buttonMessages.send)}
            </Button>
          </Form>
        </Content>
      </Frame>
      <ResponsiveModal
        title={intl.formatMessage(messages.emailAllUsersModalTitle)}
        show={isConfirmationModalOpen}
        handleClose={hideModal}
        autoHeight
        actions={[
          <Button key="cancel" type="tertiary" onClick={hideModal}>
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmSubmit}>
            {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        ]}
      >
        {intl.formatMessage(messages.emailAllUsersModalSupportingCopy)}
      </ResponsiveModal>
    </>
  )
}

export default AllUserEmail
