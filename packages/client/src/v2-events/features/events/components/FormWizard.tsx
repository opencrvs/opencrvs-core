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
import React, { PropsWithChildren } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Button } from '@opencrvs/components/src/Button'
import { Content } from '@opencrvs/components/src/Content'
import { Frame } from '@opencrvs/components/src/Frame'
import { Icon } from '@opencrvs/components/src/Icon'
import { Stack } from '@opencrvs/components/src/Stack'

export const messages = defineMessages({
  back: {
    defaultMessage: 'Back',
    description: 'Back button text',
    id: 'v2.buttons.back'
  },
  backToReview: {
    defaultMessage: 'Back to review',
    description: 'Back to review button text',
    id: 'v2.buttons.backToReview'
  }
})

export type FormWizardProps = PropsWithChildren<{
  currentPage: number
  /** Callback when the user clicks the "Continue" button */
  onNextPage: () => void
  onPreviousPage?: () => void

  /** Callback when the user submits the form wizard */
  onSubmit: () => void
  pageTitle: string

  showReviewButton?: boolean
}>

export const FormWizard = ({
  children,
  currentPage,
  onSubmit,
  pageTitle,
  onNextPage,
  onPreviousPage,
  continueButtonText = 'Continue',
  showReviewButton
}: FormWizardProps & {
  continueButtonText?: string
}) => {
  const intl = useIntl()

  return (
    <Frame.LayoutForm>
      <Frame.SectionFormBackAction>
        {currentPage > 0 && (
          <Button size="small" type="tertiary" onClick={onPreviousPage}>
            <Icon name="ArrowLeft" size="medium" />
            {intl.formatMessage(messages.back)}
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
              type="primary"
              onClick={() => onNextPage()}
            >
              {continueButtonText}
            </Button>

            {showReviewButton && (
              <Button size="large" type="secondary" onClick={onSubmit}>
                {intl.formatMessage(messages.backToReview)}
              </Button>
            )}
          </Stack>
        </Content>
      </Frame.Section>
    </Frame.LayoutForm>
  )
}
