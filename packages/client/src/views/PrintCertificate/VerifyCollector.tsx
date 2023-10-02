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
import {
  IPrintableDeclaration,
  modifyDeclaration,
  writeDeclaration
} from '@client/declarations'
import { Event } from '@client/utils/gateway'
import { messages } from '@client/i18n/messages/views/certificate'
import {
  formatUrl,
  goBack,
  goToHomeTab,
  goToIssueCertificatePayment,
  goToPrintCertificatePayment,
  goToReviewCertificate
} from '@client/navigation'
import { IStoreState } from '@client/store'
import {
  IDVerifier,
  ICollectorInfo
} from '@client/views/PrintCertificate/IDVerifier'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Redirect, RouteComponentProps } from 'react-router'
import { getEventDate, getRegisteredDate, isFreeOfCost } from './utils'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  IVerifyIDCertificateCollectorField,
  verifyIDOnDeclarationCertificateCollectorDefinition
} from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { issueMessages } from '@client/i18n/messages/issueCertificate'

interface IMatchParams {
  registrationId: string
  eventType: Event
  collector: string
}

interface IStateProps {
  declaration: IPrintableDeclaration
  offlineCountryConfiguration: IOfflineData
}
interface IDispatchProps {
  goBack: typeof goBack
  goToHomeTab: typeof goToHomeTab
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
  goToReviewCertificate: typeof goToReviewCertificate
  goToPrintCertificatePayment: typeof goToPrintCertificatePayment
  goToIssueCertificatePayment: typeof goToIssueCertificatePayment
}

type IOwnProps = RouteComponentProps<IMatchParams> & IntlShapeProps

type IFullProps = IStateProps & IDispatchProps & IOwnProps

class VerifyCollectorComponent extends React.Component<IFullProps> {
  handleVerification = (hasShowedVerifiedDocument: boolean) => {
    const isIssueUrl = window.location.href.includes('issue')
    const event = this.props.declaration.event
    const eventDate = getEventDate(this.props.declaration.data, event)
    const registeredDate = getRegisteredDate(this.props.declaration.data)
    const { offlineCountryConfiguration } = this.props

    const declaration = { ...this.props.declaration }
    if (declaration.data.registration.certificates.length) {
      declaration.data.registration.certificates[0].hasShowedVerifiedDocument =
        hasShowedVerifiedDocument
    }

    this.props.modifyDeclaration(declaration)
    this.props.writeDeclaration(declaration)

    if (
      isFreeOfCost(
        event,
        eventDate,
        registeredDate,
        offlineCountryConfiguration
      )
    ) {
      if (!isIssueUrl) {
        this.props.goToReviewCertificate(
          this.props.match.params.registrationId,
          event
        )
      } else {
        this.props.goToIssueCertificatePayment(
          this.props.match.params.registrationId,
          event
        )
      }
    } else {
      if (!isIssueUrl) {
        this.props.goToPrintCertificatePayment(
          this.props.match.params.registrationId,
          event
        )
      } else {
        this.props.goToIssueCertificatePayment(
          this.props.match.params.registrationId,
          event
        )
      }
    }
  }

  getGenericCollectorInfo = (collector: string): ICollectorInfo => {
    const { intl, declaration } = this.props
    const info = declaration.data[collector]

    const fields = verifyIDOnDeclarationCertificateCollectorDefinition[
      declaration.event
    ][collector] as IVerifyIDCertificateCollectorField

    const iD = info[fields.identifierField] as string
    const iDType = (info[fields.identifierTypeField] ||
      info[fields.identifierOtherTypeField]) as string

    const firstNameIndex = (
      fields.nameFields[intl.locale] || fields.nameFields[intl.defaultLocale]
    ).firstNamesField

    const familyNameIndex = (
      fields.nameFields[intl.locale] || fields.nameFields[intl.defaultLocale]
    ).familyNameField

    const firstNames = info[firstNameIndex] as string
    const familyName = info[familyNameIndex] as string

    const isExactDobUnknownForIdVerifier =
      !!declaration?.data[collector]?.exactDateOfBirthUnknown

    const birthDate =
      fields.birthDateField && !isExactDobUnknownForIdVerifier
        ? (info[fields.birthDateField] as string)
        : ''
    const nationality = info[fields.nationalityField] as string

    return {
      iD,
      iDType,
      firstNames,
      familyName,
      birthDate,
      nationality
    }
  }

  render() {
    const { collector } = this.props.match.params
    const { intl } = this.props
    const isIssueUrl = window.location.href.includes('issue')
    const titleMessage = isIssueUrl
      ? intl.formatMessage(issueMessages.issueCertificate)
      : intl.formatMessage(messages.certificateCollectionTitle)

    if (!this.props.declaration) {
      return (
        <Redirect
          to={formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.readyToPrint,
            selectorId: ''
          })}
        />
      )
    }
    if (!this.props.declaration && isIssueUrl) {
      return (
        <Redirect
          to={formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.readyToIssue,
            selectorId: ''
          })}
        />
      )
    }
    return (
      <ActionPageLight
        goBack={this.props.goBack}
        hideBackground
        title={titleMessage}
        goHome={() =>
          isIssueUrl
            ? this.props.goToHomeTab(WORKQUEUE_TABS.readyToIssue)
            : this.props.goToHomeTab(WORKQUEUE_TABS.readyToPrint)
        }
      >
        <IDVerifier
          id="idVerifier"
          title={intl.formatMessage(messages.idCheckTitle)}
          collectorInformation={this.getGenericCollectorInfo(collector)}
          actionProps={{
            positiveAction: {
              label: intl.formatMessage(messages.idCheckVerify),
              handler: () => this.handleVerification(true)
            },
            negativeAction: {
              label: intl.formatMessage(messages.idCheckWithoutVerify),
              handler: () => this.handleVerification(false)
            }
          }}
        />
      </ActionPageLight>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  ownProps: IOwnProps
): IStateProps => {
  const { registrationId } = ownProps.match.params

  const declaration = state.declarationsState.declarations.find(
    (draft) => draft.id === registrationId
  ) as IPrintableDeclaration

  return {
    declaration,
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const VerifyCollector = connect(mapStateToProps, {
  goBack,
  goToHomeTab,
  modifyDeclaration,
  writeDeclaration,
  goToReviewCertificate,
  goToPrintCertificatePayment,
  goToIssueCertificatePayment
})(injectIntl(VerifyCollectorComponent))
