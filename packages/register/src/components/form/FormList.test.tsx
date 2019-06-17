import * as React from 'react'
import { createTestComponent } from '@register/tests/util'
import { FormList } from '@register/components/form/FormList'
import { ReactWrapper } from 'enzyme'
import * as actions from '@register/i18n/actions'
import { createStore } from '@register/store'

describe('when user is in the document upload page', () => {
  const { store } = createStore()
  let formListComponent: ReactWrapper<{}, {}>

  const listItems = [
    {
      id: 'register.form.section.documents.list.informantAttestation',
      defaultMessage: 'Attestation of the informant, or'
    },
    {
      id: 'register.form.section.documents.list.attestedVaccination',
      defaultMessage: 'Attested copy of the vaccination (EPI) card, or'
    },
    {
      id: 'register.form.section.documents.list.attestedBirthRecord',
      defaultMessage: 'Attested copy of hospital document or birth record, or'
    },
    {
      id: 'register.form.section.documents.list.certification',
      defaultMessage:
        'Certification regarding NGO worker authorized by registrar in favour of date of birth, or'
    },
    {
      id: 'register.form.section.documents.list.otherDocuments',
      defaultMessage:
        'Attested copy(s) of the document as prescribed by the Registrar'
    }
  ]

  beforeEach(async () => {
    const testComponent = createTestComponent(
      <FormList list={listItems} />,
      store
    )
    formListComponent = testComponent.component
  })
  it('renders the whole list', () => {
    const items = formListComponent.find('ul li')
    expect(items.length).toBe(listItems.length)
  })
  it('check first list item', () => {
    const firstItem = formListComponent.find('ul li').first()

    expect(firstItem.text()).toBe(listItems[0].defaultMessage)
  })
  it('check last list item', () => {
    const lastItem = formListComponent.find('ul li').last()

    expect(lastItem.text()).toBe(listItems[listItems.length - 1].defaultMessage)
  })
  it('renders first list item text in bengali', async () => {
    const action = actions.changeLanguage({ language: 'bn' })
    store.dispatch(action)

    const firstItem = formListComponent.find('ul li').first()
    expect(firstItem.text()).toBe('তথ্যপ্রদানকারীর সত্যায়িত পরিচয় পত্র অথবা,')
  })
  it('renders last list item text in bengali', async () => {
    const action = actions.changeLanguage({ language: 'bn' })
    store.dispatch(action)

    const lastItem = formListComponent.find('ul li').last()
    expect(lastItem.text()).toBe(
      'রেজিস্টারের চাহিদা মোতাবেক অন্যান্য কাগজপত্রের সত্যায়িত অনুলিপি'
    )
  })
  it('check for zero list item', () => {
    const items = formListComponent.find('ul li')
    expect(items.length).toBeTruthy()
  })
})
