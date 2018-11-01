import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'

const messages = defineMessages({
  hello: {
    id: 'performance.home.testHello',
    defaultMessage: 'Hello',
    description: 'testing translations'
  }
})

class HomeView extends React.Component<InjectedIntlProps> {
  render() {
    const { intl } = this.props
    return <div>{intl.formatMessage(messages.hello)}</div>
  }
}

export const Home = connect(null)(injectIntl(HomeView))
