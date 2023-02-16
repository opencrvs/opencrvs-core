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

import { IPrintableDeclaration, modifyDeclaration } from '@client/declarations'
import {
  formatUrl,
  goBack,
  goToHomeTab,
  goToReviewCertificate
} from '@client/navigation'
import { IOfflineData } from '@client/offline/reducer'
import { IUserDetails } from '@client/utils/userUtils'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import * as React from 'react'
import styled from 'styled-components'
import { Redirect, RouteComponentProps } from 'react-router'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import {
  calculatePrice,
  getEventDate,
  getRegisteredDate,
  getServiceMessage
} from '@client/views/PrintCertificate/utils'
import {
  ActionPageLight,
  Content,
  Summary,
  Currency,
  ResponsiveModal
} from '@client/../../components/lib'
import {
  PrimaryButton,
  SuccessButton,
  TertiaryButton
} from '@client/../../components/lib/buttons'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/certificate'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { connect } from 'react-redux'
import { Event } from '@client/utils/gateway'
import { getUserDetails } from '@client/profile/profileSelectors'
import { Button } from '@client/../../components/src/Button'

const Action = styled.div`
  margin-top: 32px;
`

const StyledLabel = styled.label`
  ${({ theme }) => theme.fonts.bold18};
  margin-right: 2px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.reg18};
`

function LabelValue({
  id,
  label,
  value
}: {
  id: string
  label: string
  value: React.ReactNode | string
}) {
  return (
    <div id={id}>
      <StyledLabel>{label}</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}

type State = {
  showConfirmationModal: boolean
}

interface IProps {
  event: Event
  registrationId: string
  language: string
  declaration: IPrintableDeclaration
  goBack: typeof goBack
  goToHomeTab: typeof goToHomeTab
  modifyDeclaration: typeof modifyDeclaration
  goToReviewCertificate: typeof goToReviewCertificate
  userDetails: IUserDetails | null
  offlineCountryConfig: IOfflineData
}

type IFullProps = IProps & IntlShapeProps

class IssuePaymentComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      showConfirmationModal: false
    }
  }
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
                total: Number(paymentAmount),
                amount: Number(paymentAmount),
                outcome: 'COMPLETED' as const,
                date: Date.now()
              }
            }
          ]
        }
      }
    })

    // this.props.goToReviewCertificate(
    //   this.props.registrationId,
    //   this.props.event
    // )
  }

  toggleModal = () => {
    this.setState({
      showConfirmationModal: !this.state.showConfirmationModal
    })
  }

  render = () => {
    const { intl, declaration, event, goBack, offlineCountryConfig } =
      this.props
    if (!declaration) {
      return (
        <Redirect
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
      offlineCountryConfig
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
          title={intl.formatMessage(constantsMessages.issueCertificate)}
          goBack={goBack}
          hideBackground
          goHome={() => this.props.goToHomeTab(WORKQUEUE_TABS.readyToIssue)}
        >
          <Content title={titleMessage}>
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
              <SuccessButton id="Continue" onClick={() => this.toggleModal()}>
                {intl.formatMessage(constantsMessages.issueCertificate)}
              </SuccessButton>
            </Action>
          </Content>
          <ResponsiveModal
            id="issue-certificate-confirm"
            title={intl.formatMessage(constantsMessages.issueCertificate)}
            responsive={false}
            autoHeight={true}
            show={this.state.showConfirmationModal}
            handleClose={this.toggleModal}
            actions={[
              <TertiaryButton onClick={this.toggleModal} id="close-issue-modal">
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <Button
                onClick={() => alert('confirm')}
                id="issue-certificate-confirmation"
                type={'primary'}
              >
                {intl.formatMessage(buttonMessages.confirm)}
              </Button>
            ]}
          >
            {intl.formatMessage(constantsMessages.issueConfirmationMessage)}
          </ResponsiveModal>
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

export const IssuePayment = connect(mapStatetoProps, {
  goBack: goBack,
  goToHomeTab,
  modifyDeclaration,
  goToReviewCertificate: goToReviewCertificate
})(injectIntl(IssuePaymentComponent))
