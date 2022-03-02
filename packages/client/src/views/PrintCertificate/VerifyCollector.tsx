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
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { IPrintableApplication, modifyApplication } from '@client/applications'
import { Event } from '@client/forms'
import { messages } from '@client/i18n/messages/views/certificate'
import {
  goBack,
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
import { RouteComponentProps } from 'react-router'
import { getEventDate, isFreeOfCost } from './utils'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  IVerifyIDCertificateCollectorField,
  verifyIDOnBirthCertificateCollectorDefinition
} from '@client/forms/certificate/fieldDefinitions/collectorSection'

interface IMatchParams {
  registrationId: string
  eventType: Event
  collector: string
}

interface IStateProps {
  application: IPrintableApplication
  offlineCountryConfiguration: IOfflineData
}
interface IDispatchProps {
  goBack: typeof goBack
  modifyApplication: typeof modifyApplication
  goToReviewCertificate: typeof goToReviewCertificate
  goToPrintCertificatePayment: typeof goToPrintCertificatePayment
}

type IOwnProps = RouteComponentProps<IMatchParams> & IntlShapeProps

type IFullProps = IStateProps & IDispatchProps & IOwnProps

class VerifyCollectorComponent extends React.Component<IFullProps> {
  handleVerification = () => {
    const event = this.props.application.event
    const eventDate = getEventDate(this.props.application.data, event)

    if (isFreeOfCost(event, eventDate)) {
      this.props.goToReviewCertificate(
        this.props.match.params.registrationId,
        event
      )
    } else {
      this.props.goToPrintCertificatePayment(
        this.props.match.params.registrationId,
        event
      )
    }
  }

  handleNegativeVerification = () => {
    const { application } = this.props
    const certificates = application.data.registration.certificates

    const certificate = (certificates && certificates[0]) || {}

    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        registration: {
          ...application.data.registration,
          certificates: [{ ...certificate, hasShowedVerifiedDocument: true }]
        }
      }
    })

    this.handleVerification()
  }

  getGenericCollectorInfo = (collector: string): ICollectorInfo => {
    const { intl, application, offlineCountryConfiguration } = this.props
    const info = application.data[collector]
    const fields = verifyIDOnBirthCertificateCollectorDefinition[
      application.event
    ][collector] as IVerifyIDCertificateCollectorField
    const iD = info[fields.identifierField] as string
    const iDType = (info[fields.identifierTypeField] ||
      info[fields.identifierOtherTypeField]) as string

    const firstNames = info[
      fields.nameFields[intl.locale].firstNamesField
    ] as string
    const familyName = info[
      fields.nameFields[intl.locale].familyNameField
    ] as string

    const birthDate = fields.birthDateField
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
    return (
      <ActionPageLight
        goBack={this.props.goBack}
        title={intl.formatMessage(messages.certificateCollectionTitle)}
      >
        <IDVerifier
          id="idVerifier"
          title={intl.formatMessage(messages.idCheckTitle)}
          collectorInformation={this.getGenericCollectorInfo(collector)}
          actionProps={{
            positiveAction: {
              label: intl.formatMessage(messages.idCheckVerify),
              handler: this.handleVerification
            },
            negativeAction: {
              label: intl.formatMessage(messages.idCheckWithoutVerify),
              handler: this.handleNegativeVerification
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

  const application = state.applicationsState.applications.find(
    (draft) => draft.id === registrationId
  ) as IPrintableApplication

  return {
    application,
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const VerifyCollector = connect(mapStateToProps, {
  goBack,
  modifyApplication,
  goToReviewCertificate,
  goToPrintCertificatePayment
})(injectIntl(VerifyCollectorComponent))
