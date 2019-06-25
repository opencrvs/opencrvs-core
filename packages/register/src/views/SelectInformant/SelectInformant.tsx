import * as React from 'react'

import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'

import {
  PrimaryButton,
  TertiaryButton,
  ICON_ALIGNMENT
} from '@opencrvs/components/lib/buttons'
import {
  goToApplicationContact as goToRegistration,
  goToRegistrarHomeTab as goHomeAction,
  goBack as goBackAction,
  goToBirthRegistrationAsParent
} from '@register/navigation'
import { createApplication, storeApplication } from '@register/applications'
import { Event } from '@register/forms'
import styled from '@register/styledComponents'
import { EventTopBar, RadioButton } from '@opencrvs/components/lib/interface'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { BackArrow } from '@opencrvs/components/lib/icons'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  newBirthRegistration: {
    id: 'register.selectInformant.newBirthRegistration',
    defaultMessage: 'New birth application',
    description: 'The message that appears for new birth registrations'
  },
  informantTitle: {
    id: 'register.selectInformant.informantTitle',
    defaultMessage: 'Who is applying for birth registration?',
    description: 'The title that appears when asking for the informant'
  },
  mother: {
    id: 'register.selectInformant.mother',
    defaultMessage: 'Mother',
    description: 'The description that appears when asking for the informant'
  },
  father: {
    id: 'register.selectInformant.father',
    defaultMessage: 'Father',
    description: 'The title that appears when selecting the parent as informant'
  },
  parents: {
    id: 'register.selectInformant.parents',
    defaultMessage: 'Mother & Father',
    description:
      'The description that appears when selecting the parent as informant'
  },
  someoneElse: {
    id: 'register.selectInformant.someoneElse',
    defaultMessage: 'Someone Else',
    description:
      'The description that appears when selecting someone else as informant'
  },
  self: {
    id: 'register.selectInformant.self',
    defaultMessage: 'Self (18+)',
    description: 'The title that appears when selecting self as informant'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  errorMessage: {
    id: 'register.selectInformant.errorMessage',
    defaultMessage: 'Please select who is present and applying',
    description: 'Error Message to show when no event is being selected'
  },
  continueButton: {
    id: 'register.selectVitalEvent.continueButton',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  }
})
const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  position: absolute;
  width: 100%;
  height: 100%;
`
const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 16px;
  position: relative;
`
const Title = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  margin: 0;
`
const Actions = styled.div`
  padding: 32px 0;
  & div:not(:last-child) {
    margin-bottom: 16px;
  }
`
enum INFORMANT {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  BOTH_PARENTS = 'BOTH_PARENTS',
  SELF = 'SELF',
  SOMEONE_ELSE = 'SOMEONE_ELSE'
}
export class SelectInformantView extends React.Component<
  {
    informantRegistration: (informant: string) => void
    goHome: () => void
    goBack: () => void
  } & InjectedIntlProps
> {
  state = {
    informant: ''
  }
  handleContinue = () => {
    if (this.state.informant === 'error') {
      this.setState({ informant: 'error' })
    } else {
      this.props.informantRegistration(this.state.informant)
    }
  }
  render() {
    const { intl } = this.props
    return (
      <>
        <EventTopBar
          title={intl.formatMessage(messages.newBirthRegistration)}
          goHome={this.props.goHome}
        />

        <BodyContent id="select_informant_view">
          <TertiaryButton
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <BackArrow />}
            onClick={this.props.goBack}
          >
            {intl.formatMessage(messages.back)}
          </TertiaryButton>
          <Title>{intl.formatMessage(messages.informantTitle)}</Title>
          {this.state.informant === 'error' && (
            <ErrorText>{intl.formatMessage(messages.errorMessage)}</ErrorText>
          )}
          <Actions id="select_parent_informant">
            <RadioButton
              size="large"
              key="select_informant_mother"
              name="birthevent"
              label={intl.formatMessage(messages.mother)}
              value={INFORMANT.MOTHER}
              id="select_informant_mother"
              selected={
                this.state.informant === INFORMANT.MOTHER
                  ? INFORMANT.MOTHER
                  : ''
              }
              onChange={() => this.setState({ informant: INFORMANT.MOTHER })}
            />
            <RadioButton
              size="large"
              key="select_informant_father"
              name="birthevent"
              label={intl.formatMessage(messages.father)}
              value={INFORMANT.FATHER}
              id="select_informant_father"
              selected={
                this.state.informant === INFORMANT.FATHER
                  ? INFORMANT.FATHER
                  : ''
              }
              onChange={() => this.setState({ informant: INFORMANT.FATHER })}
            />
            <RadioButton
              size="large"
              key="select_informant_parents"
              name="birthevent"
              label={intl.formatMessage(messages.parents)}
              value={INFORMANT.BOTH_PARENTS}
              id="select_informant_parents"
              selected={
                this.state.informant === INFORMANT.BOTH_PARENTS
                  ? INFORMANT.BOTH_PARENTS
                  : ''
              }
              onChange={() =>
                this.setState({ informant: INFORMANT.BOTH_PARENTS })
              }
            />
            <RadioButton
              size="large"
              key="select_informant_self"
              name="birthevent"
              label={intl.formatMessage(messages.self)}
              value={INFORMANT.SELF}
              id="select_informant_self"
              selected={
                this.state.informant === INFORMANT.SELF ? INFORMANT.SELF : ''
              }
              onChange={() => this.setState({ informant: INFORMANT.SELF })}
            />
            <RadioButton
              size="large"
              key="select_informant_someone"
              name="birthevent"
              label={intl.formatMessage(messages.someoneElse)}
              value={INFORMANT.SOMEONE_ELSE}
              id="select_informant_someone"
              selected={
                this.state.informant === INFORMANT.SOMEONE_ELSE
                  ? INFORMANT.SOMEONE_ELSE
                  : ''
              }
              onChange={() =>
                this.setState({ informant: INFORMANT.SOMEONE_ELSE })
              }
            />
          </Actions>
          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(messages.continueButton)}
          </PrimaryButton>
        </BodyContent>
      </>
    )
  }
}

export const SelectInformant = connect(
  null,
  function mapDispatchToProps(dispatch: Dispatch) {
    return {
      informantRegistration: () => {
        const application = createApplication(Event.BIRTH)
        dispatch(storeApplication(application))
        dispatch(goToBirthRegistrationAsParent(application.id))
      },
      // informantRegistration: (informant: string) => {
      //   dispatch(goToRegistration(informant))
      // },
      goHome: () => dispatch(goHomeAction('review')),
      goBack: () => dispatch(goBackAction())
    }
  }
)(injectIntl(SelectInformantView))
