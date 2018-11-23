import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps } from 'react-intl'
import { createStore, AppStore } from 'src/store'
import { storage } from 'src/storage'
import { setInitialDrafts, IDraft } from 'src/drafts'
import { RegisterForm } from './RegisterForm'

type IReviewProps = {
  store: AppStore
  history: History
}

type IProps = IReviewProps & InjectedIntlProps & RouteComponentProps<{}>

const { store } = createStore()

export class ReviewForm extends React.Component<IProps> {
  componentDidMount() {
    this.loadDraftsFromStorage()
  }
  async loadDraftsFromStorage() {
    const draftsString = await storage.getItem('drafts')
    const drafts = JSON.parse(draftsString ? draftsString : '[]')
    const reviewDrafts = drafts.filter((draft: IDraft) => draft.review)
    store.dispatch(setInitialDrafts(reviewDrafts))
  }

  render() {
    return <RegisterForm {...this.props} />
  }
}
