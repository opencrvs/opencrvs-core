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
import React, { useState } from 'react'
import styled from 'styled-components'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Icon } from '@opencrvs/components/lib/Icon'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { LabelValuePair } from '@opencrvs/components/lib/ViewData'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import {
  formatPlainDate,
  isValidPlainDate
} from '@client/utils/date-formatting'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { identityNameMapper } from '@client/forms/certificate/fieldDefinitions/messages'

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
  age: string | undefined
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

const IDVerifierComponent = ({
  correctorInformation,
  intl,
  actionProps,
  id,
  title
}: IIDVerifierProps & IntlShapeProps) => {
  const [showPrompt, setShowPrompt] = useState(false)

  const togglePrompt = () => {
    setShowPrompt(!showPrompt)
  }

  const renderLabelValue = () => (
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

      {
        <LabelValuePair
          label={intl.formatMessage(certificateMessages.dateOfBirth)}
          value={
            correctorInformation?.birthDate &&
            isValidPlainDate(correctorInformation.birthDate)
              ? formatPlainDate(correctorInformation.birthDate)
              : '-'
          }
        />
      }

      {correctorInformation?.age && (
        <LabelValuePair
          label={intl.formatMessage(certificateMessages.age)}
          value={String(correctorInformation.age as string)}
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

  const { positiveAction, negativeAction } = actionProps

  const positiveActionButton = (
    <Button
      id="verifyPositive"
      key="verifyPositive"
      type="positive"
      size="large"
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
      size="large"
      onClick={togglePrompt}
    >
      <Icon name="X" />
      {negativeAction.label}
    </Button>
  )

  return (
    <div id={id}>
      <Content
        size={ContentSize.SMALL}
        title={title}
        showTitleOnMobile={true}
        bottomActionButtons={[positiveActionButton, negativeActionButton]}
      >
        {correctorInformation && (
          <Container>
            <UnderLayBackground />
            {renderLabelValue()}
          </Container>
        )}
      </Content>
      <ResponsiveModal
        id="withoutVerificationPrompt"
        show={showPrompt}
        title={intl.formatMessage(
          certificateMessages.idCheckForCorrectionTitle
        )}
        contentHeight={96}
        handleClose={togglePrompt}
        actions={[
          <TertiaryButton id="cancel" key="cancel" onClick={togglePrompt}>
            {intl.formatMessage(certificateMessages.idCheckDialogCancel)}
          </TertiaryButton>,
          <PrimaryButton
            id="send"
            key="continue"
            onClick={() => {
              actionProps.negativeAction.handler()
              togglePrompt()
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

export const IDVerifier = injectIntl(IDVerifierComponent)
