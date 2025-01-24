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

import {
  ICertificate,
  IDeclaration,
  IPrintableDeclaration,
  modifyDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { formatUrl, generateGoToHomeTabUrl } from '@client/navigation'
import { useIntl } from 'react-intl'
import * as React from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import {
  calculatePrice,
  getEventDate,
  getRegisteredDate,
  getServiceMessage
} from '@client/views/PrintCertificate/utils'
import {
  ActionPageLight,
  Content,
  ContentSize,
  Summary,
  Currency,
  ResponsiveModal
} from '@opencrvs/components/lib'
import { TertiaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/certificate'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { useDispatch, useSelector } from 'react-redux'
import { EventType } from '@client/utils/gateway'
import { Button } from '@opencrvs/components/src/Button'
import { SubmissionAction } from '@client/forms'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import { useState } from 'react'
import { useDeclaration } from '@client/declarations/selectors'

export const IssuePayment = () => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const offlineCountryConfig = useSelector<IStoreState, any>((state) =>
    getOfflineData(state)
  )
  const { registrationId, eventType } = useParams<{
    registrationId: string
    eventType: string
  }>()
  const event = getEvent(eventType)
  const declaration = useSelector<IStoreState, IPrintableDeclaration>(
    (state) =>
      state.declarationsState.declarations.find(
        (app) => app.id === registrationId && app.event === event
      ) as IPrintableDeclaration
  )
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const draft = useDeclaration<IDeclaration>(registrationId)

  const readyToIssue = () => {
    if (draft === undefined) {
      // eslint-disable-next-line no-console
      console.error('draft is undefined')
      return
    }
    const registeredDate = getRegisteredDate(declaration.data)
    const certificate = declaration.data.registration.certificates[0]
    const eventDate = getEventDate(declaration.data, event)
    draft.submissionStatus = SUBMISSION_STATUS.READY_TO_ISSUE
    draft.action = SubmissionAction.ISSUE_DECLARATION

    const paymentAmount = calculatePrice(
      event,
      eventDate,
      registeredDate,
      offlineCountryConfig,
      certificate as ICertificate
    )
    certificate.payments = {
      type: 'MANUAL' as const,
      amount: Number(paymentAmount),
      outcome: 'COMPLETED' as const,
      date: new Date().toISOString()
    }
    dispatch(modifyDeclaration(draft))
    dispatch(writeDeclaration(declaration))

    navigate(
      generateGoToHomeTabUrl({
        tabId: WORKQUEUE_TABS.readyToIssue
      })
    )
  }

  const toggleModal = () => {
    setShowConfirmationModal(!showConfirmationModal)
  }

  if (!declaration) {
    return (
      <Navigate
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyToIssue,
          selectorId: ''
        })}
      />
    )
  }

  const registeredDate = getRegisteredDate(declaration.data)

  const eventDate = getEventDate(declaration.data, event)

  const paymentAmount = calculatePrice(
    event,
    eventDate,
    registeredDate,
    offlineCountryConfig,
    declaration.data.registration.certificates[0]
  )

  const serviceMessage = getServiceMessage(
    intl,
    event,
    eventDate,
    registeredDate,
    offlineCountryConfig
  )

  const titleMessage =
    paymentAmount === 0
      ? intl.formatMessage(messages.noPayment)
      : intl.formatMessage(messages.payment)

  return (
    <>
      <ActionPageLight
        title={intl.formatMessage(issueMessages.issueCertificate)}
        goBack={() => navigate(-1)}
        hideBackground
        goHome={() =>
          navigate(
            generateGoToHomeTabUrl({
              tabId: WORKQUEUE_TABS.readyToIssue
            })
          )
        }
      >
        <Content
          title={titleMessage}
          size={ContentSize.SMALL}
          showTitleOnMobile
          bottomActionButtons={[
            <Button
              key="Continue"
              id="Continue"
              type="primary"
              size="large"
              fullWidth
              onClick={() => toggleModal()}
            >
              {intl.formatMessage(issueMessages.issueCertificate)}
            </Button>
          ]}
        >
          <Summary id="summary">
            <Summary.Row
              id="service"
              label={intl.formatMessage(messages.receiptService)}
              value={serviceMessage}
            />
            <Summary.Row
              id="amountDue"
              label={intl.formatMessage(messages.amountDue)}
              value={
                <Currency
                  value={paymentAmount}
                  currency={offlineCountryConfig.config.CURRENCY.isoCode}
                  languagesAndCountry={
                    offlineCountryConfig.config.CURRENCY.languagesAndCountry[0]
                  }
                />
              }
            />
          </Summary>
        </Content>
        <ResponsiveModal
          id="issue-certificate-confirm"
          title={intl.formatMessage(issueMessages.issueCertificate)}
          responsive={false}
          autoHeight={true}
          show={showConfirmationModal}
          handleClose={toggleModal}
          actions={[
            <TertiaryButton
              key="close-issue-modal"
              onClick={toggleModal}
              id="close-issue-modal"
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </TertiaryButton>,
            <Button
              key="issue-certificate-confirmation"
              onClick={() => readyToIssue()}
              id="issue-certificate-confirmation"
              type={'primary'}
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </Button>
          ]}
        >
          {intl.formatMessage(issueMessages.issueConfirmationMessage)}
        </ResponsiveModal>
      </ActionPageLight>
    </>
  )
}

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return EventType.Birth
    case 'death':
      return EventType.Death
    case 'marriage':
      return EventType.Marriage
  }
}
