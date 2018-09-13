import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl } from 'react-intl'

import { goToEvents as goToEventsAction } from 'src/navigation'
import styled from 'src/styled-components'

const DummyView = styled.img`
  width: 100%;
  height: auto;
  z-index: 1;
`

class HomeView extends React.Component<
  InjectedIntlProps & {
    goToEvents: typeof goToEventsAction
  }
> {
  render() {
    return (
      <DummyView onClick={this.props.goToEvents} src="/assets/home-view.png" />
    )
  }
}

export const Home = injectIntl(
  connect(null, { goToEvents: goToEventsAction })(HomeView)
)
