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
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { identityNameMapper } from '@client/forms/identity'
import { LabelValuePair } from '@opencrvs/components/lib/ViewData'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { formatLongDate } from '@client/utils/date-formatting'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
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

export interface ICollectorInfo {
  iD: string
  iDType: string
  firstNames: string
  familyName: string
  birthDate?: string
  nationality: string
}

const Container = styled.div`
  z-index: 1;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: 768px) {
    padding: 0px;
  }
`

interface IIDVerifierProps {
  id?: string
  title: string
  collectorInformation: ICollectorInfo
  actionProps: IVerifierActionProps
}

const ActionContainer = styled.div`
  flex-flow: row wrap;
  margin-top: 24px;

  & > button {
    margin: 0 8px 8px 0;
  }

  & > button:last-child {
    margin-right: 0;
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
    const { collectorInformation, intl } = this.props

    return (
      <>
        {collectorInformation.iD && (
          <LabelValuePair
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
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.firstName)}
            value={String(collectorInformation.firstNames)}
          />
        )}

        {collectorInformation.familyName && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.familyName)}
            value={String(collectorInformation.familyName)}
          />
        )}

        {collectorInformation.birthDate && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.dateOfBirth)}
            value={formatLongDate(
              collectorInformation.birthDate as string,
              intl.locale
            )}
          />
        )}

        {collectorInformation.nationality && (
          <LabelValuePair
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
    const isIssueUrl = window.location.href.includes('issue')
    const modalTitle = isIssueUrl
      ? intl.formatMessage(issueMessages.idCheckWithoutVerify)
      : intl.formatMessage(certificateMessages.idCheckDialogTitle)

    return (
      <div id={id}>
        <Content title={this.props.title}>
          <Container>{this.renderLabelValue()}</Container>
          <ActionContainer>
            <Button
              id="verifyPositive"
              onClick={positiveAction.handler}
              type="positive"
            >
              <Icon name="Check" />
              {positiveAction.label}
            </Button>
            <Button
              id="verifyNegative"
              type="negative"
              onClick={this.togglePrompt}
            >
              <Icon name="X" />
              {negativeAction.label}
            </Button>
          </ActionContainer>
        </Content>

        <Dialog
          id="withoutVerificationPrompt"
          title={modalTitle}
          supportingCopy={intl.formatMessage(
            certificateMessages.idCheckDialogDescription
          )}
          onOpen={showPrompt}
          onClose={this.togglePrompt}
          actions={[
            <Button
              id="cancel"
              key="cancel"
              type="tertiary"
              onClick={this.togglePrompt}
            >
              {intl.formatMessage(certificateMessages.idCheckDialogCancel)}
            </Button>,
            <Button
              id="send"
              key="continue"
              type="primary"
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
