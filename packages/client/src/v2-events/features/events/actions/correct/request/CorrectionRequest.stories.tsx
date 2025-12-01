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
import {
  ActionStatus,
  ActionType,
  generateActionDocument,
  tennisClubMembershipEvent,
  TestUserRole,
  TokenUserType,
  generateUuid,
  createPrng,
  Draft,
  EventState
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { router } from './router'
import * as Request from './index'

const meta: Meta<typeof Request.Pages> = {
  title: 'CorrectionRequest',
  parameters: {
    userRole: TestUserRole.enum.REGISTRATION_AGENT
  }
}
export default meta

type Story = StoryObj<typeof Request.Pages>

const prng = createPrng(99887766)

const createAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.CREATE
})

const declarationActionWithAge = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.DECLARE,
  defaults: {
    declaration: {
      'applicant.name': {
        firstname: 'Riku',
        surname: 'Rouvila'
      },
      'applicant.dob': '2025-01-23',
      'applicant.address': {
        country: 'FAR',
        addressType: 'DOMESTIC',
        administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
        streetLevelDetails: {
          town: 'Example Town',
          residentialArea: 'Example Residential Area',
          street: 'Example Street',
          number: '55',
          zipCode: '123456'
        }
      },
      'recommender.name': {
        firstname: 'Euan',
        surname: 'Millar'
      },
      'recommender.id': '123456789'
    } satisfies EventState
  }
})

const validateAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.VALIDATE,
  defaults: {
    declaration: {}
  }
})

const declarationActionWithDob = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.DECLARE,
  defaults: {
    declaration: {
      'applicant.dob': '2006-01-23'
    }
  }
})

const registerAction = generateActionDocument({
  configuration: tennisClubMembershipEvent,
  action: ActionType.REGISTER,
  defaults: {
    declaration: {}
  }
})

const eventCorrectionAgeToDob = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  id: generateUuid(prng),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  actions: [
    createAction,
    declarationActionWithAge,
    validateAction,
    registerAction
  ]
}

const correctionDraftAgeToDob = {
  id: generateUuid(prng),
  transactionId: generateUuid(prng),
  action: {
    createdAt: new Date(Date.now() - 500).toISOString(),
    status: ActionStatus.Accepted,
    transactionId: generateUuid(prng),
    createdBy: generateUuid(prng),
    createdByUserType: TokenUserType.Enum.user,
    createdByRole: TestUserRole.Enum.FIELD_AGENT,
    type: ActionType.REQUEST_CORRECTION,
    declaration: {
      'applicant.age': 18,
      'applicant.dobUnknown': true
    },
    annotation: {}
  },
  createdAt: new Date().toISOString(),
  eventId: eventCorrectionAgeToDob.id
} satisfies Draft

export const SummaryChangingDobToAge: Story = {
  parameters: {
    offline: {
      drafts: [correctionDraftAgeToDob],
      events: [eventCorrectionAgeToDob]
    },
    reactRouter: {
      router: {
        path: '/',
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
        eventId: eventCorrectionAgeToDob.id
      })
    }
  }
}

const eventCorrectionDobToAge = {
  trackingId: generateUuid(prng),
  type: tennisClubMembershipEvent.id,
  id: generateUuid(prng),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  actions: [
    createAction,
    declarationActionWithDob,
    validateAction,
    registerAction
  ]
}

const correctionDraftDobToAge = {
  id: generateUuid(prng),
  transactionId: generateUuid(prng),
  action: {
    createdAt: new Date(Date.now() - 500).toISOString(),
    status: ActionStatus.Accepted,
    transactionId: generateUuid(prng),
    createdBy: generateUuid(prng),
    createdByUserType: TokenUserType.Enum.user,
    createdByRole: TestUserRole.Enum.FIELD_AGENT,
    type: ActionType.REQUEST_CORRECTION,
    declaration: {
      'applicant.age': 25,
      'applicant.dobUnknown': true
    },
    annotation: {}
  },
  createdAt: new Date().toISOString(),
  eventId: eventCorrectionDobToAge.id
} satisfies Draft

export const SummaryChangingAgeToDob: Story = {
  parameters: {
    offline: {
      drafts: [correctionDraftDobToAge],
      events: [eventCorrectionDobToAge]
    },
    reactRouter: {
      router: {
        path: '/',
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
        eventId: eventCorrectionDobToAge.id
      })
    }
  }
}
