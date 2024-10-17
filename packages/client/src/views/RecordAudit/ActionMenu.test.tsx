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
import { createTestComponent, flushPromises } from '@client/tests/util'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  DOWNLOAD_STATUS,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { ActionMenu } from './ActionMenu'
import { Scope } from '@sentry/react'
import { Event } from '@client/utils/gateway'
import { vi } from 'vitest'

const defaultDeclaration = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  name: 'Elissabe Sandrava',
  type: Event.Birth,
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
  event: Event.Birth,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED
} as unknown as IDeclaration

const draftDeathDownloaded = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  data: {},
  event: Event.Death,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.DOWNLOADED
} as unknown as IDeclaration

const draftBirthNotDownloaded = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  data: {},
  event: Event.Birth,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
} as unknown as IDeclaration

const draftDeathNotDownloaded = {
  id: '65c48a2b-68dd-4a7e-8868-d2bb1fd27844',
  data: {},
  event: Event.Death,
  action: 'load declaration data for review',
  downloadStatus: DOWNLOAD_STATUS.READY_TO_DOWNLOAD
} as unknown as IDeclaration

const SCOPES = {
  FA: ['declare'] as any as Scope,
  RA: ['validate'] as any as Scope,
  REGISTRAR: ['register'] as any as Scope,
  NONE: [] as any as Scope
}

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
  const VIEW_SCOPES = SCOPES.NONE
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('In progress', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={VIEW_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('In review', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Potential duplicate', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={VIEW_SCOPES}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Requires update', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Validated', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Archived', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Registered', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Registered + Printed in advance', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })

  it('Pending correction', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={VIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.VIEW_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    expect(window.location.href).toContain(
      defaultDeclaration.id + '/viewRecord'
    )
  })
})

