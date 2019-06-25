import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import { goBack as goBackAction } from '@register/navigation'
import { Cross, ApplicationIcon } from '@opencrvs/components/lib/icons'
import { PrimaryButton, Button } from '@opencrvs/components/lib/buttons'
import { RadioButton } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { getLanguage } from '@register/i18n/selectors'
import { IStoreState } from '@register/store'

const messages = defineMessages({
  title: {
    id: 'register.SelectContactPoint.title',
    defaultMessage: 'Birth application',
    description: 'The title that appears on the select vital event page'
  },
  heading: {
    id: 'register.SelectContactPoint.heading',
    defaultMessage: 'Who is the main point of contact for this application?',
    description: 'The section heading on the page'
  },
  continueButton: {
    id: 'register.SelectContactPoint.continueButton',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  }
})

const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 0 16px;
  position: relative;
`
const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 64px;
  background: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.shadows.mistyShadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const TopBarTitle = styled.h4`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  padding-left: 16px;
`
const Item = styled.span`
  display: flex;
  align-items: center;
`
const Title = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
`
const Actions = styled.div`
  padding: 32px 0;
  & div:first-child {
    margin-bottom: 16px;
  }
`
const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  position: absolute;
  width: 100%;
  height: 100%;
`

interface IState {
  selected: string
}

type IProps = InjectedIntlProps & {
  language: string
  goBack: typeof goBackAction
}

class SelectContactPointView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      selected: ''
    }
  }

  render() {
    const { intl } = this.props
    return (
      <Container>
        <TopBar>
          <Item>
            <ApplicationIcon />
            <TopBarTitle>{intl.formatMessage(messages.title)}</TopBarTitle>
          </Item>
          <Item>
            <Button icon={() => <Cross />} onClick={this.props.goBack} />
          </Item>
        </TopBar>
        <BodyContent>
          <Title>{intl.formatMessage(messages.heading)}</Title>
          <Actions id="select_vital_event_view">
            <RadioButton
              size="large"
              key="mother"
              name="mother"
              label="Mother"
              value="mother"
              id="contact_mother"
              selected={this.state.selected}
              onChange={() => this.setState({ selected: 'mother' })}
            />
            <RadioButton
              size="large"
              key="father"
              name="father"
              label="Father"
              value="father"
              id="contact_father"
              selected={this.state.selected}
              onChange={() => this.setState({ selected: 'father' })}
            />
          </Actions>
          <PrimaryButton id="continue" onClick={console.log}>
            {intl.formatMessage(messages.continueButton)}
          </PrimaryButton>
        </BodyContent>
      </Container>
    )
  }
}

const mapStateToProps = (store: IStoreState) => {
  return {
    language: getLanguage(store)
  }
}

export const SelectContactPoint = connect(
  mapStateToProps,
  {
    goBack: goBackAction
  }
)(injectIntl(SelectContactPointView))
