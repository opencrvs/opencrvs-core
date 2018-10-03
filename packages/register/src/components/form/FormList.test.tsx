import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { FormList } from './FormList'
import { ReactWrapper } from 'enzyme'
import { defineMessages } from 'react-intl'
import * as actions from 'src/i18n/actions'
import { Store } from 'redux'

describe('when user is in the preview page', () => {
  let store: Store
  let formListComponent: ReactWrapper<{}, {}>
  const messages = defineMessages({
    informantAttestation: {
      id: 'register.form.section.documents.list.informantAttestation',
      defaultMessage: 'Attestation of the informant, or',
      description: 'Attested document of the informant'
    },
    attestedVaccination: {
      id: 'register.form.section.documents.list.attestedVaccination',
      defaultMessage: 'Attested copy of the vaccination (EPI) card, or',
      description: 'Attested copy of the vaccination card'
    },
    attestedBirthRecord: {
      id: 'register.form.section.documents.list.attestedBirthRecord',
      defaultMessage: 'Attested copy of hospital document or birth record, or',
      description: 'Attested copy of hospital document'
    },
    certification: {
      id: 'register.form.section.documents.list.certification',
      defaultMessage:
        'Certification regarding NGO worker authorized by registrar in favour of date of birth, or',
      description: 'Certification regarding NGO worker'
    },
    otherDocuments: {
      id: 'register.form.section.documents.list.otherDocuments',
      defaultMessage:
        'Attested copy(s) of the document as prescribed by the Registrar',
      description: 'Attested copy(s) of the document'
    }
  })
  const listItems = [
    messages.informantAttestation,
    messages.attestedVaccination,
    messages.attestedBirthRecord,
    messages.certification,
    messages.otherDocuments
  ]

  beforeEach(async () => {
    const testComponent = createTestComponent(<FormList list={listItems} />)
    formListComponent = testComponent.component
    store = testComponent.store
  })
  it('renders the whole list', () => {
    const items = formListComponent.find('ul li')
    expect(items.length).toBe(listItems.length)
  })
  it('renders last list item text in bengali', async () => {
    const action = actions.changeLanguage({ language: 'bn' })
    store.dispatch(action)

    const firstItem = formListComponent.find('ul li').last()
    expect(firstItem.text()).toBe(
      'রেজিস্টারের চাহিদা মোতাবেক অন্যান্য কাগজপত্রের সত্যায়িত অনুলিপি'
    )
  })
  it('renders first list item text in english', async () => {
    const action = actions.changeLanguage({ language: 'en' })
    store.dispatch(action)

    const firstItem = formListComponent.find('ul li').first()
    expect(firstItem.text()).toBe(listItems[0].defaultMessage)
  })
})
