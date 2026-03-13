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
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import React from 'react'
import { noop } from 'lodash'
import {
  DocumentPath,
  FieldConfig,
  FieldType,
  TENNIS_CLUB_DECLARATION_FORM
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'
import { Review } from './Review'

const annotationTextField: FieldConfig = {
  id: 'annotation.comment',
  type: FieldType.TEXT,
  conditionals: [],
  label: {
    id: 'annotation.comment.label',
    defaultMessage: 'Comment',
    description: 'Label for annotation comment field'
  }
}

const reviewCommentField: FieldConfig = {
  id: 'review.comment',
  type: FieldType.TEXT,
  label: {
    id: 'review.comment.label',
    defaultMessage: 'Comment',
    description: 'Label for review comment field'
  }
}

const reviewSignatureField: FieldConfig = {
  id: 'review.signature',
  type: FieldType.SIGNATURE,
  conditionals: [],
  signaturePromptLabel: {
    id: 'review.signature.prompt',
    defaultMessage: 'Please sign here',
    description: 'Prompt label for review signature modal'
  },
  label: {
    id: 'review.signature.label',
    defaultMessage: 'Signature',
    description: 'Label for review signature field'
  },
  configuration: {
    maxFileSize: 5 * 1024 * 1024
  }
}

const meta: Meta<typeof Review.Body> = {
  title: 'Components/Review/Interaction',
  component: Review.Body,
  args: {
    formConfig: TENNIS_CLUB_DECLARATION_FORM,
    form: {},
    onEdit: noop,
    title: 'Member declaration'
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <React.Suspense>
          <Story {...context} />
        </React.Suspense>
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

type Story = StoryObj<typeof Review.Body>

export const DraftAnnotationShownInReadonlyView: Story = {
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    readonlyMode: true,
    reviewFields: [annotationTextField],
    annotation: {
      'annotation.comment': 'This annotation was saved as a draft only'
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      await canvas.findByText('This annotation was saved as a draft only')
    ).toBeInTheDocument()
  }
}

export const DraftAnnotationWithMultipleFields: Story = {
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    readonlyMode: true,
    reviewFields: [reviewCommentField, reviewSignatureField],
    annotation: {
      'review.comment': 'Draft comment before submission',
      'review.signature': {
        path: 'files/4f095fc4-4312-4de2-aa38-86dcc0f71044.png' as DocumentPath,
        type: 'image/png',
        originalFilename: 'signature-review____signature-draft.png'
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      await canvas.findByText('Draft comment before submission')
    ).toBeInTheDocument()

    await expect(
      await canvas.findByAltText('Signature preview')
    ).toBeInTheDocument()
  }
}

export const DraftAnnotationEmptyHidesSection: Story = {
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  args: {
    readonlyMode: true,
    reviewFields: [annotationTextField],
    annotation: undefined
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const annotationHeadings = canvas.queryAllByText('Comment')
    void expect(annotationHeadings).toHaveLength(0)
  }
}
