import { SubPage } from '@opencrvs/components/lib/interface'
import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { goBack } from 'src/navigation'

type IProps = {
  goBack: () => void
} & InjectedIntlProps

class SecurityQuestionView extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props)
  }

  render() {
    return (
      <SubPage
        emptyTitle={''}
        title="Page Title"
        goBack={() => this.props.goBack()}
      >
        <h3>Set your security questions</h3>
        <p>
          From the drop down lists below, select questions that can be used
          later to confirm your identity should you forget your password.
        </p>
      </SubPage>
    )
  }
}

export const SecurityQuestion = connect(
  null,
  {
    goBack
  }
)(injectIntl(SecurityQuestionView))
