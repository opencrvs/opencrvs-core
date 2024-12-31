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
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Button } from '@opencrvs/components/lib/Button'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Currency } from '@opencrvs/components/lib/Currency'
import { IPrintableDeclaration, modifyDeclaration } from '@client/declarations'
import { EventType } from '@client/utils/gateway'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/certificate'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generateReviewCertificateUrl
} from '@client/navigation'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { ITheme } from '@opencrvs/components/lib/theme'
import React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'

import { withTheme } from 'styled-components'
import {
  calculatePrice,
  getEventDate,
  getRegisteredDate,
  getServiceMessage
} from './utils'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { Summary } from '@opencrvs/components/lib/Summary'
import { UserDetails } from '@client/utils/userUtils'

interface IProps {
  event: EventType
  registrationId?: string
  language: string
  declaration: IPrintableDeclaration
  theme: ITheme
  userDetails: UserDetails | null
  offlineCountryConfig: IOfflineData
}

interface IDispatchProps {
  modifyDeclaration: typeof modifyDeclaration
}

type IFullProps = RouteComponentProps & IProps & IntlShapeProps & IDispatchProps

const PaymentComponent = ({
  declaration,
  intl,
  event,
  offlineCountryConfig,
  modifyDeclaration,
  registrationId
}: IFullProps) => {
  const navigate = useNavigate()
  const handleContinue = (paymentAmount: string) => {
    const certificates =
      declaration && declaration.data.registration.certificates

    const certificate = (certificates && certificates[0]) || {}

    modifyDeclaration({
      ...declaration,
      data: {
        ...declaration.data,
        registration: {
          ...declaration.data.registration,
          certificates: [
            {
              ...certificate,
              payments: {
                type: 'MANUAL' as const,
                amount: Number(paymentAmount),
                outcome: 'COMPLETED' as const,
                date: new Date().toISOString()
              }
            }
          ]
        }
      }
    })

    if (!registrationId) {
      // eslint-disable-next-line no-console
      console.error('No registrationId in URL')
      return
    }

    navigate(
      generateReviewCertificateUrl({
        registrationId,
        event
      }),
      {
        state: { isNavigatedInsideApp: true }
      }
    )
  }

  if (!declaration) {
    return (
      <Navigate
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyToPrint,
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

  return (
    <>
      <ActionPageLight
        title={intl.formatMessage(messages.print)}
        goBack={() => navigate(-1)}
        hideBackground
        goHome={() =>
          navigate(
            generateGoToHomeTabUrl({
              tabId: WORKQUEUE_TABS.readyToPrint
            })
          )
        }
      >
        <Content
          title={intl.formatMessage(messages.payment)}
          size={ContentSize.SMALL}
          showTitleOnMobile
          bottomActionButtons={[
            <Button
              key="Continue"
              id="Continue"
              type="primary"
              size="large"
              fullWidth
              onClick={() => handleContinue(paymentAmount.toString())}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
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

function mapStatetoProps(state: IStoreState, props: RouteComponentProps) {
  const { registrationId, eventType } = props.router.params
  const event = getEvent(eventType)
  const declaration = state.declarationsState.declarations.find(
    (app) => app.id === registrationId && app.event === event
  ) as IPrintableDeclaration

  return {
    event,
    registrationId,
    language: state.i18n.language,
    declaration,
    userDetails: getUserDetails(state),
    offlineCountryConfig: getOfflineData(state)
  }
}

export const Payment = withRouter(
  connect(mapStatetoProps, {
    modifyDeclaration
  })(injectIntl(withTheme(PaymentComponent)))
)
