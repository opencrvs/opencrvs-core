import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import {
  goBack as goBackAction,
  goToHome as goToHomeAction
} from '@register/navigation'
import {
  PrimaryButton,
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { RadioButton, EventTopBar } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { getLanguage } from '@register/i18n/selectors'
import { IStoreState } from '@register/store'
import { TextInput, InputLabel } from '@opencrvs/components/lib/forms'
import { BackArrow } from '@opencrvs/components/lib/icons'

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
  },
  motherLabel: {
    id: 'register.SelectContactPoint.motherLabel',
    defaultMessage: 'Mother',
    description: 'Mother Label'
  },
  fatherLabel: {
    id: 'register.SelectContactPoint.fatherLabel',
    defaultMessage: 'Father',
    description: 'Father Label'
  },
  otherLabel: {
    id: 'register.SelectContactPoint.otherLabel',
    defaultMessage: 'Other',
    description: 'Other Label'
  },
  phoneNoLabel: {
    id: 'register.SelectContactPoint.phoneNoLabel',
    defaultMessage: 'Phone number',
    description: 'Phone No Label'
  },
  relationShipLabel: {
    id: 'register.SelectContactPoint.relationShipLabel',
    defaultMessage: 'RelationShip to child',
    description: 'RelationShip Label'
  },
  goBack: {
    id: 'register.SelectContactPoint.goBack',
    defaultMessage: 'Back',
    description: 'Back button text'
  }
})

const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 16px 32px;
  position: relative;
`
const Title = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
`
const Actions = styled.div`
  padding: 32px 0;

  > div {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`
const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  position: absolute;
  width: 100%;
  height: 100%;
`
const ChildContainer = styled.div`
  margin-left: 18px;
  padding-left: 33px;
  border-left: 4px solid ${({ theme }) => theme.colors.copy};
  padding-top: 0px !important;
`
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0;
`
interface IState {
  selected: string
  phoneNumber: string
  relationShip: string
}

type IProps = InjectedIntlProps & {
  language: string
  goBack: typeof goBackAction
  goToHome: typeof goToHomeAction
}
class SelectContactPointView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      selected: '',
      phoneNumber: '',
      relationShip: ''
    }
  }

  render() {
    const { intl } = this.props
    const isSmallSizedInput = true

    return (
      <Container>
        <EventTopBar
          title={intl.formatMessage(messages.title)}
          goHome={this.props.goToHome}
        />
        <BodyContent>
          <TertiaryButton
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <BackArrow />}
            onClick={this.props.goBack}
          >
            {intl.formatMessage(messages.goBack)}
          </TertiaryButton>
          <Title>{intl.formatMessage(messages.heading)}</Title>
          <Actions id="select_main_contact_point">
            <RadioButton
              size="large"
              name="mother"
              label={intl.formatMessage(messages.motherLabel)}
              value="mother"
              id="contact_mother"
              selected={this.state.selected}
              onChange={() =>
                this.setState({ selected: 'mother', phoneNumber: '' })
              }
            />

            {this.state.selected === 'mother' && (
              <ChildContainer>
                <InputContainer>
                  <InputLabel>
                    {intl.formatMessage(messages.phoneNoLabel)}
                  </InputLabel>
                  <TextInput
                    name="phoneNumber"
                    isSmallSized={isSmallSizedInput}
                    onChange={e =>
                      this.setState({ phoneNumber: e.target.value })
                    }
                  />
                </InputContainer>
              </ChildContainer>
            )}

            <RadioButton
              size="large"
              name="contactPoint"
              label={intl.formatMessage(messages.fatherLabel)}
              value="father"
              id="contact_father"
              selected={this.state.selected}
              onChange={() =>
                this.setState({ selected: 'father', phoneNumber: '' })
              }
            />

            {this.state.selected === 'father' && (
              <ChildContainer>
                <InputContainer>
                  <InputLabel>
                    {intl.formatMessage(messages.phoneNoLabel)}
                  </InputLabel>
                  <TextInput
                    name="phoneNumber"
                    isSmallSized={isSmallSizedInput}
                    onChange={e =>
                      this.setState({ phoneNumber: e.target.value })
                    }
                  />
                </InputContainer>
              </ChildContainer>
            )}

            <RadioButton
              size="large"
              name="contactPoint"
              label={intl.formatMessage(messages.otherLabel)}
              value="other"
              id="contact_other"
              selected={this.state.selected}
              onChange={() =>
                this.setState({ selected: 'other', phoneNumber: '' })
              }
            />

            {this.state.selected === 'other' && (
              <ChildContainer>
                <InputContainer>
                  <InputLabel>
                    {intl.formatMessage(messages.relationShipLabel)}
                  </InputLabel>
                  <TextInput
                    name="relationship"
                    placeholder="eg. Grandmother"
                    isSmallSized={isSmallSizedInput}
                    onChange={e =>
                      this.setState({ relationShip: e.target.value })
                    }
                  />
                </InputContainer>
                <InputContainer>
                  <InputLabel>
                    {intl.formatMessage(messages.phoneNoLabel)}
                  </InputLabel>
                  <TextInput
                    name="phoneNumber"
                    isSmallSized={isSmallSizedInput}
                    onChange={e =>
                      this.setState({ phoneNumber: e.target.value })
                    }
                  />
                </InputContainer>
              </ChildContainer>
            )}
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
    goBack: goBackAction,
    goToHome: goToHomeAction
  }
)(injectIntl(SelectContactPointView))
