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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { fireEvent, within, expect } from '@storybook/test'
import React from 'react'
import superjson from 'superjson'
import { noop } from 'lodash'
import {
  AddressFieldValue,
  AddressType,
  ConditionalType,
  defineDeclarationForm,
  field,
  FieldConfig,
  FieldType,
  DocumentPath,
  TENNIS_CLUB_DECLARATION_FORM
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { useModal } from '@client/v2-events/hooks/useModal'
import {
  getTestValidatorContext,
  withValidatorContext
} from '../../../../../.storybook/decorators'
import { RejectionState, Review } from './Review'

/* eslint-disable max-lines */
const mockDeclaration = {
  'applicant.name': {
    firstname: 'John',
    surname: 'Doe'
  },
  'applicant.dob': '1990-01-01',
  'applicant.address': {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
    streetLevelDetails: {
      town: 'Example Town',
      residentialArea: 'Example Residential Area',
      street: 'Example Street',
      number: '55',
      zipCode: '123456',
      state: 'Example State',
      district2: 'Example District 2'
    }
  },
  'recommender.none': true
}

const meta: Meta<typeof Review.Body> = {
  title: 'Components/Review',
  component: Review.Body,
  args: {
    formConfig: TENNIS_CLUB_DECLARATION_FORM,
    form: mockDeclaration,
    onEdit: noop,
    title: 'Member declaration for John Doe'
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
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const ReviewWithoutChanges: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  }
}

export const ChangeModalInteraction: StoryObj<typeof Review.Body> = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open modal', async () => {
      const [changeButton] = await canvas.findAllByRole('button', {
        name: 'Change'
      })

      await fireEvent.click(changeButton)
    })

    await step('Close modal', async () => {
      const cancelButton = await canvas.findByRole('button', {
        name: 'Cancel'
      })

      await fireEvent.click(cancelButton)
    })
  },
  render: function Component(args) {
    const [modal, openModal] = useModal()

    async function handleEdit() {
      await openModal<boolean | null>((close) => (
        <Review.EditModal close={close}></Review.EditModal>
      ))

      return
    }

    return (
      <>
        <Review.Body
          {...args}
          form={mockDeclaration}
          formConfig={TENNIS_CLUB_DECLARATION_FORM}
          title="My test action"
          onEdit={handleEdit}
        ></Review.Body>
        {modal}
      </>
    )
  }
}

export const ReviewWithValidationErrors: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  args: {
    form: {
      // @ts-ignore
      'applicant.name': {
        firstname: 'Mia',
        surname: undefined
      },
      // @ts-ignore
      'applicant.dob': undefined,
      'applicant.email': 'mia@',
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        administrativeArea: 'invalid-uuid'
      } as AddressFieldValue
    }
  },
  render: function Component(args) {
    const [modal, openModal] = useModal()

    async function handleRejection() {
      await openModal<RejectionState | null>((close) => (
        <Review.ActionModal.Reject close={close} />
      ))
    }
    return (
      <Review.Body
        {...args}
        form={this.args?.form || {}}
        formConfig={TENNIS_CLUB_DECLARATION_FORM}
        title="My test action"
        onEdit={noop}
      >
        {modal}
      </Review.Body>
    )
  }
}

