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
import { createTestComponent } from '@client/tests/util'
import { createStore } from '@client/store'
import { ReactWrapper } from 'enzyme'
import {
  DOWNLOAD_STATUS,
  IDeclaration,
  storeDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { ActionMenu } from './ActionMenu'
import { Scope } from '@sentry/react'
import { Event } from '@client/utils/gateway'

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

const scopes = ['validate'] as any as Scope

enum ACTION_STATUS {
  HIDDEN = 'Hidden',
  ENABLED = 'Enabled',
  DISABLED = 'Disabled'
}

enum ACTION {
  VIEW_RECORD = 'View record',
  VIEW_DECLARATION = 'View declaration'
}

const actionStatus = (
  component: ReactWrapper<{}, {}>,
  targetAction: string
): ACTION_STATUS => {
  const target = component
    .find('li')
    .map((a) => a)
    .filter((a) => a.text() === targetAction)

  if (target.length === 0) return ACTION_STATUS.HIDDEN

  return target[0].prop('disabled')
    ? ACTION_STATUS.DISABLED
    : ACTION_STATUS.ENABLED
}

describe('View action', () => {
  it('Can view record', async () => {
    const { store, history } = createStore()
    store.dispatch(storeDeclaration(defaultDeclaration))
    const component = await createTestComponent(
      <ActionMenu
        declaration={defaultDeclaration}
        scope={scopes}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={function (): void {
          throw new Error('Function not implemented.')
        }}
      />,
      { store, history }
    )
    expect(actionStatus(component, ACTION.VIEW_RECORD)).toBe(
      ACTION_STATUS.ENABLED
    )
  })

  it('Can view declaration', async () => {
    const { store, history } = createStore()
    store.dispatch(storeDeclaration(defaultDeclaration))
    const component = await createTestComponent(
      <ActionMenu
        declaration={{
          ...defaultDeclaration,
          status: SUBMISSION_STATUS.DECLARED
        }}
        scope={scopes}
        draft={draftBirthDownloaded}
        toggleDisplayDialog={function (): void {
          throw new Error('Function not implemented.')
        }}
      />,
      { store, history }
    )
    expect(actionStatus(component, ACTION.VIEW_DECLARATION)).toBe(
      ACTION_STATUS.ENABLED
    )
  })
})
