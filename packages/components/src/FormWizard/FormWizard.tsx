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
import { Button } from '../Button'
import { Content } from '../Content'
import { Frame } from '../Frame'
import { Icon } from '../Icon'
import { Stack } from '../Stack'

type FormWizardProps = PropsWithChildren<{
  currentPage: number
  totalPages: number
  /** Callback when the user clicks the "Continue" button */
  onNextPage?: () => void
  onPreviousPage?: () => void

  /** Callback when the user submits the form wizard */
  onSubmit: () => void
  pageTitle: string

  showReviewButton?: boolean
  submitButtonText?: string
}>

export const FormWizard = ({
  children,
  currentPage,
  totalPages,
  onSubmit,
  pageTitle,
  onNextPage,
  onPreviousPage,
  submitButtonText = 'Submit',
  showReviewButton
}: FormWizardProps) => {
  return (
    <Frame.LayoutForm>
      <Frame.SectionFormBackAction>
        {currentPage > 0 && (
          <Button type="tertiary" size="small" onClick={onPreviousPage}>
            <Icon name="ArrowLeft" size="medium" />
            Back
          </Button>
        )}
      </Frame.SectionFormBackAction>
      <Frame.Section>
        <Content title={pageTitle} showTitleOnMobile={true}>
          <Stack direction="column" gap={16} alignItems="stretch">
            {children}

            {currentPage + 1 < totalPages ? (
              <Button
                size="large"
                type="primary"
                role="button"
                onClick={onNextPage}
              >
                Continue
              </Button>
            ) : (
              <Button size="large" type="primary" onClick={onSubmit}>
                {submitButtonText}
              </Button>
            )}
            {showReviewButton && (
              <Button type="secondary" onClick={onSubmit}>
                Back to review
              </Button>
            )}
          </Stack>
        </Content>
      </Frame.Section>
    </Frame.LayoutForm>
  )
}
