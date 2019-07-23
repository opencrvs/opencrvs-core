import * as React from 'react'
import {
  defineMessages,
  InjectedIntlProps,
  injectIntl,
  InjectedIntl
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
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { applicantsSection } from '@register/forms/register/fieldDefinitions/death/application-section'
import { IInformantField } from '@register/views/SelectInformant/SelectInformant'
import { Event } from '@register/forms'

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
    id: 'buttons.continue',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  },
  motherLabel: {
    id: 'constants.mother',
    defaultMessage: 'Mother',
    description: 'Mother Label'
  },
  fatherLabel: {
    id: 'constants.father',
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
  birthRelationshipLabel: {
    id: 'register.SelectContactPoint.birthRelationshipLabel',
    defaultMessage: 'Relationship to child',
    description: 'Relationship Label for birth'
  },
  deathRelationshipLabel: {
    id: 'constants.relationship',
    defaultMessage: 'Relationship',
    description: 'Relationship Label for death'
  },
  goBack: {
    id: 'buttons.back',
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
  },
  spouse: {
    id: 'constants.spouse',
    defaultMessage: 'Spouse',
    description:
      'The title that appears when selecting spouse as a main point of contact'
  },
  son: {
    id: 'constants.son',
    defaultMessage: 'Son',
    description:
      'The title that appears when selecting son as a main point of contact'
  },
  daughter: {
    id: 'constants.daughter',
    defaultMessage: 'Daughter',
    description:
      'The title that appears when selecting daughter as a main point of contact'
  },
  extendedFamily: {
    id: 'register.SelectContactPoint.extendedFamily',
    defaultMessage: 'Extended family',
    description:
      'The title that appears when selecting extended family as a main point of contact'
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

const ChildContainer = styled.div`
  margin-left: 18px;
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
  intl: InjectedIntl,
  event: string
): IInformantField[] => {
  if (event === Event.BIRTH) {
    return [
      {
        id: `contact_${ContactPoint.MOTHER}`,
        option: {
          label: intl.formatMessage(messages.motherLabel),
          value: ContactPoint.MOTHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.FATHER}`,
        option: {
          label: intl.formatMessage(messages.fatherLabel),
          value: ContactPoint.FATHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.OTHER}`,
        option: {
          label: intl.formatMessage(messages.otherLabel),
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
          label: intl.formatMessage(messages.motherLabel),
          value: ContactPoint.MOTHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.FATHER}`,
        option: {
          label: intl.formatMessage(messages.fatherLabel),
          value: ContactPoint.FATHER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.SPOUSE}`,
        option: {
          label: intl.formatMessage(messages.spouse),
          value: ContactPoint.SPOUSE
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.SON}`,
        option: {
          label: intl.formatMessage(messages.son),
          value: ContactPoint.SON
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.DAUGHTER}`,
        option: {
          label: intl.formatMessage(messages.daughter),
          value: ContactPoint.DAUGHTER
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.EXTENDED_FAMILY}`,
        option: {
          label: intl.formatMessage(messages.extendedFamily),
          value: ContactPoint.EXTENDED_FAMILY
        },
        disabled: false
      },
      {
        id: `contact_${ContactPoint.OTHER}`,
        option: {
          label: intl.formatMessage(messages.otherLabel),
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

type IProps = InjectedIntlProps &
  RouteComponentProps<IMatchProps> & {
    language: string
    application: IApplication
    modifyApplication: typeof modifyApplication
    writeApplication: typeof writeApplication
    goBack: typeof goBackAction
    goToHome: typeof goToHomeAction
    storeApplication: typeof storeApplication
    goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
    setInitialApplications: typeof setInitialApplications
    goToDeathRegistration: typeof goToDeathRegistration
  }
class SelectContactPointView extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
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

  handleSubmit = async (e: any) => {
    const {
      application,
      writeApplication,
      modifyApplication,
      goToBirthRegistrationAsParent,
      goToDeathRegistration
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
    return (
      <InputField
        id="phone_number"
        key={`${id}_phoneNumberFieldContainer`}
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
                        : intl.formatMessage(messages.deathRelationshipLabel)
                    }
                    touched={this.state.touched}
                    hideAsterisk={true}
                  >
                    <TextInput
                      id="relationship_input"
                      name="relationship"
                      placeholder={intl.formatMessage(
                        messages.relationshipPlaceHolder
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
              {intl.formatMessage(messages.continueButton)}
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
) => {
  const { match } = props
  return {
    application: store.applicationsState.applications.find(
      ({ id }) => id === match.params.applicationId
    ) as IApplication,
    language: getLanguage(store)
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
) as any
