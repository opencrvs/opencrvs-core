import * as React from 'react'
import styled from '@register/styledComponents'
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
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { EventTopBar, RadioButton } from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import { IApplication, modifyApplication } from '@register/applications'
import {
  goToBirthRegistrationAsParent,
  goBack,
  goToHome,
  goToMainContactPoint,
  goToPrimaryApplicant,
  goToDeathRegistration
} from '@register/navigation'
import { IStoreState } from '@register/store'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import {
  InputField,
  TextInput,
  IRadioOption as RadioComponentOption
} from '@opencrvs/components/lib/forms'
import { Event } from '@register/forms'
import { phoneNumberFormat } from '@register/utils/validate'
import { PHONE_NO_FIELD_STRING } from '@register/utils/constants'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  newBirthRegistration: {
    id: 'register.selectInformant.newBirthRegistration',
    defaultMessage: 'New birth application',
    description: 'The message that appears for new birth registrations'
  },
  birthInformantTitle: {
    id: 'register.selectInformant.birthInformantTitle',
    defaultMessage: 'Who is applying for birth registration?',
    description: 'The title that appears when asking for the birth informant'
  },
  deathInformantTitle: {
    id: 'register.selectInformant.deathInformantTitle',
    defaultMessage:
      'What relationship does the applicant have to the deceased?',
    description: 'The title that appears when asking for the death informant'
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
    defaultMessage: 'Self',
    description: 'The title that appears when selecting self as informant'
  },
  spouse: {
    id: 'register.selectInformant.spouse',
    defaultMessage: 'Spouse',
    description: 'The title that appears when selecting spouse as informant'
  },
  son: {
    id: 'register.selectInformant.son',
    defaultMessage: 'Son',
    description: 'The title that appears when selecting son as informant'
  },
  daughter: {
    id: 'register.selectInformant.daughter',
    defaultMessage: 'Daughter',
    description: 'The title that appears when selecting daughter as informant'
  },
  extendedFamily: {
    id: 'register.selectInformant.extendedFamily',
    defaultMessage: 'Extended family',
    description:
      'The title that appears when selecting extended family as informant'
  },
  back: {
    id: 'menu.back',
    defaultMessage: 'Back',
    description: 'Back button in the menu'
  },
  birthErrorMessage: {
    id: 'register.selectInformant.birthErrorMessage',
    defaultMessage: 'Please select who is present and applying',
    description: 'Error Message to show when no informant is selected for birth'
  },
  deathErrorMessage: {
    id: 'register.selectInformant.deathErrorMessage',
    defaultMessage:
      'Please select the relationship to the deceased and any relevant contact details.',
    description: 'Error Message to show when no informant is selected for death'
  },
  continueButton: {
    id: 'register.selectVitalEvent.continueButton',
    defaultMessage: 'Continue',
    description: 'Continue Button Text'
  },
  phoneNoLabel: {
    id: 'register.SelectContactPoint.phoneNoLabel',
    defaultMessage: 'Phone number',
    description: 'Phone No Label'
  },
  relationshipLabel: {
    id: 'register.selectInformant.relationshipLabel',
    defaultMessage: 'Relationship to deceased',
    description: 'Relationship Label used for death informant'
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
  }
})

