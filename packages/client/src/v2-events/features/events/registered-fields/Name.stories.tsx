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
import React from 'react'
import styled from 'styled-components'
import {
  and,
  field,
  FieldType,
  NameField,
  NameFieldValue,
  or,
  not,
  EventState,
  tennisClubMembershipEvent,
  ActionType
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { FormFieldGeneratorProps } from '@client/v2-events/components/forms/FormFieldGenerator/FormFieldGenerator'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { ValueOutput } from '../components/Output'
import {
  getTestValidatorContext,
  withValidatorContext
} from '../../../../../.storybook/decorators'
import { tennisClubMembershipEventDocument } from '../fixtures'

const meta: Meta<FormFieldGeneratorProps> = {
  title: 'Inputs/Name',
  component: FormFieldGenerator,
  argTypes: {
    validatorContext: { control: false }
  },
  args: {
    onChange: (values: EventState) => {
      console.log(values)
    }
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 400px;
`

export const FirstNameLastNameRequired: StoryObj<typeof FormFieldGenerator> = {
  name: 'First Name and Last name required',
  parameters: {
    layout: 'centered'
  },
  render: (args) => {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.name',
            type: FieldType.NAME,
            label: {
              id: 'storybook.name.label',
              defaultMessage: 'Name',
              description: 'The title for the name input'
            }
          }
        ]}
        id="my-form"
        onChange={(data) => {
          args.onChange(data)
        }}
      />
    )
  }
}

export const FirstNameLastNameRequiredMiddleNameOptional: StoryObj<
  typeof FormFieldGenerator
> = {
  name: 'First Name and Last name required',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            id: 'storybook.name',
            type: FieldType.NAME,
            label: {
              id: 'storybook.name.label',
              defaultMessage: 'Name',
              description: 'The title for the name input'
            },
            configuration: {
              name: {
                firstname: { required: true },
                middlename: { required: false },
                surname: { required: true }
              }
            }
          }
        ]}
      />
    )
  }
}

export const NameWithAllOptions: StoryObj<typeof FormFieldGenerator> = {
  name: 'With custom label and field ordering',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formState, setFormState] = React.useState<
      NameFieldValue | undefined
    >(undefined)

    const field: NameField = {
      id: 'storybook.name',
      type: FieldType.NAME,
      label: {
        id: 'storybook.name.label',
        defaultMessage: 'Name',
        description: 'The title for the name input'
      },
      configuration: {
        order: ['surname', 'firstname', 'middlename'],
        name: {
          firstname: {
            required: false,
            label: {
              id: 'storybook.name.custom.firstname.label',
              defaultMessage: 'My firstname label',
              description: 'The title for the name input'
            }
          },
          middlename: {
            required: false,
            label: {
              id: 'storybook.name.custom.middlename.label',
              defaultMessage: 'My middlename label',
              description: 'The title for the name input'
            }
          },
          surname: {
            required: false,
            label: {
              id: 'storybook.name.custom.surname.label',
              defaultMessage: 'My surname label',
              description: 'The title for the name input'
            }
          }
        }
      }
    }

    return (
      <div>
        <strong>{'Current Value:'}</strong>
        <ValueOutput config={field} value={formState} />
        <br />
        <br />
        <strong>{'Form:'}</strong>

        <StyledFormFieldGenerator
          {...args}
          fields={[field]}
          id="storybook.name"
          onChange={(data) => {
            setFormState(data['storybook.name'] as NameFieldValue)
            args.onChange(data)
          }}
        />
      </div>
    )
  }
}

const undeclaredDraftEvent = {
  ...tennisClubMembershipEventDocument,
  actions: tennisClubMembershipEventDocument.actions.filter(
    ({ type }) => type === ActionType.CREATE || type === ActionType.ASSIGN
  )
}

const nameField: NameField = {
  id: 'applicant.name',
  type: FieldType.NAME,
  label: {
    id: 'applicant.name.label',
    defaultMessage: 'Name',
    description: 'The title for the name input'
  },
  validation: [
    {
      message: {
        defaultMessage:
          "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-) and apostrophes(')",
        description: 'This is the error message for invalid name',
        id: 'error.invalidName'
      },
      validator: and(
        field('applicant.name').get('firstname').isValidEnglishName(),
        field('applicant.name').get('middlename').isValidEnglishName(),
        field('applicant.name').get('surname').isValidEnglishName()
      )
    },
    {
      message: {
        defaultMessage:
          'At least one of the name fields (first name, middle name, or surname) is required.',
        description: 'This is the error message for name required',
        id: 'error.nameRequired'
      },
      validator: or(
        not(field('applicant.name').get('firstname').isFalsy()),
        not(field('applicant.name').get('middlename').isFalsy()),
        not(field('applicant.name').get('surname').isFalsy())
      )
    }
  ],
  configuration: {
    order: ['surname', 'firstname', 'middlename'],
    showParentFieldError: true,
    name: {
      firstname: {
        required: false,
        label: {
          id: 'applicant.name.custom.firstname.label',
          defaultMessage: 'My firstname label',
          description: 'The title for the name input'
        }
      },
      middlename: {
        required: false,
        label: {
          id: 'applicant.name.custom.middlename.label',
          defaultMessage: 'My middlename label',
          description: 'The title for the name input'
        }
      },
      surname: {
        required: false,
        label: {
          id: 'applicant.name.custom.surname.label',
          defaultMessage: 'My surname label',
          description: 'The title for the name input'
        }
      }
    }
  }
}

const modifiedEventConfig = {
  ...tennisClubMembershipEvent,
  declaration: {
    ...tennisClubMembershipEvent.declaration,
    pages: tennisClubMembershipEvent.declaration.pages.map((x) => {
      x.fields = x.fields.map((y) => {
        if (y.id === nameField.id) {
          y = nameField
        }
        return y
      })
      return x
    })
  }
}
export const NameWithHideSubFieldError: StoryObj<typeof FormFieldGenerator> = {
  name: 'Name Subfield errors are hidden, Name Field level error are shown',
  parameters: {
    layout: 'centered',
    offline: {
      events: [undeclaredDraftEvent]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
        eventId: undeclaredDraftEvent.id,
        pageId: 'applicant'
      })
    }
  },
  render: function Component(args) {
    const [formState, setFormState] = React.useState<EventState>({})
    // Key Change 1: Manually create the validator context, passing in the event document.
    const validatorContext = getTestValidatorContext(
      undefined,
      undeclaredDraftEvent
    )

    return (
      <div>
        <strong>{'Current Value:'}</strong>
        <ValueOutput config={nameField} value={formState['applicant.name']} />
        <br />
        <br />
        <strong>{'Form:'}</strong>

        <StyledFormFieldGenerator
          eventConfig={modifiedEventConfig}
          fields={modifiedEventConfig.declaration.pages[0].fields}
          id="storybook.name"
          initialValues={formState}
          validateAllFields={true}
          validatorContext={validatorContext}
          onChange={(data) => {
            setFormState(data)
            args.onChange(data)
          }}
        />
      </div>
    )
  }
}
