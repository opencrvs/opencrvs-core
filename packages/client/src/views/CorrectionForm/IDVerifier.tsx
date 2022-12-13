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
import * as React from 'react'
import styled from '@client/styledComponents'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { identityNameMapper } from '@client/forms/identity'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { formatLongDate } from '@client/utils/date-formatting'
import { Content } from '@opencrvs/components/lib/Content'
import { Summary } from '@opencrvs/components/lib/Summary'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

interface IVerifierActionProps {
  positiveAction: {
    label: string
    handler: () => void
  }
  negativeAction: {
    label: string
    handler: () => void
  }
}

export interface ICorrectorInfo {
  iD: string | undefined
  iDType: string | undefined
  firstNames: string | undefined
  familyName: string | undefined
  birthDate: string | undefined
  nationality: string | undefined
}

interface IIDVerifierProps {
  id?: string
  title: string
  correctorInformation?: ICorrectorInfo
  actionProps: IVerifierActionProps
}

interface IIDVerifierState {
  showPrompt: boolean
}

class IDVerifierComponent extends React.Component<
  IIDVerifierProps & IntlShapeProps,
  IIDVerifierState
> {
  state = { showPrompt: false }

  togglePrompt = () => {
    this.setState((prevState) => ({ showPrompt: !prevState.showPrompt }))
  }

  renderLabelValue = () => {
    const { correctorInformation, intl } = this.props

    return (
      <>
        {correctorInformation && correctorInformation.iD && (
          <Summary.Row
            label={intl.formatMessage(constantsMessages.id)}
            value={
              intl.formatMessage(
                identityNameMapper(correctorInformation.iDType as string)
              ) +
              ' | ' +
              correctorInformation.iD
            }
          />
        )}
        {correctorInformation && correctorInformation.firstNames && (
          <Summary.Row
            label={intl.formatMessage(certificateMessages.firstName)}
            value={String(correctorInformation.firstNames)}
          />
        )}

        {correctorInformation && correctorInformation.familyName && (
          <Summary.Row
            label={intl.formatMessage(certificateMessages.familyName)}
            value={String(correctorInformation.familyName)}
          />
        )}

        {correctorInformation && correctorInformation.birthDate && (
          <Summary.Row
            label={intl.formatMessage(certificateMessages.dateOfBirth)}
            value={formatLongDate(
              correctorInformation.birthDate as string,
              intl.locale
            )}
          />
        )}

        {correctorInformation && correctorInformation.nationality && (
          <Summary.Row
            label={intl.formatMessage(certificateMessages.nationality)}
            value={intl.formatMessage(
              countryMessages[correctorInformation.nationality as string]
            )}
          />
        )}
      </>
    )
  }

  render() {
    const { positiveAction, negativeAction } = this.props.actionProps
    const { showPrompt } = this.state
    const { correctorInformation, intl, id } = this.props

    return (
      <div id={id}>
        <Content
          title={this.props.title}
          showTitleOnMobile={true}
          bottomActionButtons={[
            <Button
              id="verifyPositive"
              key="verifyPositive"
              type="positive"
              size="large"
              onClick={positiveAction.handler}
            >
              <Icon color="currentColor" name="Check" size="large" />
              {positiveAction.label}
            </Button>,
            <Button
              id="verifyNegative"
              key="verifyNegative"
              type="negative"
              size="large"
              onClick={this.togglePrompt}
            >
              <Icon color="currentColor" name="X" size="large" />
              {negativeAction.label}
            </Button>
          ]}
        >
          {correctorInformation && <Summary>{this.renderLabelValue()}</Summary>}
        </Content>
        <ResponsiveModal
          id="withoutVerificationPrompt"
          show={showPrompt}
          title={intl.formatMessage(certificateMessages.idCheckDialogTitle)}
          contentHeight={96}
          handleClose={this.togglePrompt}
          actions={[
            <TertiaryButton
              id="cancel"
              key="cancel"
              onClick={this.togglePrompt}
            >
              {intl.formatMessage(certificateMessages.idCheckDialogCancel)}
            </TertiaryButton>,
            <PrimaryButton
              id="send"
              key="continue"
              onClick={() => {
                this.props.actionProps.negativeAction.handler()
                this.togglePrompt()
              }}
            >
              {intl.formatMessage(certificateMessages.idCheckDialogConfirm)}
            </PrimaryButton>
          ]}
        >
          {intl.formatMessage(
            certificateMessages.correctorIDCheckDialogDescription
          )}
        </ResponsiveModal>
      </div>
    )
  }
}

export const IDVerifier = injectIntl(IDVerifierComponent)
