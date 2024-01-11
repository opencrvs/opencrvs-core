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
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Content } from '@opencrvs/components/lib/Content'
import { Currency } from '@opencrvs/components/lib/Currency'
import { IPrintableDeclaration, modifyDeclaration } from '@client/declarations'
import { Event } from '@client/utils/gateway'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/certificate'
import {
  formatUrl,
  goBack as goBackAction,
  goToHomeTab,
  goToReviewCertificate as goToReviewCertificateAction
} from '@client/navigation'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { ITheme } from '@opencrvs/components/lib/theme'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import styled, { withTheme } from 'styled-components'
import {
  calculatePrice,
  getEventDate,
  getRegisteredDate,
  getServiceMessage
} from './utils'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { Summary } from '@opencrvs/components/lib/Summary'
import { UserDetails } from '@client/utils/userUtils'

const Action = styled.div`
  margin-top: 32px;
`

interface IProps {
  event: Event
  registrationId: string
  language: string
  declaration: IPrintableDeclaration
  theme: ITheme
  modifyDeclaration: typeof modifyDeclaration
  goToReviewCertificate: typeof goToReviewCertificateAction
  goBack: typeof goBackAction
  goToHomeTab: typeof goToHomeTab
  userDetails: UserDetails | null
  offlineCountryConfig: IOfflineData
}

type IFullProps = IProps & IntlShapeProps

class PaymentComponent extends React.Component<IFullProps> {
  continue = (paymentAmount: string) => {
    const { declaration } = this.props
    const certificates =
      declaration && declaration.data.registration.certificates

    const certificate = (certificates && certificates[0]) || {}

    this.props.modifyDeclaration({
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

    this.props.goToReviewCertificate(
      this.props.registrationId,
      this.props.event
    )
  }

  render = () => {
    const { intl, declaration, event, goBack, offlineCountryConfig } =
      this.props
    if (!declaration) {
      return (
        <Redirect
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
      offlineCountryConfig
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
          goBack={goBack}
          hideBackground
          goHome={() => this.props.goToHomeTab(WORKQUEUE_TABS.readyToPrint)}
        >
          <Content
            title={intl.formatMessage(messages.payment)}
            showTitleOnMobile
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
                      offlineCountryConfig.config.CURRENCY
                        .languagesAndCountry[0]
                    }
                  />
                }
              />
            </Summary>
            <Action>
              <PrimaryButton
                id="Continue"
                onClick={() => this.continue(paymentAmount.toString())}
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </PrimaryButton>
            </Action>
          </Content>
        </ActionPageLight>
      </>
    )
  }
}

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.Birth
    case 'death':
      return Event.Death
    case 'marriage':
      return Event.Marriage
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ registrationId: string; eventType: string }>
) {
  const { registrationId, eventType } = props.match.params
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

export const Payment = connect(mapStatetoProps, {
  goBack: goBackAction,
  goToHomeTab,
  modifyDeclaration,
  goToReviewCertificate: goToReviewCertificateAction
})(injectIntl(withTheme(PaymentComponent)))
