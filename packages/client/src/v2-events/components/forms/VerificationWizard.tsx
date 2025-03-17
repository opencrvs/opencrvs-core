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
import { useIntl } from 'react-intl'
import { Button } from '@opencrvs/components/src/Button'
import { Content } from '@opencrvs/components/src/Content'
import { Frame } from '@opencrvs/components/src/Frame'
import { Icon } from '@opencrvs/components/src/Icon'
import { Stack } from '@opencrvs/components/src/Stack'
import { FormWizardProps } from '@opencrvs/components/src/FormWizard/FormWizard'
import { VerificationPageConfig } from '@opencrvs/commons'
import { Check, Cross } from '@opencrvs/components/lib/icons'
import { useModal } from '@client/v2-events/hooks/useModal'

export const VerificationWizard = ({
  children,
  currentPage,
  totalPages,
  onSubmit,
  pageTitle,
  onNextPage,
  onPreviousPage,
  showReviewButton,
  pageConfig
}: FormWizardProps & { pageConfig: VerificationPageConfig }) => {
  const intl = useIntl()
  const [cancelModal, openCancelModal] = useModal()

  // TODO CIHAN: save accepted value
  return (
    <Frame.LayoutForm>
      <Frame.SectionFormBackAction>
        {currentPage > 0 && (
          <Button size="small" type="tertiary" onClick={onPreviousPage}>
            <Icon name="ArrowLeft" size="medium" />
            Back
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
              onClick={currentPage + 1 < totalPages ? onNextPage : onSubmit}
            >
              <Cross color="white" />
              {intl.formatMessage(pageConfig.cancel.label)}
            </Button>

            <Button
              role="button"
              size="large"
              type="positive"
              onClick={currentPage + 1 < totalPages ? onNextPage : onSubmit}
            >
              <Check color="white" />
              {intl.formatMessage(pageConfig.verify.label)}
            </Button>

            {showReviewButton && (
              <Button size="large" type="secondary" onClick={onSubmit}>
                Back to review
              </Button>
            )}
          </Stack>
        </Content>
      </Frame.Section>
    </Frame.LayoutForm>
  )
}
