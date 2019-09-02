import * as React from 'react'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  IntlShape
} from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import {
  ICON_ALIGNMENT,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { InputField, TextInput } from '@opencrvs/components/lib/forms'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { EventTopBar, RadioButton } from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import {
  IApplication,
  modifyApplication,
  setInitialApplications,
  storeApplication,
  writeApplication
} from '@register/applications'
import { getLanguage } from '@register/i18n/selectors'
import {
  goBack as goBackAction,
  goToBirthRegistrationAsParent,
  goToHome as goToHomeAction,
  goToDeathRegistration
} from '@register/navigation'
import { IStoreState } from '@register/store'
import styled from '@register/styledComponents'
import {
  CONTACT_POINT_FIELD_STRING,
  PHONE_NO_FIELD_STRING,
  RADIO_BUTTON_LARGE_STRING
} from '@register/utils/constants'
import { phoneNumberFormat } from '@register/utils/validate'

import { IInformantField } from '@register/views/SelectInformant/SelectInformant'
import {
  Event,
  IFormSection,
  BirthSection,
  DeathSection
} from '@register/forms'
import { messages } from '@register/i18n/messages/views/selectContactPoint'
import {
  formMessages,
  constantsMessages,
  buttonMessages
} from '@register/i18n/messages'
import {
  getDeathSection,
  getBirthSection
} from '@register/forms/register/application-selectors'

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

const ChildContainer = styled.div`
  margin: 15px 0px 0px 18px;
  padding-left: 33px;
  border-left: 4px solid ${({ theme }) => theme.colors.copy};
  padding-top: 0px !important;

  > div {
    padding: 16px 0;
  }
`

enum ContactPoint {
  MOTHER = 'MOTHER',
  FATHER = 'FATHER',
  SPOUSE = 'SPOUSE',
  SON = 'SON',
  DAUGHTER = 'DAUGHTER',
  EXTENDED_FAMILY = 'EXTENDED_FAMILY',
  OTHER = 'OTHER'
}

const setContactPointFields = (
  intl: IntlShape,
  event: string
): IInformantField[] => {
  if (event === Event.BIRTH) {
    return [
      {
        id: `contact_${ContactPoint.MOTHER}`,
        option: {
          label: intl.formatMessage(formMessages.mother),
          value: ContactPoint.MOTHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.FATHER}`,
        option: {
          label: intl.formatMessage(formMessages.father),
          value: ContactPoint.FATHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.OTHER}`,
        option: {
          label: intl.formatMessage(formMessages.someoneElse),
          value: ContactPoint.OTHER
        },
        disabled: false
      }
    ]
  } else {
    return [
      {
        id: `contact_${ContactPoint.MOTHER}`,
        option: {
          label: intl.formatMessage(formMessages.mother),
          value: ContactPoint.MOTHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.FATHER}`,
        option: {
          label: intl.formatMessage(formMessages.father),
          value: ContactPoint.FATHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.SPOUSE}`,
        option: {
          label: intl.formatMessage(formMessages.spouse),
          value: ContactPoint.SPOUSE
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.SON}`,
        option: {
          label: intl.formatMessage(formMessages.son),
          value: ContactPoint.SON
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.DAUGHTER}`,
        option: {
          label: intl.formatMessage(formMessages.daughter),
          value: ContactPoint.DAUGHTER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.EXTENDED_FAMILY}`,
        option: {
          label: intl.formatMessage(formMessages.relationExtendedFamily),
          value: ContactPoint.EXTENDED_FAMILY
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.OTHER}`,
        option: {
          label: intl.formatMessage(formMessages.someoneElse),
          value: ContactPoint.OTHER
        },
        disabled: false
      }
    ]
  }
}
interface IState {
  selected: string
  phoneNumber: string
  relationship: string
  isPhoneNoError: boolean
  touched: boolean
  isError: boolean
}

interface IMatchProps {
  applicationId: string
}

interface IStateProps {
  language: string
  application: IApplication
  registrationSection: IFormSection
  applicantsSection: IFormSection
}

interface IProps {
  modifyApplication: typeof modifyApplication
  writeApplication: typeof writeApplication
  goBack: typeof goBackAction
  goToHome: typeof goToHomeAction
  storeApplication: typeof storeApplication
  goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
  setInitialApplications: typeof setInitialApplications
  goToDeathRegistration: typeof goToDeathRegistration
}

type IFullProps = IntlShapeProps &
  RouteComponentProps<IMatchProps> &
  IProps &
  IStateProps

class SelectContactPointView extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    const { registrationSection, applicantsSection } = props
    this.state = {
      selected:
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[registrationSection.id] &&
          (this.props.application.data[registrationSection.id]
            .whoseContactDetails as string)) ||
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[applicantsSection.id] &&
          (this.props.application.data[applicantsSection.id]
            .applicantsRelationToDeceased as string)) ||
        '',
      phoneNumber:
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[registrationSection.id] &&
          (this.props.application.data[registrationSection.id]
            .registrationPhone as string)) ||
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[applicantsSection.id] &&
          (this.props.application.data[applicantsSection.id]
            .applicantPhone as string)) ||
        '',
      relationship:
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[applicantsSection.id] &&
          (this.props.application.data[applicantsSection.id]
            .applicantOtherRelationship as string)) ||
        '',
      isPhoneNoError: false,
      touched: false,
      isError: false
    }
  }

  handlePhoneNoChange = (value: string) => {
    this.setState({
      isPhoneNoError: phoneNumberFormat(value) ? true : false,
      phoneNumber: value,
      touched: true,
      isError: false
    })
  }

  handleSubmit = async (e: any) => {
    const {
      application,
      writeApplication,
      modifyApplication,
      goToBirthRegistrationAsParent,
      goToDeathRegistration,
      registrationSection,
      applicantsSection
    } = this.props
    e.preventDefault()
    const event = this.props.location.pathname.includes(Event.BIRTH)
      ? Event.BIRTH
      : Event.DEATH

    if (
      this.state.phoneNumber &&
      !this.state.isPhoneNoError &&
      this.state.selected !== ContactPoint.OTHER
    ) {
      const newApplication = {
        ...application,
        data: {
          ...application.data
        }
      }
      if (event === Event.BIRTH) {
        newApplication.data[registrationSection.id] = {
          ...application.data[registrationSection.id],
          ...{
            registrationPhone: this.state.phoneNumber,
            whoseContactDetails: this.state.selected
          }
        }
      } else {
        newApplication.data[applicantsSection.id] = {
          ...application.data[applicantsSection.id],
          ...{
            applicantPhone: this.state.phoneNumber,
            applicantsRelationToDeceased: this.state.selected
          }
        }
      }
      await modifyApplication(newApplication)

      writeApplication(this.props.application)
      event === Event.BIRTH
        ? goToBirthRegistrationAsParent(application.id)
        : goToDeathRegistration(application.id)
    } else if (
      this.state.phoneNumber &&
      !this.state.isPhoneNoError &&
      this.state.selected === ContactPoint.OTHER &&
      this.state.relationship !== '' &&
      event === Event.DEATH
    ) {
      await modifyApplication({
        ...application,
        data: {
          ...application.data,
          [applicantsSection.id]: {
            ...application.data[applicantsSection.id],
            ...{
              applicantPhone: this.state.phoneNumber,
              applicantsRelationToDeceased: this.state.selected,
              applicantOtherRelationship: this.state.relationship
            }
          }
        }
      })

      writeApplication(this.props.application)
      goToDeathRegistration(application.id)
    } else {
      this.setState({
        isError: true
      })
    }
  }

  renderPhoneNumberField = (id: string): JSX.Element => {
    const error =
      this.state.isPhoneNoError && phoneNumberFormat(this.state.phoneNumber)

    return (
      <InputField
        id="phone_number"
        key={`${id}_phoneNumberFieldContainer`}
        label={this.props.intl.formatMessage(formMessages.phoneNumber)}
        touched={this.state.touched}
        error={
          error ? this.props.intl.formatMessage(error.message, error.props) : ''
        }
        hideAsterisk={true}
      >
        <TextInput
          id="phone_number_input"
          type="tel"
          key={`${id}_phoneNumberInputField`}
          name={PHONE_NO_FIELD_STRING}
          isSmallSized={true}
          value={this.state.phoneNumber}
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
  handleRelationshipChange = (value: string) => {
    this.setState({
      relationship: value,
      touched: true,
      isError: false
    })
  }

  render() {
    const { intl } = this.props
    const event = this.props.location.pathname.includes(Event.BIRTH)
      ? Event.BIRTH
      : Event.DEATH
    const contactPointFields = setContactPointFields(intl, event)

    let titleMessage
    switch (event) {
      case Event.BIRTH:
        titleMessage = constantsMessages.newBirthRegistration
        break
      case Event.DEATH:
        titleMessage = constantsMessages.newDeathRegistration
        break
      default:
        titleMessage = constantsMessages.newBirthRegistration
    }

    return (
      <Container>
        <EventTopBar
          title={intl.formatMessage(titleMessage)}
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
            {intl.formatMessage(buttonMessages.back)}
          </TertiaryButton>

          <Title>{intl.formatMessage(messages.heading)}</Title>
          {this.state.isError && (
            <ErrorText id="error_text">
              {intl.formatMessage(messages.error)}
            </ErrorText>
          )}
          <form>
            <Actions id="select_main_contact_point">
              {contactPointFields.map((contactPointField: IInformantField) => {
                return (
                  <div key={`${contactPointField.id}_wrapper`}>
                    <RadioButton
                      size={RADIO_BUTTON_LARGE_STRING}
                      key={contactPointField.id}
                      name={CONTACT_POINT_FIELD_STRING}
                      label={contactPointField.option.label}
                      value={contactPointField.option.value}
                      id={contactPointField.id}
                      selected={this.state.selected}
                      onChange={() =>
                        this.handleContactPointChange(contactPointField.option
                          .value as string)
                      }
                      disabled={contactPointField.disabled}
                    />
                    {this.state.selected === contactPointField.option.value &&
                      this.state.selected !== ContactPoint.OTHER && (
                        <ChildContainer
                          key={`${contactPointField.id}_phoneContainer`}
                        >
                          {this.renderPhoneNumberField(contactPointField.id)}
                        </ChildContainer>
                      )}
                  </div>
                )
              })}

              {this.state.selected === ContactPoint.OTHER && (
                <ChildContainer>
                  <InputField
                    id="relationship"
                    label={
                      event === Event.BIRTH
                        ? intl.formatMessage(messages.birthRelationshipLabel)
                        : intl.formatMessage(constantsMessages.relationship)
                    }
                    touched={this.state.touched}
                    hideAsterisk={true}
                  >
                    <TextInput
                      id="relationship_input"
                      name="relationship"
                      placeholder={intl.formatMessage(
                        formMessages.relationshipPlaceHolder
                      )}
                      value={this.state.relationship}
                      isSmallSized={true}
                      onChange={e =>
                        this.handleRelationshipChange(e.target.value)
                      }
                      touched={this.state.touched}
                    />
                  </InputField>
                  {this.renderPhoneNumberField('otherRelationship')}
                </ChildContainer>
              )}
            </Actions>
            <PrimaryButton
              id="continue"
              type="submit"
              onClick={this.handleSubmit}
            >
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          </form>
        </BodyContent>
      </Container>
    )
  }
}

const mapStateToProps = (
  store: IStoreState,
  props: RouteComponentProps<{ applicationId: string }>
): IStateProps => {
  const { match } = props
  return {
    application: store.applicationsState.applications.find(
      ({ id }) => id === match.params.applicationId
    )!,
    language: getLanguage(store),
    registrationSection: getBirthSection(store, BirthSection.Registration),
    applicantsSection: getDeathSection(store, DeathSection.Applicants)
  }
}

export const SelectContactPoint = withRouter(
  connect(
    mapStateToProps,
    {
      goBack: goBackAction,
      goToHome: goToHomeAction,
      storeApplication,
      goToBirthRegistrationAsParent,
      setInitialApplications,
      modifyApplication,
      writeApplication,
      goToDeathRegistration
    }
  )(injectIntl(SelectContactPointView))
)
