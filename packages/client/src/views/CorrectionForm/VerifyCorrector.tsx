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
import {
  modifyDeclaration,
  IDeclaration,
  writeDeclaration
} from '@client/declarations'
import { ReviewSection } from '@client/forms'
import { messages } from '@client/i18n/messages/views/correction'
import { goBack, goToPageGroup, goToHomeTab } from '@client/navigation'
import { IStoreState } from '@client/store'
import {
  IDVerifier,
  ICorrectorInfo
} from '@client/views/CorrectionForm/IDVerifier'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { CERTIFICATE_CORRECTION_REVIEW } from '@client/navigation/routes'
import { getVerifyCorrectorDefinition } from '@client/forms/correction/verifyCorrector'
import { TimeMounted } from '@client/components/TimeMounted'
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
  birthDateField?: string
  nationalityField?: string
}

export interface ICertificateCorrectorDefinition {
  [corrector: string]: ICertificateCorrectorField
}

interface IMatchParams {
  declarationId: string
  corrector: string
}

interface IStateProps {
  declaration: IDeclaration
  form: ICertificateCorrectorDefinition
}
interface IDispatchProps {
  goBack: typeof goBack
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
  goToPageGroup: typeof goToPageGroup
  goToHomeTab: typeof goToHomeTab
}

type IOwnProps = RouteComponentProps<IMatchParams>

type IFullProps = IStateProps & IDispatchProps & IOwnProps & IntlShapeProps

class VerifyCorrectorComponent extends React.Component<IFullProps> {
  handleVerification = (hasShowedVerifiedDocument: boolean) => {
    const declaration = this.props.declaration
    const changed = {
      ...declaration,
      data: {
        ...declaration.data,
        corrector: {
          ...declaration.data.corrector,
          hasShowedVerifiedDocument
        }
      }
    }
    this.props.modifyDeclaration(changed)

    this.props.writeDeclaration(changed)

    this.props.goToPageGroup(
      CERTIFICATE_CORRECTION_REVIEW,
      this.props.declaration.id,
      ReviewSection.Review,
      'review-view-group',
      this.props.declaration.event
    )
  }

  getGenericCorrectorInfo = (corrector: string): ICorrectorInfo => {
    const { intl, declaration, form } = this.props
    const info = declaration.data[corrector]
    //TODO :: we have to get form defination from new certificateCorrectorDefination
    const showInfoFor = ['mother', 'father', 'child', 'informant']
    if (showInfoFor.includes(corrector)) {
      const fields = form[corrector]
      const iD = info[fields.identifierField] as string
      const iDType = (info[fields.identifierTypeField] ||
        info[fields.identifierOtherTypeField]) as string

      const firstNameIndex = fields.nameFields[intl.locale]
        ? fields.nameFields[intl.locale].firstNamesField
        : fields.nameFields[intl.defaultLocale].firstNamesField

      const familyNameIndex = fields.nameFields[intl.locale]
        ? fields.nameFields[intl.locale].familyNameField
        : fields.nameFields[intl.defaultLocale].familyNameField

      const firstNames = info[firstNameIndex] as string
      const familyName = info[familyNameIndex] as string

      const birthDate =
        (fields.birthDateField && (info[fields.birthDateField] as string)) || ''
      const nationality =
        (fields.nationalityField &&
          (info[fields.nationalityField] as string)) ||
        ''

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

  logTime = (timeMs: number) => {
    const declaration = this.props.declaration
    if (!declaration.timeLoggedMS) {
      declaration.timeLoggedMS = 0
    }
    declaration.timeLoggedMS += timeMs
    this.props.modifyDeclaration(declaration)
  }

  render() {
    const { corrector } = this.props.match.params
    const { intl } = this.props
    const correctorInfo = this.getGenericCorrectorInfo(corrector)
    const hasNoInfo = Object.values(correctorInfo).every(
      (property) => property === undefined || property === ''
    )

    return (
      <TimeMounted onUnmount={this.logTime}>
        <ActionPageLight
          goBack={this.props.goBack}
          goHome={() => this.props.goToHomeTab('review')}
          title={intl.formatMessage(messages.title)}
          hideBackground
        >
          {
            <IDVerifier
              id="idVerifier"
              title={
                hasNoInfo
                  ? intl.formatMessage(messages.otherIdCheckTitle)
                  : intl.formatMessage(messages.idCheckTitle)
              }
              correctorInformation={(!hasNoInfo && correctorInfo) || undefined}
              actionProps={{
                positiveAction: {
                  label: intl.formatMessage(messages.idCheckVerify),
                  handler: () => {
                    this.handleVerification(false)
                  }
                },
                negativeAction: {
                  label: intl.formatMessage(messages.idCheckWithoutVerify),
                  handler: () => {
                    this.handleVerification(true)
                  }
                }
              }}
            />
          }
        </ActionPageLight>
      </TimeMounted>
    )
  }
}

const mapStateToProps = (
  state: IStoreState,
  ownProps: IOwnProps
): IStateProps => {
  const { declarationId } = ownProps.match.params

  const declaration = state.declarationsState.declarations.find(
    (draft) => draft.id === declarationId
  )

  if (!declaration) {
    throw new Error(`Draft "${declarationId}" missing!`)
  }

  return {
    declaration,
    form: getVerifyCorrectorDefinition(declaration.event)
  }
}

export const VerifyCorrector = connect(mapStateToProps, {
  goBack,
  modifyDeclaration,
  writeDeclaration,
  goToPageGroup,
  goToHomeTab
})(injectIntl(VerifyCorrectorComponent))
