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
import { Stack } from '@opencrvs/components/src/Stack'

export const messages = defineMessages({
  goToReview: {
    defaultMessage: 'Go to review',
    description: 'Go to review button text',
    id: 'buttons.goToReview'
  }
})

export type FormWizardProps = PropsWithChildren<{
  /** Callback when the user clicks the "Continue" button */
  onNextPage: () => void

  /** Callback when the user submits the form wizard */
  onSubmit: () => void
  pageTitle: string
  showReviewButton?: boolean
  /** Buttons rendered in the top right corner of the page header */
  topActionButtons?: React.ReactElement[]
}>

export const FormWizard = ({
  children,
  onSubmit,
  pageTitle,
  onNextPage,
  showReviewButton,
  topActionButtons,
  continueButtonText = 'Continue'
}: FormWizardProps & {
  continueButtonText?: string
}) => {
  const intl = useIntl()

  return (
    <Frame.LayoutForm>
      <Frame.Section>
        <Content
          showTitleOnMobile={true}
          title={pageTitle}
          topActionButtons={topActionButtons}
        >
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
                {intl.formatMessage(messages.goToReview)}
              </Button>
            )}
          </Stack>
        </Content>
      </Frame.Section>
    </Frame.LayoutForm>
  )
}
