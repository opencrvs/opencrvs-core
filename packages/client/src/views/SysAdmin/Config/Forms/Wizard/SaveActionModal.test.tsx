/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import React from 'react'
import { MockedResponse } from 'react-apollo/test-links'
import { CREATE_FORM_DRAFT } from '@client/views/SysAdmin/Config/Forms/mutations'
import { IFormDraft } from '@client/forms/configuration/formDrafts/utils'
import { DraftStatus } from '@client/utils/gateway'
import { Event } from '@client/forms'
import { SaveActionContext, SaveActionModal } from './SaveActionModal'
import { AppStore, createStore } from '@client/store'
import { History } from 'history'
import { createTestComponent, flushPromises } from '@client/tests/util'
import { ReactWrapper } from 'enzyme'
import { ActionStatus } from '@client/views/SysAdmin/Config/Forms/utils'
import routeData from 'react-router'

const draft: IFormDraft = {
  event: Event.BIRTH,
  status: DraftStatus.Draft,
  version: 1,
  history: [],
  updatedAt: Date.now(),
  createdAt: Date.now()
}

const graphqlMocks: MockedResponse[] = [
  {
    request: {
      query: CREATE_FORM_DRAFT,
      variables: {
        event: Event.BIRTH,
        comment: 'No comment',
        questions: [
          {
            fieldId: 'birth.child.child-view-group.vaccination',
            fieldName: 'vaccination',
            preceedingFieldId: 'birth.child.child-view-group.attendantAtBirth',
            required: false,
            enabled: '',
            custom: true,
            label: [
              {
                lang: 'en',
                descriptor: {
                  defaultMessage: 'What vaccinations has the child received?',
                  description: 'Label for form field: vaccination question',
                  id: 'form.field.label.vaccination'
                }
              }
            ],
            placeholder: [
              {
                lang: 'en',
                descriptor: {
                  defaultMessage: 'E.G. Polio, Diptheria',
                  description:
                    'Placeholder for form field: vaccination question',
                  id: 'form.field.label.vaccinationPlaceholder'
                }
              }
            ],
            tooltip: [
              {
                lang: 'en',
                descriptor: {
                  defaultMessage: 'Enter the Vaccine name',
                  description: 'Tooltip for form field: vaccination question',
                  id: 'form.field.label.vaccinationTooltip'
                }
              }
            ],
            description: [
              {
                lang: 'en',
                descriptor: {
                  defaultMessage: 'Vaccine name',
                  description: 'Input field for vaccination question',
                  id: 'form.field.label.vaccinationDescription'
                }
              }
            ],
            fieldType: 'TEXT'
          }
        ]
      }
    },
    result: {
      data: {
        createFormDraft: draft
      }
    }
  }
]

function WrappedSaveActionModal() {
  const [status, setStatus] = React.useState<ActionStatus>(ActionStatus.MODAL)
  return (
    <SaveActionContext.Provider value={{ status, setStatus }}>
      <SaveActionModal />
    </SaveActionContext.Provider>
  )
}

let component: ReactWrapper<{}, {}>

describe('SaveActionModal', () => {
  let store: AppStore
  let history: History

  beforeEach(async () => {
    jest.spyOn(routeData, 'useParams').mockReturnValue({ event: Event.BIRTH })
    ;({ store, history } = createStore())
    component = await createTestComponent(<WrappedSaveActionModal />, {
      store,
      history,
      graphqlMocks
    })
    // wait for next event loop to get success state
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    component.update()
  })

  it('should save draft properly', async () => {
    component
      .find('#save-comment')
      .hostNodes()
      .simulate('change', { target: { value: 'No comment' } })
    component.update()
    component.find('#save-btn').hostNodes().simulate('click')
    await flushPromises()
    expect(store.getState().formConfig.birth?.formDraft.version).toBe(1)
  })
})
