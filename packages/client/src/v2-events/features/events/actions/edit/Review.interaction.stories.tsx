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
import superjson from 'superjson'
import { userEvent, within, screen, expect } from '@storybook/test'
import { toast } from 'react-hot-toast'
import {
  ActionType,
  and,
  ConditionalType,
  event,
  EventConfig,
  FieldConfig,
  FieldType,
  not,
  TENNIS_CLUB_DECLARATION_REVIEW,
  tennisClubMembershipEvent,
  generateEventDocument,
  generateEventDraftDocument,
  getCurrentEventState,
  generateActionDocument,
  getUUID,
  user
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { setEventData, addLocalEventConfig } from '../../useEvents/api'
import { ActionDocument } from '../../../../../../../commons/build/dist/common/client'
import { Review as ReviewIndex } from './index'

const generator = testDataGenerator()

const reviewWithPrintButton = {
  ...TENNIS_CLUB_DECLARATION_REVIEW,
  fields: [
    ...TENNIS_CLUB_DECLARATION_REVIEW.fields,
    {
      id: 'review.print',
      type: FieldType.ALPHA_PRINT_BUTTON,
      label: {
        defaultMessage: 'Print certificate',
        id: 'review.print.label',
        description: 'Label for the print button in the review section'
      },
      configuration: { template: 'test-certificate' },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            user.hasRole('LOCAL_REGISTRAR'),
            not(event.hasAction(ActionType.DECLARE)),
            not(event.hasAction(ActionType.NOTIFY))
          )
        }
      ]
    }
  ] as FieldConfig[]
}

export const eventConfigWithPrintButton = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) =>
    action.type === ActionType.DECLARE
      ? { ...action, review: reviewWithPrintButton }
      : action
  )
} as unknown as EventConfig

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

// A declared record that can be edited and (by a registrar) directly registered.
const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
})
const eventId = eventDocument.id

// Form values that differ from the record's current declaration so the edit
// menu's "with edits" actions are enabled (they require anyValuesHaveChanged).
// applicant.name is correctable; applicant.email is not, so editing email alone
// would not register as a change.
const editedDeclaration = {
  ...getCurrentEventState(eventDocument, tennisClubMembershipEvent).declaration,
  'applicant.name': { firstname: 'Editedfirst', surname: 'Editedlast' }
}

const mockUser = generator.user.localRegistrar().summary
const mockUserFull = generator.user.localRegistrar().v2

/**
 * The edit flow's "with edits" actions run EDIT then DECLARE (and, for register,
 * REGISTER). The backend detects duplicates during the DECLARE phase, so the
 * declare response carries the DUPLICATE_DETECTED action. editAndRegister decides
 * whether to continue to REGISTER via getCurrentEventState().potentialDuplicates,
 * which sorts actions by createdAt, so every action here must be a fully-formed
 * document.
 */
function declareReturningDuplicate() {
  return {
    ...eventDocument,
    actions: [
      ...eventDocument.actions,
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.EDIT
      }),
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.DECLARE
      }),
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.DUPLICATE_DETECTED,
        defaults: {
          content: {
            duplicates: [{ id: getUUID(), trackingId: '0R1G1NAL' }]
          }
        }
      })
    ] as ActionDocument[]
  }
}

function editAccepted() {
  return {
    ...eventDocument,
    actions: [
      ...eventDocument.actions,
      generateActionDocument({
        configuration: tennisClubMembershipEvent,
        action: ActionType.EDIT
      })
    ] as ActionDocument[]
  }
}

const meta: Meta<typeof ReviewIndex> = {
  title: 'Edit/Interaction',
  parameters: {
    offline: {
      events: [eventDocument]
    }
  },
  beforeEach: () => {
    // Clear any toast left over from a previous story so this test only asserts
    // on toasts raised by its own play function.
    toast.remove()
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(eventId, eventDocument)
  }
}

export default meta

type Story = StoryObj<typeof ReviewIndex>

const duplicateHandlers = {
  drafts: [
    tRPCMsw.event.draft.list.query(() => {
      return [
        generateEventDraftDocument({
          eventId,
          actionType: ActionType.DECLARE
        })
      ]
    })
  ],
  events: [
    tRPCMsw.event.config.get.query(() => {
      return [tennisClubMembershipEvent]
    }),
    tRPCMsw.event.get.query(() => {
      return eventDocument
    }),
    tRPCMsw.event.actions.edit.request.mutation(() => {
      return editAccepted()
    }),
    tRPCMsw.event.actions.declare.request.mutation(() => {
      return declareReturningDuplicate()
    })
  ],
  user: [
    tRPCMsw.user.list.query(() => {
      return [mockUser]
    }),
    tRPCMsw.user.get.query(() => {
      return mockUserFull
    })
  ]
}

async function assertDuplicateToast() {
  // The toast renders via the global Toaster, which may live outside the story
  // canvas (the edit flow navigates away on submit), so query the whole document.
  await screen.findByText(
    '111111 is a potential duplicate. Record is ready for review.',
    undefined,
    { timeout: 10000 }
  )
}

export const ShowToastOnDuplicateDetectedOnEditAndRegister: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EDIT.REVIEW.buildPath({ eventId })
    },
    chromatic: { disableSnapshot: true },
    msw: { handlers: duplicateHandlers }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Register with edits on a duplicate', async () => {
      // The edit page loads the record's declaration into the form on mount, so
      // wait for it to render, then apply the changed values to enable the edit
      // actions.
      const actionButton = await canvas.findByRole('button', { name: 'Action' })
      useEventFormData.setState({ formValues: editedDeclaration })
      await userEvent.click(actionButton)
      await userEvent.click(await canvas.findByText('Register with edits'))
      await userEvent.click(
        await screen.findByRole('button', { name: 'Confirm' })
      )
    })

    await step('Toast is shown with duplicate detected message', async () => {
      await assertDuplicateToast()
    })
  }
}

export const AlphaPrintButtonHiddenWhenEditingDeclaredRecord: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EDIT.REVIEW.buildPath({ eventId })
    },
    chromatic: { disableSnapshot: true },
    test: {
      dangerouslyIgnoreUnhandledErrors: true
    },
    offline: {
      events: [eventDocument],
      configs: [eventConfigWithPrintButton]
    },
    msw: { handlers: duplicateHandlers }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Review page loads for editing a declared record', async () => {
      await canvas.findByRole('button', { name: 'Action' })
    })

    await step(
      'Print button is absent because event already has a DECLARE action',
      async () => {
        await expect(canvas.queryByText('Print')).toBeNull()
      }
    )
  }
}

export const ShowToastOnDuplicateDetectedOnEditAndDeclare: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EDIT.REVIEW.buildPath({ eventId })
    },
    chromatic: { disableSnapshot: true },
    msw: { handlers: duplicateHandlers }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Declare with edits on a duplicate', async () => {
      // The edit page loads the record's declaration into the form on mount, so
      // wait for it to render, then apply the changed values to enable the edit
      // actions.
      const actionButton = await canvas.findByRole('button', { name: 'Action' })
      useEventFormData.setState({ formValues: editedDeclaration })
      await userEvent.click(actionButton)
      await userEvent.click(await canvas.findByText('Declare with edits'))
      await userEvent.click(
        await screen.findByRole('button', { name: 'Confirm' })
      )
    })

    await step('Toast is shown with duplicate detected message', async () => {
      await assertDuplicateToast()
    })
  }
}
