import * as React from 'react'
import { createTestComponent } from 'src/tests/util'
import { MyDrafts } from './MyDrafts'
import { v4 as uuid } from 'uuid'
import { IDraft, storeDraft } from 'src/drafts'
import { IPersonDetails } from '../RegisterForm/ProcessDraftData'
import { createStore } from 'src/store'
import { DataTable } from '@opencrvs/components/lib/interface'
import { EVENT_TYPE } from 'src/utils/constants'

describe('MyRecords tests', () => {
  const { store } = createStore()
  it('it loads my drafts page', () => {
    let customDraft: IDraft

    const childDetails: IPersonDetails = {
      attendantAtBirth: 'NURSE',
      birthDate: '1999-10-10',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'নাইম',
      firstNamesEng: 'Naim',
      gender: 'male',
      multipleBirth: '2',
      placeOfBirth: 'HOSPITAL',
      birthType: 'SINGLE',
      weightAtBirth: '6'
    }
    const data = {
      child: childDetails
    }
    customDraft = { id: uuid(), eventType: EVENT_TYPE.BIRTH, data }
    store.dispatch(storeDraft(customDraft))
    const testComponent = createTestComponent(
      // @ts-ignore
      <MyDrafts />,
      store
    )
    testComponent.component.update()

    testComponent.component
      .find(DataTable)
      .find('button')
      .at(0)
      .hostNodes()
      .simulate('click')
    testComponent.component
      .find(DataTable)
      .find('button')
      .at(1)
      .hostNodes()
      .simulate('click')

    testComponent.component
      .find(DataTable)
      .find('button')
      .at(2)
      .hostNodes()
      .simulate('click')
    expect(
      testComponent.component.find('#myDrafts').hostNodes().length
    ).toEqual(1)
  })
  it('it tests with empty birthDate', () => {
    let customDraft: IDraft

    const childDetails: IPersonDetails = {
      attendantAtBirth: 'NURSE',
      birthDate: '',
      familyName: 'ইসলাম',
      familyNameEng: 'Islam',
      firstNames: 'নাইম'
    }
    const data = {
      child: childDetails
    }
    customDraft = { id: uuid(), eventType: EVENT_TYPE.BIRTH, data }
    store.dispatch(storeDraft(customDraft))

    const testComponent = createTestComponent(
      // @ts-ignore
      <MyDrafts />,
      store
    )

    testComponent.component.update()
    expect(
      testComponent.component.find('#myDrafts').hostNodes().length
    ).toEqual(1)
  })
  it('it tests with empty birthDate and trackingId', async () => {
    let customDraft: IDraft
    const data = {}
    customDraft = { id: uuid(), eventType: EVENT_TYPE.BIRTH, data }
    store.dispatch(storeDraft(customDraft))

    const testComponent = createTestComponent(
      // @ts-ignore
      <MyDrafts />,
      store
    )

    testComponent.component.update()
    expect(
      testComponent.component.find('#myDrafts').hostNodes().length
    ).toEqual(1)
  })
})
