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
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { identityNameMapper } from '@client/forms/identity'
import { LabelValuePair } from '@opencrvs/components/lib/ViewData'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { formatLongDate } from '@client/utils/date-formatting'
import { Content } from '@opencrvs/components/lib/Content'
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

const Container = styled.div`
  z-index: 1;
  padding: 16px 24px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: 768px) {
    padding: 0px;
  }
`
const UnderLayBackground = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.08;
  @media (max-width: 768px) {
    background-color: ${({ theme }) => theme.colors.white};
  }
`

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
          <LabelValuePair
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
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.firstName)}
            value={String(correctorInformation.firstNames)}
          />
        )}

        {correctorInformation && correctorInformation.familyName && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.familyName)}
            value={String(correctorInformation.familyName)}
          />
        )}

        {correctorInformation && correctorInformation.birthDate && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.dateOfBirth)}
            value={formatLongDate(
              correctorInformation.birthDate as string,
              intl.locale
            )}
          />
        )}

        {correctorInformation && correctorInformation.nationality && (
          <LabelValuePair
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

    const positiveActionButton = (
      <Button
        id="verifyPositive"
        key="verifyPositive"
        type="positive"
        onClick={positiveAction.handler}
      >
        <Icon name="Check" />
        {positiveAction.label}
      </Button>
    )

    const negativeActionButton = (
      <Button
        id="verifyNegative"
        key="verifyNegative"
        type="negative"
        onClick={this.togglePrompt}
      >
        <Icon name="X" />
        {negativeAction.label}
      </Button>
    )

    return (
      <div id={id}>
        <Content
          title={this.props.title}
          showTitleOnMobile={true}
          bottomActionButtons={[positiveActionButton, negativeActionButton]}
        >
          {correctorInformation && (
            <Container>
              <UnderLayBackground />
              {this.renderLabelValue()}
            </Container>
          )}
        </Content>
        <Dialog
          id="withoutVerificationPrompt"
          onOpen={showPrompt}
          title={intl.formatMessage(certificateMessages.idCheckDialogTitle)}
          supportingCopy={intl.formatMessage(
            certificateMessages.correctorIDCheckDialogDescription
          )}
          onClose={this.togglePrompt}
          actions={[
            <Button
              type="tertiary"
              id="cancel"
              key="cancel"
              onClick={this.togglePrompt}
            >
              {intl.formatMessage(certificateMessages.idCheckDialogCancel)}
            </Button>,
            <Button
              type="primary"
              id="send"
              key="continue"
              onClick={() => {
                this.props.actionProps.negativeAction.handler()
                this.togglePrompt()
              }}
            >
              {intl.formatMessage(certificateMessages.idCheckDialogConfirm)}
            </Button>
          ]}
        />
      </div>
    )
  }
}

export const IDVerifier = injectIntl(IDVerifierComponent)