export const ReviewWithConditionallyHiddenFields: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  args: {
    form: {
      firstname: 'Mia∞$∞©@£$',
      'favourite-animal': 'cat',
      'are-you-feeling-all-right': true
    }
  },
  render: function Component(args) {
    const [modal, openModal] = useModal()

    return (
      <Review.Body
        {...args}
        form={this.args?.form || {}}
        formConfig={defineDeclarationForm({
          label: {
            id: 'declaration.form.label',
            defaultMessage:
              'Form for testing conditionally hidden fields on review page',
            description: ''
          },
          pages: [
            {
              id: 'page1',
              title: {
                id: 'page1.title',
                defaultMessage: 'Page 1 Title',
                description: ''
              },
              fields: [
                // This field should be hidden, since condition is not met
                {
                  id: 'firstname',
                  type: FieldType.TEXT,
                  conditionals: [
                    {
                      type: ConditionalType.DISPLAY_ON_REVIEW,
                      conditional: field('firstname').isValidEnglishName()
                    }
                  ],
                  label: {
                    defaultMessage: 'First name',
                    description: '',
                    id: 'firstname.label'
                  }
                },
                {
                  id: 'favourite-animal',
                  type: FieldType.RADIO_GROUP,
                  // This field should be shown, since both conditions are met
                  conditionals: [
                    {
                      type: ConditionalType.SHOW,
                      conditional: field('firstname').isEqualTo('Mia∞$∞©@£$')
                    },
                    {
                      type: ConditionalType.DISPLAY_ON_REVIEW,
                      conditional: field('favourite-animal').isEqualTo('cat')
                    }
                  ],
                  label: {
                    defaultMessage: 'Favourite animal',
                    description: '',
                    id: 'favourite-animal.label'
                  },
                  options: [
                    {
                      value: 'dog',
                      label: {
                        id: 'favourite-animal.dog',
                        defaultMessage: 'Dog',
                        description: ''
                      }
                    },
                    {
                      value: 'cat',
                      label: {
                        id: 'favourite-animal.cat',
                        defaultMessage: 'Cat',
                        description: ''
                      }
                    }
                  ]
                },
                // These fields should be shown, since there are no conditions
                {
                  id: 'has-it-been-a-nice-day',
                  type: FieldType.CHECKBOX,
                  conditionals: [],
                  label: {
                    defaultMessage: 'Has it been a nice day?',
                    description: '',
                    id: 'has-it-been-a-nice-day.label'
                  }
                },
                {
                  id: 'are-you-feeling-all-right',
                  type: FieldType.CHECKBOX,
                  conditionals: [],
                  label: {
                    defaultMessage: 'Are you feeling all right?',
                    description: '',
                    id: 'are-you-feeling-all-right.label'
                  }
                }
              ]
            }
          ]
        })}
        title="My review page for testing conditionally hidden fields"
        onEdit={noop}
      >
        {modal}
      </Review.Body>
    )
  }
}

const singlePageFormWithRequiredField = defineDeclarationForm({
  label: {
    id: 'accordion.test.form.label',
    defaultMessage: 'Accordion test form',
    description: ''
  },
  pages: [
    {
      id: 'page1',
      title: {
        id: 'accordion.test.page1.title',
        defaultMessage: 'Section with required field',
        description: ''
      },
      fields: [
        {
          id: 'required-field',
          type: FieldType.TEXT,
          required: true,
          conditionals: [],
          label: {
            id: 'accordion.test.required-field.label',
            defaultMessage: 'Required field',
            description: ''
          }
        }
      ]
    }
  ]
})

const singlePageFormWithOptionalField = defineDeclarationForm({
  label: {
    id: 'accordion.test.optional.form.label',
    defaultMessage: 'Accordion test form with optional fields',
    description: ''
  },
  pages: [
    {
      id: 'page1',
      title: {
        id: 'accordion.test.optional.page1.title',
        defaultMessage: 'Section with optional field',
        description: ''
      },
      fields: [
        {
          id: 'optional-field',
          type: FieldType.TEXT,
          required: false,
          conditionals: [],
          label: {
            id: 'accordion.test.optional-field.label',
            defaultMessage: 'Optional field',
            description: ''
          }
        }
      ]
    }
  ]
})

export const AccordionExpandedWhenPageHasRequiredFields: Story = {
  name: 'Accordion: expanded when page has required fields',
  args: {
    form: {},
    formConfig: singlePageFormWithRequiredField,
    title: 'Accordion expand test - required fields'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Page has required fields, so accordion should be expanded even with no values
    await expect(await canvas.findByText('Hide')).toBeInTheDocument()
    await expect(canvas.queryByText('Show')).not.toBeInTheDocument()
  }
}

export const AccordionExpandedWhenFieldsAreCompleted: Story = {
  name: 'Accordion: expanded when fields have values',
  args: {
    form: { 'optional-field': 'some value' },
    formConfig: singlePageFormWithOptionalField,
    title: 'Accordion expand test - completed fields'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Page has no required fields but a field has a value, so accordion should be expanded
    await expect(await canvas.findByText('Hide')).toBeInTheDocument()
    await expect(canvas.queryByText('Show')).not.toBeInTheDocument()
  }
}