describe('Review action', () => {
  const REVIEW_SCOPES = SCOPES.RA
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION,
      ACTION.REVIEW_CORRECTION_REQUEST,
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={REVIEW_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION,
      ACTION.REVIEW_CORRECTION_REQUEST,
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(window.location.href).toContain('reviews/' + defaultDeclaration.id)
  })

  it('In review - Not downloaded - Has Scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('In review - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={SCOPES.NONE}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate - Not downloaded - Has Scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={REVIEW_SCOPES}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Potential duplicate - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={REVIEW_SCOPES}
        draft={draftDeathDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(window.location.href).toContain('reviews/' + defaultDeclaration.id)
  })

  it('Requires update', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(window.location.href).toContain('reviews/' + defaultDeclaration.id)
  })

  it('Validated - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Validated - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REVIEW_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION,
      ACTION.REVIEW_CORRECTION_REQUEST,
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION,
      ACTION.REVIEW_CORRECTION_REQUEST,
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_DECLARATION,
      ACTION.REVIEW_CORRECTION_REQUEST,
      ACTION.REVIEW_POTENTIAL_DUPLICATE
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    await flushPromises()

    expect(window.location.href).toContain(
      'review-correction/' + defaultDeclaration.id
    )
  })

  it('Pending correction - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={REVIEW_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Pending correction - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [
      ACTION.REVIEW_CORRECTION_REQUEST
    ])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Update action', () => {
  const UPDATE_SCOPES = SCOPES.RA
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.UPDATE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    await flushPromises()

    expect(window.location.href).toContain('drafts/' + defaultDeclaration.id)
  })

  it('In progress - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={UPDATE_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.UPDATE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    await flushPromises()

    expect(window.location.href).toContain('reviews/' + defaultDeclaration.id)
  })

  it('In progress - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={SCOPES.NONE}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={UPDATE_SCOPES}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('In review', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={UPDATE_SCOPES}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.UPDATE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()

    expect(window.location.href).toContain('reviews/' + defaultDeclaration.id)
  })

  it('Requires update - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Validated', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={UPDATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.UPDATE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Archive action', () => {
  const ARCHIVE_SCOPES = ['validate', 'register'] as any as Scope
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress - Downloaded', async () => {
    const { store, history } = createStore()
    const toggleDisplayDialogMock = vi.fn()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('In progress - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={SCOPES.NONE}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('In review - Downloaded', async () => {
    const { store, history } = createStore()
    const toggleDisplayDialogMock = vi.fn()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('In review - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={SCOPES.NONE}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Requires update - Downloaded', async () => {
    const { store, history } = createStore()
    const toggleDisplayDialogMock = vi.fn()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('Requires update - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={SCOPES.NONE}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Validated - Downloaded', async () => {
    const { store, history } = createStore()
    const toggleDisplayDialogMock = vi.fn()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')

    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('Validated - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={SCOPES.NONE}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftDeathNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Archived', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={ARCHIVE_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ARCHIVE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Reinstate action', () => {
  const REINSTATE_SCOPES = SCOPES.RA
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={REINSTATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived - Downloaded', async () => {
    const { store, history } = createStore()
    const toggleDisplayDialogMock = vi.fn()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={REINSTATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={toggleDisplayDialogMock}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)
    node?.simulate('click')
    expect(toggleDisplayDialogMock).toHaveBeenCalled()
  })

  it('Archived - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={REINSTATE_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={REINSTATE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.REINSTATE_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Print action', () => {
  const PRINT_SCOPES = SCOPES.RA
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={PRINT_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={PRINT_SCOPES}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()
    expect(window.location.href).toContain(
      'cert/collector/' + defaultDeclaration.id
    )
  })

  it('Registered - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered + Printed in advance', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Pending correction', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={PRINT_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.PRINT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Issue action', () => {
  const ISSUE_SCOPES = SCOPES.RA
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={ISSUE_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={ISSUE_SCOPES}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()
    expect(window.location.href).toContain('issue/' + defaultDeclaration.id)
  })

  it('Registered + Printed in advance - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Pending correction', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={ISSUE_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.ISSUE_CERTIFICATE])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Correct action', () => {
  const CORRECTION_SCOPES = SCOPES.RA
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In progress', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={CORRECTION_SCOPES}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Potential duplicate', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftDeathNotDownloaded}
        duplicates={['duplicate1']}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Requires update', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REJECTED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Validated', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.VALIDATED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Archived', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.ARCHIVED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()
    expect(window.location.href).toContain(
      'correction/' + defaultDeclaration.id
    )
  })

  it('Registered - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.REGISTERED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered + Printed in advance - Does not have scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Registered + Printed in advance - Not downloaded - Has scope', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.DISABLED)
  })

  it('Registered + Printed in advance - Downloaded', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CERTIFIED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')

    await flushPromises()
    expect(window.location.href).toContain(
      'correction/' + defaultDeclaration.id
    )
  })

  it('Pending correction', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.CORRECTION_REQUESTED
        }}
        scope={CORRECTION_SCOPES}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.CORRECT_RECORD])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Delete declaration action', () => {
  it('Draft', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DRAFT
        }}
        scope={SCOPES.NONE}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status, node } = actionStatus(component, [
      ACTION.DELETE_DECLARATION
    ])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    expect(component.find('h1').hostNodes().text()).toEqual('Delete draft?')
  })

  it('In progress', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.IN_PROGRESS
        }}
        scope={SCOPES.NONE}
        draft={draftDeathDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.DELETE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('In review', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status } = actionStatus(component, [ACTION.DELETE_DECLARATION])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})

describe('Unassign action', () => {
  const UNASSIGN_SCOPES = SCOPES.REGISTRAR
  const Assignment = 'Assigned to Kennedy Mweene at Ibombo District Office'
  it('Has scope - assigned to someone else', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={UNASSIGN_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.ENABLED)

    const { status, node } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    expect(component.find('h1').hostNodes().text()).toEqual('Unassign record?')
  })

  it('Does not have scope - assigned to someone else', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.ENABLED)

    const { status } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })

  it('Assigned to self', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={SCOPES.NONE}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.HIDDEN)

    const { status, node } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.ENABLED)

    node?.simulate('click')
    expect(component.find('h1').hostNodes().text()).toEqual('Unassign record?')
  })

  it('Not assigned', async () => {
    const { store, history } = createStore()
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED,
          assignment: undefined
        }}
        scope={UNASSIGN_SCOPES}
        draft={draftBirthNotDownloaded}
        toggleDisplayDialog={() => {}}
      />,
      { store, history }
    )

    const { status: assignmentStatus } = actionStatus(component, [Assignment])
    expect(assignmentStatus).toBe(ACTION_STATUS.HIDDEN)

    const { status } = actionStatus(component, [ACTION.UNASSIGN])
    expect(status).toBe(ACTION_STATUS.HIDDEN)
  })
})
