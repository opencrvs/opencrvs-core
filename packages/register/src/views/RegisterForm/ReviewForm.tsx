import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps } from 'react-intl'
import {
  RegisterForm,
  IFormProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
// import { store } from '@opencrvs/register/src/App'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { getReviewForm } from '@opencrvs/register/src/forms/register/review-selectors'
import { REVIEW_BIRTH_PARENT_FORM_TAB } from '@opencrvs/register/src/navigation/routes'

type IProps = IFormProps & InjectedIntlProps & RouteComponentProps<{}>

export class ReviewFormView extends React.Component<IProps> {
  render() {
    return <RegisterForm {...this.props} />
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match } = props
  const form = getReviewForm(state)

  const draft = state.drafts.drafts.find(
    ({ id }) => id === parseInt(match.params.draftId, 10)
  )

  if (!draft) {
    throw new Error(`Review "${match.params.draftId}" missing!`)
  }

  return {
    draft,
    registerForm: form,
    tabRoute: REVIEW_BIRTH_PARENT_FORM_TAB
  }
}

export const ReviewForm = connect<IFormProps>(mapStatetoProps)(ReviewFormView)