export const AccordionCollapsedWhenNoRequiredFieldsAndNoValues: Story = {
  name: 'Accordion: collapsed when no required fields and no values',
  args: {
    form: {},
    formConfig: singlePageFormWithOptionalField,
    title: 'Accordion collapse test'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Page has no required fields and no values, so accordion should be collapsed
    await expect(await canvas.findByText('Show')).toBeInTheDocument()
    await expect(canvas.queryByText('Hide')).not.toBeInTheDocument()
  }
}

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

const annotationPrintButtonField: FieldConfig = {
  id: 'annotation.printButton',
  type: FieldType.ALPHA_PRINT_BUTTON,
  conditionals: [],
  label: {
    id: 'annotation.printButton.label',
    defaultMessage: 'Print',
    description: 'Label for annotation print button field'
  },
  configuration: {
    template: 'birth-certificate'
  }
}

const annotationConditionalTextField: FieldConfig = {
  id: 'annotation.conditionalField',
  type: FieldType.TEXT,
  conditionals: [
    {
      type: ConditionalType.DISPLAY_ON_REVIEW,
      conditional: field('annotation.conditionalField').isEqualTo('show-me')
    }
  ],
  label: {
    id: 'annotation.conditionalField.label',
    defaultMessage: 'Conditional field',
    description: 'Label for conditionally shown annotation field'
  }
}

/**
 * During record creation the annotation fields (e.g. signature, comment) are shown
 * as editable inputs via FormFieldGenerator. The readonly ListReview section is not
 * shown because there are no previously submitted annotation values to display.
 *
 * Requires reactRouter with /event/:eventId so SignatureField.Input can upload files.
 */
export const ReviewDuringCreateNoAnnotationFields: Story = {
  parameters: {
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <Review.Body
            annotation={{}}
            form={mockDeclaration}
            formConfig={TENNIS_CLUB_DECLARATION_FORM}
            readonlyMode={false}
            reviewFields={[reviewCommentField, reviewSignatureField]}
            title="Member declaration for John Doe"
            validatorContext={getTestValidatorContext()}
            onAnnotationChange={noop}
            onEdit={noop}
          />
        )
      },
      initialPath: '/event/test-event-123'
    }
  }
}

export const ReadonlyAnnotationListReview: Story = {
  args: {
    readonlyMode: true,
    reviewFields: [annotationTextField],
    annotation: {
      'annotation.comment': 'Only annotation'
    }
  }
}

export const ReadonlyAnnotationHidesAlphaPrintButton: Story = {
  args: {
    readonlyMode: true,
    reviewFields: [annotationTextField, annotationPrintButtonField],
    annotation: {
      'annotation.comment': 'Hides alpha print button',
      'annotation.printButton': null
    }
  }
}

export const ReadonlyAnnotationFromNotifyAction: Story = {
  args: {
    readonlyMode: true,
    reviewFields: [annotationTextField],
    annotation: {
      'annotation.comment': 'Notified by field agent'
    }
  }
}

export const ReadonlyAnnotationConditionallyHiddenField: Story = {
  args: {
    readonlyMode: true,
    reviewFields: [annotationTextField, annotationConditionalTextField],
    annotation: {
      'annotation.comment': 'Always visible. One field hidden.',
      // condition not satisfied — value does not equal 'show-me'
      'annotation.conditionalField': 'hidden-value'
    }
  }
}

export const ReadonlyAnnotationConditionallyShownField: Story = {
  args: {
    readonlyMode: true,
    reviewFields: [annotationTextField, annotationConditionalTextField],
    annotation: {
      'annotation.comment': 'Always visible.',
      // condition satisfied — value equals 'show-me'
      'annotation.conditionalField': 'show-me'
    }
  }
}

export const ReadonlyNoAnnotationSection: Story = {
  args: {
    readonlyMode: true,
    reviewFields: undefined,
    annotation: undefined
  }
}

export const ReadonlyAnnotationWithSignature: Story = {
  args: {
    readonlyMode: true,
    reviewFields: [reviewCommentField, reviewSignatureField],
    annotation: {
      'review.comment': 'commentsssdsdsds',
      'review.signature': {
        path: '4f095fc4-4312-4de2-aa38-86dcc0f71044.png' as DocumentPath,
        type: 'image/png',
        originalFilename: 'signature-review____signature-1773128010978.png'
      }
    }
  }
}
