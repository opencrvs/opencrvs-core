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
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { VerificationPageConfig } from '@opencrvs/commons/client'
import { Check, Cross } from '@opencrvs/components/lib/icons'
import {
  ResponsiveModal,
  Text,
  Frame,
  Icon,
  Stack,
  Content,
  Button
} from '@opencrvs/components'
import { useModal } from '@client/v2-events/hooks/useModal'
import { FormWizardProps, messages as formWizardMessages } from './FormWizard'

const messages = defineMessages({
  cancel: {
    defaultMessage: 'Cancel',
    description: 'Cancel button text in the modal',
    id: 'v2.buttons.cancel'
  },
  confirm: {
    defaultMessage: 'Confirm',
    description: 'Confirm button text',
    id: 'v2.buttons.confirm'
  }
})

export const VerificationWizard = ({
  children,
  currentPage,
  totalPages,
  onSubmit,
  pageTitle,
  onNextPage,
  onPreviousPage,
  showReviewButton,
  pageConfig,
  onVerifyAction
}: FormWizardProps & {
  pageConfig: VerificationPageConfig
  onVerifyAction: (val: boolean) => void
}) => {
  const intl = useIntl()
  const [cancelModal, openCancelModal] = useModal()

  const onContinue =
    currentPage + 1 < totalPages && onNextPage ? onNextPage : onSubmit

  const onCancelButtonClick = () => {
    void openCancelModal<void>((close) => (
      <ResponsiveModal
        autoHeight
        actions={[
          <Button
            key="cancel"
            id="cancel"
            type="tertiary"
            onClick={() => close()}
          >
            {intl.formatMessage(messages.cancel)}
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={() => {
              onVerifyAction(false)
              close()
              return onContinue()
            }}
          >
            {intl.formatMessage(messages.confirm)}
          </Button>
        ]}
        handleClose={() => close()}
        responsive={false}
        show={true}
        title={intl.formatMessage(pageConfig.actions.cancel.confirmation.title)}
      >
        <Stack>
          <Text color="grey500" element="p" variant="reg16">
            {intl.formatMessage(pageConfig.actions.cancel.confirmation.body)}
          </Text>
        </Stack>
      </ResponsiveModal>
    ))
  }

  return (
    <Frame.LayoutForm>
      <Frame.SectionFormBackAction>
        {currentPage > 0 && (
          <Button size="small" type="tertiary" onClick={onPreviousPage}>
            <Icon name="ArrowLeft" size="medium" />
            {intl.formatMessage(formWizardMessages.back)}
          </Button>
        )}
      </Frame.SectionFormBackAction>
      <Frame.Section>
        <Content showTitleOnMobile={true} title={pageTitle}>
          <Stack alignItems="stretch" direction="column" gap={16}>
            {children}

            <Button
              role="button"
              size="large"
              type="negative"
              onClick={onCancelButtonClick}
            >
              <Cross color="white" />
              {intl.formatMessage(pageConfig.actions.cancel.label)}
            </Button>

            <Button
              role="button"
              size="large"
              type="positive"
              onClick={() => {
                onVerifyAction(true)
                onContinue()
              }}
            >
              <Check color="white" />
              {intl.formatMessage(pageConfig.actions.verify.label)}
            </Button>

            {showReviewButton && (
              <Button size="large" type="secondary" onClick={onSubmit}>
                {intl.formatMessage(formWizardMessages.backToReview)}
              </Button>
            )}
          </Stack>
        </Content>
      </Frame.Section>
      {cancelModal}
    </Frame.LayoutForm>
  )
}
