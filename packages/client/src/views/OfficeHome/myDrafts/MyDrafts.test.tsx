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
import {
  createDeclaration,
  IDeclaration,
  storeDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { createStore } from '@client/store'
import { createTestComponent } from '@client/tests/util'
import { formattedDuration } from '@client/utils/date-formatting'
import { EventType } from '@client/utils/gateway'
import { Workqueue } from '@opencrvs/components/lib/Workqueue'
import * as React from 'react'
import { MyDrafts } from './MyDrafts'

describe('My drafts tab', () => {
  it('renders all items returned from local storage', async () => {
    const { store } = createStore()
    const TIME_STAMP = 1562912635549
    const drafts: IDeclaration[] = [
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        data: {
          registration: {
            informantType: 'MOTHER',
            informant: 'MOTHER_ONLY',
            registrationPhone: '01722222222',
            whoseContactDetails: 'MOTHER'
          },
          child: {
            firstNamesEng: 'Anik',
            familyNameEng: 'Hoque'
          }
        },
        event: EventType.Birth,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        modifiedOn: TIME_STAMP
      },
      {
        id: 'e6605607-92e0-4625-87d8-c168205bdde7',
        event: EventType.Birth,
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          registration: {
            informantType: 'MOTHER',
            informant: 'MOTHER_ONLY',
            registrationPhone: '01722222222',
            whoseContactDetails: 'MOTHER'
          },
          child: {
            firstNamesEng: 'Anik',
            familyNameEng: 'Hoque'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        data: {
          deceased: {
            firstNamesEng: 'Anik',
            familyNameEng: 'Hoque'
          }
        },
        event: EventType.Death,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        modifiedOn: TIME_STAMP
      },

      {
        id: '607afa75-4fb0-4785-9388-724911d62809',
        data: {
          deceased: {
            firstNamesEng: 'Anik',
            familyNameEng: 'Hoque'
          }
        },
        event: EventType.Death,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        modifiedOn: TIME_STAMP
      }
    ]
    const { component: testComponent } = await createTestComponent(
      <MyDrafts
        currentPage={1}
        pageSize={10}
        onPageChange={(_pageId: number) => {}}
      />,
      { store }
    )

    for (const draft of drafts) {
      store.dispatch(storeDeclaration(draft))
    }

    testComponent.update()

    const data = testComponent
      .find(Workqueue)
      .prop<Array<Record<string, string>>>('content')
    const EXPECTED_LAST_UPDATE = formattedDuration(TIME_STAMP)

    expect(data.length).toBe(drafts.length)
    expect(data[0].id).toBe('e302f7c5-ad87-4117-91c1-35eaf2ea7be8')
    expect(data[0].name).toBe('anik hoque')
    expect(data[0].lastUpdated).toBe(EXPECTED_LAST_UPDATE)
    expect(data[0].event).toBe('Birth')
    expect(data[0].actions).toBeDefined()
  })

  it('Should render pagination in drafts tab if data is more than 10', async () => {
    const { store } = createStore()
    const { component: testComponent } = await createTestComponent(
      <MyDrafts
        currentPage={1}
        pageSize={10}
        onPageChange={(_pageId: number) => {}}
      />,
      { store }
    )

    for (let i = 0; i < 12; i++) {
      store.dispatch(storeDeclaration(createDeclaration(EventType.Birth)))
    }

    testComponent.update()
    const pagiBtn = testComponent.find('#pagination_container')

    expect(pagiBtn.hostNodes()).toHaveLength(1)
    testComponent
      .find('#pagination button')
      .last()
      .hostNodes()
      .simulate('click')
  })

  it('redirects user to detail page on update click', async () => {
    const { store } = createStore()
    const TIME_STAMP = 1562912635549
    const drafts: IDeclaration[] = [
      {
        id: 'e302f7c5-ad87-4117-91c1-35eaf2ea7be8',
        event: EventType.Birth,
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          registration: {
            contactPoint: {
              value: 'MOTHER',
              nestedFields: {
                registrationPhone: '01722222222'
              }
            }
          },
          child: {
            firstNamesEng: 'Anik',
            firstNames: 'অনিক',
            familyNameEng: 'Hoque',
            familyName: 'অনিক'
          }
        }
      },
      {
        id: 'bd22s7c5-ad87-4117-91c1-35eaf2ese32bw',
        event: EventType.Birth,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        modifiedOn: TIME_STAMP,
        data: {
          child: {
            familyNameEng: 'Hoque'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f1',
        event: EventType.Death,
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            firstNamesEng: 'Anik',
            familyNameEng: 'Hoque'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f2',
        event: EventType.Death,
        modifiedOn: TIME_STAMP,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          deceased: {
            familyNameEng: 'Hoque'
          }
        }
      },
      {
        id: 'cc66d69c-7f0a-4047-9283-f066571830f4',
        event: EventType.Death,
        modifiedOn: TIME_STAMP + 1,
        submissionStatus: SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT],
        data: {
          '': {}
        }
      }
    ]
    const { component: testComponent, router } = await createTestComponent(
      <MyDrafts
        currentPage={1}
        pageSize={10}
        onPageChange={(_pageId: number) => {}}
      />,
      { store }
    )

    for (const draft of drafts) {
      store.dispatch(storeDeclaration(draft))
    }

    testComponent.update()

    expect(
      testComponent.find('#ListItemAction-0-Update').hostNodes()
    ).toHaveLength(1)

    testComponent.find('#ListItemAction-0-Update').hostNodes().simulate('click')

    testComponent.update()

    expect(router.state.location.pathname).toContain(
      '/drafts/cc66d69c-7f0a-4047-9283-f066571830f4'
    )
  })
})
