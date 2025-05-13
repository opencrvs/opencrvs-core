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
import { messages } from '@client/i18n/messages/views/certificate'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generateIssueCertificatePaymentUrl,
  generatePrintCertificatePaymentUrl,
  generateReviewCertificateUrl
} from '@client/navigation'
import { IStoreState } from '@client/store'
import {
  IDVerifier,
  ICollectorInfo
} from '@client/views/PrintCertificate/IDVerifier'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { getEventDate, getRegisteredDate, isFreeOfCost } from './utils'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  IVerifyIDCertificateCollectorField,
  verifyIDOnDeclarationCertificateCollectorDefinition
} from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import { draftToGqlTransformer } from '@client/transformer'
import { IForm } from '@client/forms'
import { getEventRegisterForm } from '@client/forms/register/declaration-selectors'
import { UserDetails } from '@client/utils/userUtils'
import { getUserDetails } from '@client/profile/profileSelectors'

interface IStateProps {
  registerForm: IForm
  declaration?: IPrintableDeclaration
  offlineCountryConfiguration: IOfflineData
  userDetails: UserDetails | null
}
interface IDispatchProps {
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
}

type IOwnProps = RouteComponentProps<IntlShapeProps>

type IFullProps = IStateProps & IDispatchProps & IOwnProps

class VerifyCollectorComponent extends React.Component<IFullProps> {
  handleVerification = (hasShowedVerifiedDocument: boolean) => {
    const isIssueUrl = window.location.href.includes('issue')

    const event = this.props.declaration!.event
    const eventDate = getEventDate(this.props.declaration!.data, event)
    const registeredDate = getRegisteredDate(this.props.declaration!.data)
    const { offlineCountryConfiguration } = this.props

    const declaration = { ...this.props.declaration! }
    if (declaration?.data?.registration.certificates.length) {
      declaration.data.registration.certificates[0].hasShowedVerifiedDocument =
        hasShowedVerifiedDocument
    }

    if (!this.props.router.match.params.registrationId) {
      // eslint-disable-next-line no-console
      console.error('No registrationId in URL')
      return
    }

    this.props.modifyDeclaration(declaration)
    this.props.writeDeclaration(declaration)

    if (
      isFreeOfCost(
        declaration.data.registration.certificates[0],
        eventDate,
        registeredDate,
        offlineCountryConfiguration
      )
    ) {
      if (!isIssueUrl) {
        this.props.router.navigate(
          generateReviewCertificateUrl({
            registrationId: this.props.router.match.params.registrationId,
            event
          }),
          {
            state: { isNavigatedInsideApp: true }
          }
        )
      } else {
        this.props.router.navigate(
          generateIssueCertificatePaymentUrl({
            registrationId: this.props.router.match.params.registrationId,
            event
          })
        )
      }
    } else {
      if (!isIssueUrl) {
        this.props.router.navigate(
          generatePrintCertificatePaymentUrl({
            registrationId: this.props.router.match.params.registrationId,
            event
          })
        )
      } else {
        this.props.router.navigate(
          generateIssueCertificatePaymentUrl({
            registrationId: this.props.router.match.params.registrationId,
            event
          })
        )
      }
    }
  }

  getGenericCollectorInfo = (collector: string): ICollectorInfo => {
    const { intl, declaration, registerForm } = this.props

    const info = declaration!.data[collector]

    const eventRegistrationInput = draftToGqlTransformer(
      registerForm,
      declaration!.data,
      declaration!.id,
      this.props.userDetails,
      this.props.offlineCountryConfiguration,
      declaration!.originalData
    )

    const informantType =
      eventRegistrationInput.registration.informantType.toLowerCase()

    const fields = verifyIDOnDeclarationCertificateCollectorDefinition[
      declaration!.event
    ][collector] as IVerifyIDCertificateCollectorField

    const iD =
      (collector === 'informant'
        ? eventRegistrationInput[informantType]?.identifier?.[0]?.id
        : undefined) ?? eventRegistrationInput[collector]?.identifier?.[0]?.id
    const iDType =
      (collector === 'informant'
        ? eventRegistrationInput[informantType]?.identifier?.[0]?.type
        : undefined) ?? eventRegistrationInput[collector]?.identifier?.[0]?.type

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

    const age = isExactDobUnknownForIdVerifier
      ? (info[fields.ageOfPerson as string] as string)
      : ''

    const nationality = info[fields.nationalityField] as string

    return {
      iD,
      iDType,
      firstNames,
      familyName,
      birthDate,
      nationality,
      age
    }
  }

  render() {
    const { collector } = this.props.router.params
    const { intl } = this.props
    const isIssueUrl = window.location.href.includes('issue')
    const titleMessage = isIssueUrl
      ? intl.formatMessage(issueMessages.issueCertificate)
      : intl.formatMessage(messages.certificateCollectionTitle)

    if (!this.props.declaration) {
      return (
        <Navigate
          to={formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.readyToPrint,
            selectorId: ''
          })}
        />
      )
    }
    if (!this.props.declaration && isIssueUrl) {
      return (
        <Navigate
          to={formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.readyToIssue,
            selectorId: ''
          })}
        />
      )
    }
    return (
      <ActionPageLight
        goBack={() => this.props.router.navigate(-1)}
        hideBackground
        title={titleMessage}
        goHome={() =>
          this.props.router.navigate(
            generateGoToHomeTabUrl({
              tabId: isIssueUrl
                ? WORKQUEUE_TABS.readyToIssue
                : WORKQUEUE_TABS.readyToPrint
            })
          )
        }
      >
        <IDVerifier
          id="idVerifier"
          title={intl.formatMessage(messages.idCheckTitle)}
          collectorInformation={this.getGenericCollectorInfo(collector!)}
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
  ownProps: RouteComponentProps
): IStateProps => {
  const { registrationId } = ownProps.router.match.params

  const declaration = state.declarationsState.declarations.find(
    (draft) => draft.id === registrationId
  ) as IPrintableDeclaration

  /**
   * ISSUE : The user clicks on the Back button after unasigning the declaration (in the case of printing)
   * SOLUTION : This condition enables the redirection to be activated when the declaration is not present in the State.
   */
  if (!declaration) {
    return {
      registerForm: {
        sections: []
      },
      declaration: undefined,
      offlineCountryConfiguration: getOfflineData(state),
      userDetails: getUserDetails(state)
    }
  }

  const registerForm = getEventRegisterForm(state, declaration.event)

  return {
    registerForm,
    declaration,
    offlineCountryConfiguration: getOfflineData(state),
    userDetails: getUserDetails(state)
  }
}

export const VerifyCollector = withRouter(
  connect(mapStateToProps, {
    modifyDeclaration,
    writeDeclaration
  })(injectIntl(VerifyCollectorComponent))
)
