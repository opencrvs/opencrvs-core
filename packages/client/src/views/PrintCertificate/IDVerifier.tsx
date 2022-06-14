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
import { Content } from '@opencrvs/components/lib/interface/Content'
import {
  SuccessButton,
  DangerButton,
  ICON_ALIGNMENT,
  TertiaryButton,
  PrimaryButton
} from '@opencrvs/components/lib/buttons'
import { Check, Cross } from '@opencrvs/components/lib/icons'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { identityNameMapper } from '@client/forms/identity'
import {
  ResponsiveModal,
  LabelValuePair
} from '@opencrvs/components/lib/interface'
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

        <LabelValuePair
          label={intl.formatMessage(certificateMessages.familyName)}
          value={String(collectorInformation.familyName)}
        />

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

    return (
      <div id={id}>
        <Content title={this.props.title}>
          <Container>{this.renderLabelValue()}</Container>
          <ActionContainer>
            <SuccessButton
              id="verifyPositive"
              onClick={positiveAction.handler}
              icon={() => <Check />}
              align={ICON_ALIGNMENT.LEFT}
            >
              {positiveAction.label}
            </SuccessButton>
            <DangerButton
              id="verifyNegative"
              onClick={this.togglePrompt}
              icon={() => <Cross color="currentColor" />}
              align={ICON_ALIGNMENT.LEFT}
            >
              {negativeAction.label}
            </DangerButton>
          </ActionContainer>
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
