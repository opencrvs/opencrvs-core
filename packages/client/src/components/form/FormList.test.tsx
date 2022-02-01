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
import * as React from 'react'
import { createTestComponent } from '@client/tests/util'
import { FormList } from '@client/components/form/FormList'
import { ReactWrapper } from 'enzyme'
import * as actions from '@client/i18n/actions'
import { createStore, AppStore } from '@client/store'
import { History } from 'history'

describe('when user is in the document upload page', () => {
  let component: ReactWrapper<{}, {}>
  let store: AppStore
  let history: History
  const listItems = [
    {
      id: 'form.section.documents.list.informantAttestation',
      defaultMessage: 'Attestation of the informant, or'
    },
    {
      id: 'form.section.documents.list.attestedVaccination',
      defaultMessage: 'Attested copy of the vaccination (EPI) card, or'
    },
    {
      id: 'form.section.documents.list.attestedBirthRecord',
      defaultMessage: 'Attested copy of hospital document or birth record, or'
    },
    {
      id: 'form.section.documents.list.certification',
      defaultMessage:
        'Certification regarding NGO worker authorized by registrar in favour of date of birth, or'
    },
    {
      id: 'form.section.documents.list.otherDocuments',
      defaultMessage:
        'Attested copy(s) of the document as prescribed by the Registrar'
    }
  ]

  beforeEach(async () => {
    ;({ store, history } = createStore())

    component = await createTestComponent(<FormList list={listItems} />, {
      store,
      history
    })
  })
  it('renders the whole list', () => {
    const items = component.find('ul li')
    expect(items.length).toBe(listItems.length)
  })
  it('check first list item', () => {
    const firstItem = component.find('ul li').first()

    expect(firstItem.text()).toBe(listItems[0].defaultMessage)
  })
  it('check last list item', () => {
    const lastItem = component.find('ul li').last()

    expect(lastItem.text()).toBe(listItems[listItems.length - 1].defaultMessage)
  })
  it('renders first list item text in bengali', async () => {
    const action = actions.changeLanguage({ language: 'bn' })
    await store.dispatch(action)

    const firstItem = component.find('ul li').first()

    // No clue if this is what it should say..
    expect(firstItem.update().text()).toBe(
      'তথ্যপ্রদানকারীর সত্যায়িত পরিচয় পত্র অথবা,ইপিআই কার্ডের সত্যায়িত অনুলিপিহাসপাতালের ডকুমেন্টের সত্যায়িত অনুলিপি অথবা জন্ম রেকর্ড অথবাঅনুমোদিত জন্ম রেজিস্টাররেজিস্টারের চাহিদা মোতাবেক অন্যান্য কাগজপত্রের সত্যায়িত অনুলিপি'
    )
  })
  it('renders last list item text in bengali', async () => {
    const action = actions.changeLanguage({ language: 'bn' })
    store.dispatch(action)

    const lastItem = component.update().find('ul li').last()
    expect(lastItem.text()).toBe(
      'রেজিস্টারের চাহিদা মোতাবেক অন্যান্য কাগজপত্রের সত্যায়িত অনুলিপি'
    )
  })
  it('check for zero list item', () => {
    const items = component.find('ul li')
    expect(items.length).toBeTruthy()
  })
})
