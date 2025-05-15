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

import * as React from 'react'
import {
  createTestComponent,
  flushPromises,
  setScopes
} from '@client/tests/util'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  DOWNLOAD_STATUS,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { ActionMenu } from './ActionMenu'
import { SCOPES } from '@opencrvs/commons/client'
import { EventType } from '@client/utils/gateway'
import { vi } from 'vitest'

const defaultDeclaration = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  name: 'Elissabe Sandrava',
  type: EventType.Birth,
  status: SUBMISSION_STATUS.REGISTERED,
  assignment: {
    practitionerId: '73da21a1-4b8b-4174-83ca-122d829cb6ec',
    firstName: 'Kennedy',
    lastName: 'Mweene',
    officeName: 'Ibombo District Office',
    avatarURL:
      'https://eu.ui-avatars.com/api/?background=DEE5F2&color=222&name=Kennedy Mweene',
    __typename: 'AssignmentData'
  },
  trackingId: 'BYSQC5A',
  dateOfBirth: '',
  placeOfBirth: ''
} as unknown as IDeclaration

const draftBirthDownloaded = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  data: {},
  event: EventType.Birth,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED
} as unknown as IDeclaration

const draftDeathDownloaded = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  data: {},
  event: EventType.Death,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED
} as unknown as IDeclaration

const draftBirthNotDownloaded = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  data: {},
  event: EventType.Birth,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
} as unknown as IDeclaration

const draftDeathNotDownloaded = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  data: {},
  event: EventType.Death,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
} as unknown as IDeclaration

enum ACTION_STATUS {
  HIDDEN = 'Hidden',
  ENABLED = 'Enabled',
  DISABLED = 'Disabled',
  MULTIPLE = 'Multiple'
}

enum ACTION {
  VIEW_RECORD = 'View record',
  VIEW_DECLARATION = 'View declaration',
  REVIEW_DECLARATION = 'Review declaration',
  REVIEW_POTENTIAL_DUPLICATE = 'Review potential duplicate',
  REVIEW_CORRECTION_REQUEST = 'Review correction request',
  UPDATE_DECLARATION = 'Update declaration',
  ARCHIVE_RECORD = 'Archive Record',
  REINSTATE_RECORD = 'Reinstate Record',
  PRINT_RECORD = 'Print certified copy',
  ISSUE_CERTIFICATE = 'Issue certificate',
  CORRECT_RECORD = 'Correct Record',
  DELETE_DECLARATION = 'Delete Declaration',
  UNASSIGN = 'Unassign'
}

const actionStatus = (
  component: ReactWrapper<{}, {}>,
  targetAction: string[]
): { status: ACTION_STATUS; node?: ReactWrapper<{}, {}> } => {
  const target = component
    .find('li')
    .map((a) => a)
    .filter((a) => targetAction.includes(a.text()))

  if (target.length === 0) return { status: ACTION_STATUS.HIDDEN }
  if (target.length > 1) return { status: ACTION_STATUS.MULTIPLE }

  return target[0].prop('disabled')
    ? { status: ACTION_STATUS.DISABLED }
    : { status: ACTION_STATUS.ENABLED, node: target[0] }
}

describe('View action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.VIEW_DECLARATION])

    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('In review', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Potential duplicate', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Requires update', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Validated', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Archived', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Registered', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Registered + Printed in advance', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Pending correction', async () => {
    const { store } = createStore()
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(router.state.location.pathname).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })
})

describe('Review action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)

    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'reviews/' + defaultDeclaration.id
    )
  })

  it('In review - Not downloaded - Has Scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)

    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('In review - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'reviews/' + defaultDeclaration.id
    )
  })

  it('Validated - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Validated - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Review potential duplicate action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate - Not downloaded - Has Scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Potential duplicate - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftDeathDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'reviews/' + defaultDeclaration.id
    )
  })

  it('Requires update', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated - Does not have scope', async () => {
    const { store } = createStore()
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REVIEW_DUPLICATES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Review correction action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'review-correction/' + defaultDeclaration.id
    )
  })

  it('Pending correction - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Pending correction - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Update action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.UPDATE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'drafts/' + defaultDeclaration.id
    )
  })

  it('In progress - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.UPDATE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'reviews/' + defaultDeclaration.id
    )
  })

  it('In progress - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('In review', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.UPDATE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'reviews/' + defaultDeclaration.id
    )
  })

  it('Requires update - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Validated', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction - Downloaded', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTER], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Archive action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const toggleDisplayDialogMock = vi.fn()
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('In progress - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('In review - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const toggleDisplayDialogMock = vi.fn()
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('In review - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Requires update - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const toggleDisplayDialogMock = vi.fn()
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('Requires update - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Validated - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const toggleDisplayDialogMock = vi.fn()
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('Validated - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_ARCHIVE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Reinstate action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_REINSTATE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_REINSTATE], store)
    const toggleDisplayDialogMock = vi.fn()
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')
    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('Archived - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_REINSTATE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_DECLARATION_REINSTATE], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Print action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()
    expect(router.state.location.pathname).toContain(
      'cert/collector/' + defaultDeclaration.id
    )
  })

  it('Registered - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered + Printed in advance', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Issue action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(router.state.location.pathname).toContain(
      'issue/' + defaultDeclaration.id
    )
  })

  it('Registered + Printed in advance - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Pending correction', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Correct action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()
    expect(router.state.location.pathname).toContain(
      'correction/' + defaultDeclaration.id
    )
  })

  it('Registered - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered + Printed in advance - Does not have scope', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance - Not downloaded - Has scope', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered + Printed in advance - Assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component, router } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()
    expect(router.state.location.pathname).toContain(
      'correction/' + defaultDeclaration.id
    )
  })

  it('Pending correction', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_REGISTRATION_CORRECT], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Delete declaration action', () => {
  it('Draft', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status, node } = actionStatus(component, [
      ACTION.DELETE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    expect(component.find('h1').hostNodes().text()).toEqual('Delete draft?')
  })

  it('In progress', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.DELETE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status } = actionStatus(component, [ACTION.DELETE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Unassign action', () => {
  const Assignment = 'Assigned to Kennedy Mweene at Ibombo District Office'
  it('Has scope - assigned to someone else', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_UNASSIGN_OTHERS], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.ENABLED)

    const { status, node } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    expect(component.find('h2').hostNodes().text()).toEqual('Unassign record?')
  })

  it('Does not have scope - assigned to someone else', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.ENABLED)

    const { status } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Assigned to self', async () => {
    const { store } = createStore()
    setScopes([], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED,
          assignment: {
            avatarURL: '',
            practitionerId: '9202fa3c-7eb7-4898-bea5-5895f7f99534'
          }
        }}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.HIDDEN)

    const { status, node } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    expect(component.find('h2').hostNodes().text()).toEqual('Unassign record?')
  })

  it('Not assigned', async () => {
    const { store } = createStore()
    setScopes([SCOPES.RECORD_UNASSIGN_OTHERS], store)
    const { component } = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED,
          assignment: undefined
        }}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.HIDDEN)

    const { status } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})
