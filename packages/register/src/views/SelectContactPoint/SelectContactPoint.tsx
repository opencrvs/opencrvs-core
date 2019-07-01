import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

import {
  goBack as goBackAction,
  goToHome as goToHomeAction,
  goToBirthRegistrationAsParent
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
import { TextInput, InputField } from '@opencrvs/components/lib/forms'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { phoneNumberFormat } from '@register/utils/validate'
import {
  RADIO_BUTTON_LARGE_STRING,
  CONTACT_POINT_FIELD_STRING,
  PHONE_NO_FIELD_STRING
} from '@register/utils/constants'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import {
  IApplication,
  createApplication,
  storeApplication,
  setInitialApplications
} from '@register/applications'
import { Event } from '@register/forms'
import { RouteComponentProps } from 'react-router'
import { BodyContent } from '@opencrvs/components/lib/layout'

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
    defaultMessage: 'Someone else',
    description: 'Other Label'
  },
  phoneNoLabel: {
    id: 'register.SelectContactPoint.phoneNoLabel',
    defaultMessage: 'Phone number',
    description: 'Phone No Label'
  },
  relationshipLabel: {
    id: 'register.SelectContactPoint.relationshipLabel',
    defaultMessage: 'RelationShip to child',
    description: 'RelationShip Label'
  },
  goBack: {
    id: 'register.SelectContactPoint.goBack',
    defaultMessage: 'Back',
    description: 'Back button text'
  },
  phoneNoError: {
    id: 'register.SelectContactPoint.phoneNoError',
    defaultMessage: 'Not a valid mobile number',
    description: 'Phone no error text'
  },
  error: {
    id: 'register.SelectContactPoint.error',
    defaultMessage: 'Please select a main point of contact',
    description: 'Error text'
  },
  relationshipPlaceHolder: {
    id: 'register.SelectContactPoint.relationshipPlaceHolder',
    defaultMessage: 'eg. Grandmother',
    description: 'Relationship place holder'
  }
})

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

  > div {
    padding: 16px 0;
  }
