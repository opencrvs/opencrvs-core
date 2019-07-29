import * as React from 'react'
import styled from '@register/styledComponents'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import {
  ICON_ALIGNMENT,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { BackArrow } from '@opencrvs/components/lib/icons'
import { EventTopBar, RadioButton } from '@opencrvs/components/lib/interface'
import { Container } from '@opencrvs/components/lib/layout'
import { IApplication, modifyApplication } from '@register/applications'
import {
  goBack,
  goToBirthRegistrationAsParent,
  goToHome,
  goToBirthContactPoint
} from '@register/navigation'
import { IStoreState } from '@register/store'
import { registrationSection } from '@register/forms/register/fieldDefinitions/birth/registration-section'
import { messages } from '@register/i18n/messages/views/selectPrimaryApplicant'
import { formMessages, buttonMessages } from '@register/i18n/messages'

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
  & div:first-child {
    margin-bottom: 16px;
  }
`
const Description = styled.p`
  ${({ theme }) => theme.fonts.bodyStyle};
`
interface IMatchProps {
  applicationId: string
}

type IFullProps = InjectedIntlProps &
  RouteComponentProps<IMatchProps> & {
    application: IApplication
    modifyApplication: typeof modifyApplication
    goBack: typeof goBack
    goToHome: typeof goToHome
    goToBirthContactPoint: typeof goToBirthContactPoint
    goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
  }

interface IState {
  applicant: string
}

enum APPLICANT {
  FATHER = 'FATHER_ONLY',
  MOTHER = 'MOTHER_ONLY'
}
class SelectPrimaryApplicantView extends React.Component<IFullProps, IState> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      applicant:
        (this.props.application &&
          this.props.application.data &&
          this.props.application.data[registrationSection.id] &&
          (this.props.application.data[registrationSection.id]
            .applicant as string)) ||
        ''
    }
  }
  handleContinue = () => {
    if (
      this.state.applicant === APPLICANT.MOTHER ||
      this.state.applicant === APPLICANT.FATHER
    ) {
      const { application, goToBirthContactPoint } = this.props
      this.props.modifyApplication({
        ...application,
        data: {
          ...application.data,
          registration: {
            ...application.data[registrationSection.id],
            ...{
              applicant: this.state.applicant
            }
          }
        }
      })
      goToBirthContactPoint(this.props.match.params.applicationId)
    } else {
      this.setState({ applicant: 'error' })
    }
  }
  render() {
    const { intl } = this.props
    return (
      <Container>
        <EventTopBar
          title={intl.formatMessage(messages.registerNewEventTitle)}
          goHome={this.props.goToHome}
        />

        <BodyContent>
          <TertiaryButton
            align={ICON_ALIGNMENT.LEFT}
            icon={() => <BackArrow />}
            onClick={this.props.goBack}
          >
            {intl.formatMessage(buttonMessages.back)}
          </TertiaryButton>
          <Title>{intl.formatMessage(messages.registerNewEventHeading)}</Title>
          <Description>
            {intl.formatMessage(messages.primaryApplicantDescription)}
          </Description>
          {this.state.applicant === 'error' && (
            <ErrorText id="error_text">
              {intl.formatMessage(messages.errorMessage)}
            </ErrorText>
          )}
          <Actions id="primary_applicant_selection_view">
            <RadioButton
              size="large"
              key="motherevent"
              name="motherevent"
              label={intl.formatMessage(formMessages.relationMother)}
              value={APPLICANT.MOTHER}
              id="select_mother_event"
              selected={this.state.applicant}
              onChange={() => this.setState({ applicant: APPLICANT.MOTHER })}
            />
            <RadioButton
              size="large"
              key="fatherevent"
              name="fatherevent"
              label={intl.formatMessage(formMessages.relationFather)}
              value={APPLICANT.FATHER}
              id="select_father_event"
              selected={this.state.applicant}
              onChange={() => this.setState({ applicant: APPLICANT.FATHER })}
            />
          </Actions>
          <PrimaryButton id="continue" onClick={this.handleContinue}>
            {intl.formatMessage(buttonMessages.continueButton)}
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

export const SelectPrimaryApplicant = connect(
  mapStateToProps,
  {
    goBack,
    goToHome,
    goToBirthContactPoint,
    goToBirthRegistrationAsParent,
    modifyApplication
  }
)(injectIntl(SelectPrimaryApplicantView))