const Title = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  margin-bottom: 16px;
`
const Actions = styled.div`
  padding: 32px 0;
  & div:not(:last-child) {
    margin-bottom: 16px;
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

enum INFORMANT {
  FATHER = 'FATHER_ONLY',
  MOTHER = 'MOTHER_ONLY',
  BOTH_PARENTS = 'BOTH_PARENTS',
  SELF = 'INFORMANT_ONLY',
  SOMEONE_ELSE = 'OTHER',
  SPOUSE = 'SPOUSE',
  SON = 'SON',
  DAUGHTER = 'DAUGHTER',
  EXTENDED_FAMILY = 'EXTENDED_FAMILY'
}

interface IInformantField {
  id: string
  option: RadioComponentOption
  disabled: boolean
}

const setInformantFields = (
  intl: InjectedIntl,
  event: string
): IInformantField[] => {
  if (event === Event.BIRTH) {
    return [
      {
        id: `select_informant_${INFORMANT.MOTHER}`,
        option: {
          label: intl.formatMessage(messages.mother),
          value: INFORMANT.MOTHER
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.FATHER}`,
        option: {
          label: intl.formatMessage(messages.father),
          value: INFORMANT.FATHER
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.BOTH_PARENTS}`,
        option: {
          label: intl.formatMessage(messages.parents),
          value: INFORMANT.BOTH_PARENTS
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.SELF}`,
        option: {
          label: intl.formatMessage(messages.self),
          value: INFORMANT.SELF
        },
        disabled: true
      },
      {
        id: `select_informant_${INFORMANT.SOMEONE_ELSE}`,
        option: {
          label: intl.formatMessage(messages.someoneElse),
          value: INFORMANT.SOMEONE_ELSE
        },
        disabled: true
      }
    ]
  } else {
    return [
      {
        id: `select_informant_${INFORMANT.MOTHER}`,
        option: {
          label: intl.formatMessage(messages.mother),
          value: INFORMANT.MOTHER
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.FATHER}`,
        option: {
          label: intl.formatMessage(messages.father),
          value: INFORMANT.FATHER
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.SPOUSE}`,
        option: {
          label: intl.formatMessage(messages.spouse),
          value: INFORMANT.SPOUSE
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.SON}`,
        option: {
          label: intl.formatMessage(messages.son),
          value: INFORMANT.SON
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.DAUGHTER}`,
        option: {
          label: intl.formatMessage(messages.daughter),
          value: INFORMANT.DAUGHTER
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.EXTENDED_FAMILY}`,
        option: {
          label: intl.formatMessage(messages.extendedFamily),
          value: INFORMANT.EXTENDED_FAMILY
        },
        disabled: false
      },
      {
        id: `select_informant_${INFORMANT.SOMEONE_ELSE}`,
        option: {
          label: intl.formatMessage(messages.someoneElse),
          value: INFORMANT.SOMEONE_ELSE
        },
        disabled: false
      }
    ]
  }
}

interface IMatchProps {
  applicationId: string
}

type IFullProps = {
  application: IApplication
  modifyApplication: typeof modifyApplication
  goBack: typeof goBack
  goToHome: typeof goToHome
  goToMainContactPoint: typeof goToMainContactPoint
  goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
  goToDeathRegistration: typeof goToDeathRegistration
  goToPrimaryApplicant: typeof goToPrimaryApplicant
} & InjectedIntlProps &
  RouteComponentProps<IMatchProps>

interface IState {
  informant: string
  phoneNumber: string
  relationship: string
  isPhoneNoError: boolean
  touched: boolean
  isError: boolean
}

export class SelectInformantView extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      informant:
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[registrationSection.id] &&
          (this.props.application.data[registrationSection.id]
            .presentAtBirthRegistration as string)) ||
        '',
      phoneNumber:
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[registrationSection.id] &&
          (this.props.application.data[registrationSection.id]
            .registrationPhone as string)) ||
        '',
      relationship: '',
      isPhoneNoError: false,
      touched: false,
      isError: false
    }
  }

  handleContinue = () => {
    if (
      this.state.informant &&
      this.state.informant !== 'error' &&
      this.state.informant === INFORMANT.BOTH_PARENTS
    ) {
      const { application, goToPrimaryApplicant } = this.props
      this.props.modifyApplication({
        ...application,
        data: {
          ...application.data,
          registration: {
            ...application.data[registrationSection.id],
            ...{
              presentAtBirthRegistration: this.state.informant
            }
          }
        }
      })
      goToPrimaryApplicant(this.props.match.params.applicationId)
    } else if (
      this.state.informant &&
      this.state.informant !== 'error' &&
      this.state.informant !== INFORMANT.SOMEONE_ELSE
    ) {
      const { application, goToMainContactPoint } = this.props
      this.props.modifyApplication({
        ...application,
        data: {
          ...application.data,
          registration: {
            ...application.data[registrationSection.id],
            ...{
              presentAtBirthRegistration: this.state.informant,
              applicant: this.state.informant
            }
          }
        }
      })

      goToMainContactPoint(this.props.match.params.applicationId)
    } else if (
      this.state.informant &&
      this.state.informant !== 'error' &&
      this.state.informant === INFORMANT.SOMEONE_ELSE &&
      this.state.phoneNumber &&
      !this.state.isPhoneNoError &&
      this.state.relationship !== ''
    ) {
      const { application, goToDeathRegistration } = this.props
      this.props.modifyApplication({
        ...application,
        data: {
          ...application.data,
          registration: {
            ...application.data[registrationSection.id],
            ...{
              presentAtBirthRegistration: this.state.informant,
              applicant: this.state.informant,
              registrationPhone: this.state.phoneNumber,
              whoseContactDetails: this.state.relationship,
              applicantOtherRelationship: this.state.relationship
            }
          }
        }
      })

      goToDeathRegistration(this.props.match.params.applicationId)
    } else {
      this.setState({ informant: 'error' })
    }
  }
  handleRelationshipChange = (value: string) => {
    this.setState({
      relationship: value,
      touched: true,
      isError: false
    })
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
          value={this.state.phoneNumber}
          onChange={e => this.handlePhoneNoChange(e.target.value)}
          touched={this.state.touched}
          error={this.state.isPhoneNoError}
        />
      </InputField>
    )
  }
  render() {
    const { intl } = this.props
    const event = this.props.location.pathname.includes(Event.BIRTH)
      ? Event.BIRTH
      : Event.DEATH
    const infornantFields = setInformantFields(intl, event)
    return (
      <Container>
        <EventTopBar
          title={intl.formatMessage(messages.newBirthRegistration)}
          goHome={this.props.goToHome}
        />

        <BodyContent id="select_informant_view">
          <TertiaryButton
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <BackArrow />}
            onClick={this.props.goBack}
          >
            {intl.formatMessage(messages.back)}
          </TertiaryButton>

          <Title>
            {event === Event.BIRTH
              ? intl.formatMessage(messages.birthInformantTitle)
              : intl.formatMessage(messages.deathInformantTitle)}
          </Title>
          {this.state.informant === 'error' && (
            <ErrorText id="error_text">
              {event === Event.BIRTH
                ? intl.formatMessage(messages.birthErrorMessage)
                : intl.formatMessage(messages.deathErrorMessage)}
            </ErrorText>
          )}
          <Actions id="select_parent_informant">
            {infornantFields.map((infornantField: IInformantField) => {
              return (
                <RadioButton
                  size="large"
                  key={infornantField.id}
                  name={`${event}Option`}
                  label={infornantField.option.label}
                  value={infornantField.option.value}
                  id={infornantField.id}
                  selected={
                    this.state.informant === infornantField.option.value
                      ? infornantField.option.value
                      : ''
                  }
                  onChange={() =>
                    this.setState({
                      informant: infornantField.option.value as string
                    })
                  }
                  disabled={infornantField.disabled}
                />
              )
            })}
            {this.state.informant === INFORMANT.SOMEONE_ELSE &&
              event === Event.DEATH && (
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
                      isSmallSized={true}
                      onChange={e =>
                        this.handleRelationshipChange(e.target.value)
                      }
                      touched={this.state.touched}
                    />
                  </InputField>
                  {this.renderPhoneNumberField()}
                </ChildContainer>
              )}
          </Actions>
          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(messages.continueButton)}
          </PrimaryButton>
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
    ) as IApplication
  }
}

export const SelectInformant = withRouter(
  connect(
    mapStateToProps,
    {
      goBack,
      goToHome,
      goToMainContactPoint,
      goToBirthRegistrationAsParent,
      goToPrimaryApplicant,
      goToDeathRegistration,
      modifyApplication
    }
  )(injectIntl(SelectInformantView))
) as any
