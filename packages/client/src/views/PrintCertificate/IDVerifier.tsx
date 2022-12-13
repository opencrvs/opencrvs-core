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
import { Content } from '@opencrvs/components/lib/Content'
import { Summary } from '@opencrvs/components/lib/Summary'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'

import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { identityNameMapper } from '@client/forms/identity'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { formatLongDate } from '@client/utils/date-formatting'

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

export interface ICollectorInfo {
  iD: string
  iDType: string
  firstNames: string
  familyName: string
  birthDate?: string
  nationality: string
}

interface IIDVerifierProps {
  id?: string
  title: string
  collectorInformation: ICollectorInfo
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
    const { collectorInformation, intl } = this.props

    return (
      <>
        {collectorInformation.iD && (
          <Summary.Row
            label={intl.formatMessage(constantsMessages.id)}
            value={
              intl.formatMessage(
                identityNameMapper(collectorInformation.iDType as string)
              ) +
              ' | ' +
              collectorInformation.iD
            }
          />
        )}
        {collectorInformation.firstNames && (
          <Summary.Row
            label={intl.formatMessage(certificateMessages.firstName)}
            value={String(collectorInformation.firstNames)}
          />
        )}

        <Summary.Row
          label={intl.formatMessage(certificateMessages.familyName)}
          value={String(collectorInformation.familyName)}
        />

        {collectorInformation.birthDate && (
          <Summary.Row
            label={intl.formatMessage(certificateMessages.dateOfBirth)}
            value={formatLongDate(
              collectorInformation.birthDate as string,
              intl.locale
            )}
          />
        )}

        {collectorInformation.nationality && (
          <Summary.Row
            label={intl.formatMessage(certificateMessages.nationality)}
            value={intl.formatMessage(
              countryMessages[collectorInformation.nationality as string]
            )}
          />
        )}
      </>
    )
  }

  render() {
    const { positiveAction, negativeAction } = this.props.actionProps
    const { showPrompt } = this.state
    const { intl, id } = this.props

    return (
      <div id={id}>
        <Content
          title={this.props.title}
          bottomActionButtons={[
            <Button
              id="verifyPositive"
              type="positive"
              size="large"
              onClick={positiveAction.handler}
            >
              <Icon color="currentColor" name="Check" size="large" />
              {positiveAction.label}
            </Button>,
            <Button
              id="verifyNegative"
              type="negative"
              size="large"
              onClick={this.togglePrompt}
            >
              <Icon color="currentColor" name="X" size="large" />
              {negativeAction.label}
            </Button>
          ]}
        >
          <Summary>{this.renderLabelValue()}</Summary>
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
          {intl.formatMessage(certificateMessages.idCheckDialogDescription)}
        </ResponsiveModal>
      </div>
    )
  }
}

export const IDVerifier = injectIntl(IDVerifierComponent)
