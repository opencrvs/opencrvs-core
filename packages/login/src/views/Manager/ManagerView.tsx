import * as React from 'react'
import styled from 'styled-components'
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import * as actions from '@login/login/actions'
import { Action, ActionList } from '@opencrvs/components/lib/buttons'
import { REGISTER_APP, PERFORMANCE_APP } from '@login/navigation/routes'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  registerAppTitle: {
    id: 'login.manager.registerAppTitle',
    defaultMessage: 'OpenCRVS Homepage',
    description: 'The title that appears on the register app action button'
  },
  registerAppDescription: {
    id: 'login.manager.registerAppDescription',
    defaultMessage:
      'Manage applications, registrations and certifications here.',
    description:
      'The description that appears on the register app action button'
  },
  performanceAppTitle: {
    id: 'login.manager.performanceAppTitle',
    defaultMessage: 'Performance Management',
    description: 'The title that appears on the paerformance app action button'
  },
  performanceAppDescription: {
    id: 'login.manager.performanceAppDescription',
    defaultMessage:
      "Analyse the performance of a particular area of your country in it's Civil Registration.",
    description:
      'The description that appears on the performance app action button'
  }
})

const Wrapper = styled.div`
  position: relative;
  top: 218px;
`

export class ManagerView extends React.Component<
  {
    gotoApp: (appId: string) => void
  } & InjectedIntlProps
> {
  render() {
    const { intl, gotoApp } = this.props
    return (
      <Wrapper>
        <ActionList>
          <Action
            id="register_app_action_button"
            title={intl.formatMessage(messages.registerAppTitle)}
            description={intl.formatMessage(messages.registerAppDescription)}
            onClick={() => gotoApp(REGISTER_APP)}
          />
          <Action
            id="performance_app_action_button"
            title={intl.formatMessage(messages.performanceAppTitle)}
            description={intl.formatMessage(messages.performanceAppDescription)}
            onClick={() => gotoApp(PERFORMANCE_APP)}
          />
        </ActionList>
      </Wrapper>
    )
  }
}

export const ManagerViewContainer = connect(
  null,
  function mapDispatchToProps(dispatch: Dispatch) {
    return {
      gotoApp: (appId: string) => {
        dispatch(actions.gotoApp(appId))
      }
    }
  }
)(injectIntl(ManagerView))
