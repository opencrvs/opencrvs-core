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
import { messages } from '@client/i18n/messages/views/correction'
import { goBack } from '@client/navigation'
import { IStoreState } from '@client/store'
import {
  IDVerifier,
  ICorrectorInfo
} from '@client/views/CorrectionForm/IDVerifier'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
interface INameField {
  firstNamesField: string
  familyNameField: string
}
interface INameFields {
  [language: string]: INameField
}

export interface ICertificateCorrectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField: string
  nationalityField: string
}

export interface ICertificateCorrectorDefinition {
  [corrector: string]: ICertificateCorrectorField
}

interface IMatchParams {
  registrationId: string
  eventType: Event
  corrector: string
}

interface IStateProps {
  application: IPrintableApplication
  offlineResources: IOfflineData
}
interface IDispatchProps {
  goBack: typeof goBack
  modifyApplication: typeof modifyApplication
}

type IOwnProps = RouteComponentProps<IMatchParams>

type IFullProps = IStateProps & IDispatchProps & IOwnProps & IntlShapeProps

class VerifyCorrectorComponent extends React.Component<IFullProps> {
  /*
   * TODO: goto next form
   */
  handleVerification = () => {}

  handleNegativeVerification = () => {
    const { application } = this.props

    this.props.modifyApplication({
      ...application,
      data: {
        ...application.data,
        corrector: {
          ...application.data.corrector,
          hasShowedVerifiedDocument: true
        }
      }
    })

    this.handleVerification()
  }

  getGenericCorrectorInfo = (corrector: string): ICorrectorInfo => {
    const { intl, application, offlineResources } = this.props
    const info = application.data[corrector]
    //TODO :: we have to get form defination from new certificateCorrectorDefination
    const showInfoFor = ['mother', 'father', 'child', 'informant']
    if (showInfoFor.includes(corrector)) {
      const fields =
        offlineResources.forms.certificateCorrectorDefinition[
          application.event
        ][corrector]
      const iD = info[fields.identifierField] as string
      const iDType = (info[fields.identifierTypeField] ||
        info[fields.identifierOtherTypeField]) as string

      const firstNames = info[
        fields.nameFields[intl.locale].firstNamesField
      ] as string
      const familyName = info[
        fields.nameFields[intl.locale].familyNameField
      ] as string

      const birthDate = info[fields.birthDateField] as string
      const nationality = info[fields.nationalityField] as string

      return {
        iD,
        iDType,
        firstNames,
        familyName,
        birthDate,
        nationality
      }
    } else {
      return {
        iD: '',
        iDType: '',
        firstNames: '',
        familyName: '',
        birthDate: '',
        nationality: ''
      }
    }
  }

  render() {
    const { corrector } = this.props.match.params
    const { intl } = this.props
    const correctorInfo = this.getGenericCorrectorInfo(corrector)
    const hasNoInfo = Object.values(correctorInfo).every(
      (property) => property === undefined || property === ''
    )

    return (
      <ActionPageLight
        goBack={this.props.goBack}
        title={intl.formatMessage(messages.title)}
        hideBackground
      >
        {hasNoInfo ? (
          <IDVerifier
            id="idVerifier"
            title={
              hasNoInfo
                ? intl.formatMessage(messages.otherIdCheckTitle)
                : intl.formatMessage(messages.idCheckTitle)
            }
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
        ) : (
          <IDVerifier
            id="idVerifier"
            title={intl.formatMessage(messages.idCheckTitle)}
            correctorInformation={correctorInfo}
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
        )}
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
    offlineResources: getOfflineData(state)
  }
}

export const VerifyCorrector = connect(mapStateToProps, {
  goBack,
  modifyApplication
})(injectIntl(VerifyCorrectorComponent))
