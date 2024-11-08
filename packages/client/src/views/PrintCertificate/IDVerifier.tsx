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
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { constantsMessages, countryMessages } from '@client/i18n/messages'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { LabelValuePair } from '@opencrvs/components/lib/ViewData'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import {
  formatPlainDate,
  isValidPlainDate
} from '@client/utils/date-formatting'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
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

export interface ICollectorInfo {
  iD: string
  iDType: string
  firstNames: string
  familyName: string
  birthDate?: string
  nationality: string
  age?: string
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

const IDVerifierComponent = (props: IIDVerifierProps & IntlShapeProps) => {
  const { collectorInformation, intl, actionProps, id, title } = props
  const [showPrompt, setShowPrompt] = useState(false)

  const togglePrompt = () => {
    setShowPrompt((prev) => !prev)
  }

  const renderLabelValue = () => {
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

        {
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.dateOfBirth)}
            value={
              isValidPlainDate(collectorInformation.birthDate)
                ? formatPlainDate(collectorInformation.birthDate)
                : '-'
            }
          />
        }

        {collectorInformation.age && (
          <LabelValuePair
            label={intl.formatMessage(certificateMessages.age)}
            value={String(collectorInformation.age as string)}
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

  const { positiveAction, negativeAction } = actionProps
  const isIssueUrl = window.location.href.includes('issue')
  const modalTitle = isIssueUrl
    ? intl.formatMessage(issueMessages.idCheckWithoutVerify)
    : intl.formatMessage(certificateMessages.idCheckDialogTitle)

  return (
    <div id={id}>
      <Content
        title={title}
        size={ContentSize.SMALL}
        showTitleOnMobile
        bottomActionDirection="column"
        bottomActionButtons={[
          <Button
            key="verifyNegative"
            id="verifyNegative"
            type="negative"
            size="large"
            fullWidth
            onClick={togglePrompt}
          >
            <Icon name="X" size="large" />
            {negativeAction.label}
          </Button>,
          <Button
            key="verifyPositive"
            id="verifyPositive"
            type="positive"
            size="large"
            fullWidth
            onClick={positiveAction.handler}
          >
            <Icon name="Check" size="large" />
            {positiveAction.label}
          </Button>
        ]}
      >
        <Container>{renderLabelValue()}</Container>
      </Content>

      <ResponsiveModal
        id="withoutVerificationPrompt"
        show={showPrompt}
        title={modalTitle}
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
        {intl.formatMessage(certificateMessages.idCheckDialogDescription)}
      </ResponsiveModal>
    </div>
  )
}

export const IDVerifier = injectIntl(IDVerifierComponent)