`

const PresentAtBirthRegistration = {
  mother: 'MOTHER_ONLY',
  father: 'FATHER_ONLY',
  parents: 'BOTH_PARENTS',
  other: 'OTHER',
  self: 'INFORMANT_ONLY'
}

enum ContactPoint {
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  OTHER = 'OTHER'
}
interface IState {
  selected: string
  phoneNumber: string
  relationShip: string
  isPhoneNoError: boolean
  touched: boolean
  isError: boolean
}
interface IMatch {
  presentAtReg: string
  applicant: string
}

type IProps = InjectedIntlProps &
  RouteComponentProps<IMatch> & {
    language: string
    goBack: typeof goBackAction
    goToHome: typeof goToHomeAction
    storeApplication: typeof storeApplication
    goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
    setInitialApplications: typeof setInitialApplications
  }
class SelectContactPointView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      selected: '',
      phoneNumber: '',
      relationShip: '',
      isPhoneNoError: false,
      touched: false,
      isError: false
    }
  }

  handlePhoneNoChange = (value: string) => {
    let invalidPhoneNo = false
    if (phoneNumberFormat(value)) {
      invalidPhoneNo = true
    }
    this.setState({
      isPhoneNoError: invalidPhoneNo ? true : false,
      phoneNumber: value,
      touched: true,
      isError: false
    })
  }

  handleSubmit = (e: any) => {
    e.preventDefault()
    if (this.state.phoneNumber && !this.state.isPhoneNoError) {
      const application: IApplication = createApplication(Event.BIRTH)
      application.data['registration'] = {
        presentAtBirthRegistration:
          PresentAtBirthRegistration[
            this.props.match.params.presentAtReg as
              | 'mother'
              | 'father'
              | 'parents'
              | 'other'
              | 'self'
          ],
        registrationPhone: this.state.phoneNumber,
        whoseContactDetails: this.state.selected,
        applicant: this.props.match.params.applicant
      }

      this.props.storeApplication(application)
      this.props.goToBirthRegistrationAsParent(application.id)
    } else {
      this.setState({
        isError: true
      })
    }
  }

  renderPhoneNumberField = (): JSX.Element => {
    return (
      <InputField
        id="phone_number"
        label={this.props.intl.formatMessage(messages.phoneNoLabel)}
        touched={this.state.touched}
        error={
          this.state.isPhoneNoError
            ? this.props.intl.formatMessage(messages.phoneNoError)
            : ''
        }
        hideAsterisk={true}
      >
        <TextInput
          id="phone_number_input"
          type="tel"
          name={PHONE_NO_FIELD_STRING}
          isSmallSized={true}
          onChange={e => this.handlePhoneNoChange(e.target.value)}
          touched={this.state.touched}
          error={this.state.isPhoneNoError}
        />
      </InputField>
    )
  }

  handleContactPointChange = (value: string) =>
    this.setState({
      selected: value,
      phoneNumber: '',
      touched: false,
      isError: false
    })

  render() {
    const { intl } = this.props

    return (
      <Container>
        <EventTopBar
          title={intl.formatMessage(messages.title)}
          goHome={() => {
            this.props.setInitialApplications()
            this.props.goToHome()
          }}
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
          {this.state.isError && (
            <ErrorText id="error_text">
              {intl.formatMessage(messages.error)}
            </ErrorText>
          )}
          <form>
            <Actions id="select_main_contact_point">
              <RadioButton
                id="contact_mother"
                size={RADIO_BUTTON_LARGE_STRING}
                name={CONTACT_POINT_FIELD_STRING}
                label={intl.formatMessage(messages.motherLabel)}
                value={ContactPoint.MOTHER}
                selected={this.state.selected}
                onChange={() =>
                  this.handleContactPointChange(ContactPoint.MOTHER)
                }
              />

              {this.state.selected === ContactPoint.MOTHER && (
                <ChildContainer>{this.renderPhoneNumberField()}</ChildContainer>
              )}

              <RadioButton
                id="contact_father"
                size={RADIO_BUTTON_LARGE_STRING}
                name={CONTACT_POINT_FIELD_STRING}
                label={intl.formatMessage(messages.fatherLabel)}
                value={ContactPoint.FATHER}
                selected={this.state.selected}
                onChange={() =>
                  this.handleContactPointChange(ContactPoint.FATHER)
                }
              />

              {this.state.selected === ContactPoint.FATHER && (
                <ChildContainer>{this.renderPhoneNumberField()}</ChildContainer>
              )}

              <RadioButton
                id="contact_other"
                disabled={true}
                size={RADIO_BUTTON_LARGE_STRING}
                name={CONTACT_POINT_FIELD_STRING}
                label={intl.formatMessage(messages.otherLabel)}
                value={ContactPoint.OTHER}
                selected={this.state.selected}
                onChange={() =>
                  this.handleContactPointChange(ContactPoint.OTHER)
                }
              />

              {this.state.selected === ContactPoint.OTHER && (
                <ChildContainer>
                  <InputField
                    id="relationship"
                    label={intl.formatMessage(messages.relationshipLabel)}
                    touched={this.state.touched}
                    hideAsterisk={true}
                  >
                    <TextInput
                      id="relationship_input"
                      name="relationship"
                      placeholder={intl.formatMessage(
                        messages.relationshipPlaceHolder
                      )}
                      isSmallSized={true}
                      onChange={e => this.handlePhoneNoChange(e.target.value)}
                      touched={this.state.touched}
                    />
                  </InputField>
                  {this.renderPhoneNumberField()}
                </ChildContainer>
              )}
            </Actions>
            <PrimaryButton
              id="continue"
              type="submit"
              onClick={this.handleSubmit}
            >
              {intl.formatMessage(messages.continueButton)}
            </PrimaryButton>
          </form>
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
    goToHome: goToHomeAction,
    storeApplication,
    goToBirthRegistrationAsParent,
    setInitialApplications
  }
)(injectIntl(SelectContactPointView))
