import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { PrintCertificateAction } from './PrintCertificateAction'
import { ReactWrapper } from 'enzyme'
import { createDraft, storeDraft, setInitialDrafts } from 'src/drafts'

import { createStore } from '../../store'
import { IFormSection } from '@opencrvs/register/src/forms'

describe('when user is in the register form', async () => {
  const { store } = createStore()
  const draft = createDraft()
  const initalDrafts = JSON.parse('[]')
  store.dispatch(setInitialDrafts(initalDrafts))
  store.dispatch(storeDraft(draft))
  let component: ReactWrapper<{}, {}>

  const mock: any = jest.fn()

  const formSection: IFormSection = {
    id: 'print',
    viewType: 'form',
    name: {
      id: 'register.workQueue.print.form.name',
      defaultMessage: 'Print',
      description: 'The title of review button in list expansion actions'
    },
    title: {
      id: 'register.workQueue.print.form.name',
      defaultMessage: 'Print',
      description: 'The title of review button in list expansion actions'
    },
    fields: []
  }

  describe('when user is in the mother section', () => {
    beforeEach(async () => {
      const testComponent = createTestComponent(
        <PrintCertificateAction
          backLabel="Back"
          title="Print certificate"
          registrationId="asdhdqe2472487jsdfsdf"
          togglePrintCertificateSection={mock}
          printCertificateFormSection={formSection}
        />,
        store
      )
      component = testComponent.component
    })
    it('renders the page', () => {
      expect(
        component.find('#action_page_back_button').hostNodes()
      ).toHaveLength(1)
    })
  })
})
