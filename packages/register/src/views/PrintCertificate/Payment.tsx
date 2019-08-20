import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@register/i18n/messages/views/certificate'
import { buttonMessages } from '@register/i18n/messages'
import {
  goBack,
  goToReviewCertificate as goToReviewCertificateAction
} from '@register/navigation'
import { IStoreState } from '@register/store'
import { RouteComponentProps } from 'react-router'
import { Event, IFormData } from '@register/forms'
import { IApplication } from '@register/applications'
import { ITheme } from '@register/styledComponents'
import { connect } from 'react-redux'
import { calculatePrice, getServiceMessage } from './calculatePrice'
import { Print } from '@opencrvs/components/lib/icons'
import { getUserDetails } from '@register/profile/profileSelectors'
import { IUserDetails } from '@register/utils/userUtils'

const Header = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  color: ${({ theme }) => theme.colors.black};
  margin-top: 0;
`
const Instruction = styled.p`
  color: ${({ theme }) => theme.colors.copy};
`
const Action = styled.div`
  margin-top: 32px;
`
const GreyBody = styled.div`
  background: ${({ theme }) => theme.colors.background};
  padding: 16px 24px;

  & button {
    margin-top: 16px;
    padding: 0;
  }
`

const StyledLabel = styled.label`
  ${({ theme }) => theme.fonts.bodyBoldStyle};
  margin-right: 3px;
`
const StyledValue = styled.span`
  ${({ theme }) => theme.fonts.bodyStyle};
`

function LabelValue({
  id,
  label,
  value
}: {
  id: string
  label: string
  value: string
}) {
  return (
    <div id={id}>
      <StyledLabel>{label}</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}
interface IProps {
  event: Event
  registrationId: string
  language: string
  application: IApplication
  theme: ITheme
  goToReviewCertificate: typeof goToReviewCertificateAction
  userDetails: IUserDetails | null
}

type IFullProps = IProps & InjectedIntlProps

class PaymentComponent extends React.Component<IFullProps> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {}
  }

  getEventDate(data: IFormData, event: Event): string {
    switch (event) {
      case Event.BIRTH:
        return data.child.childBirthDate as string
      case Event.DEATH:
        return data.deathEvent.deathDate as string
    }
  }
  continue = () => {
    this.props.goToReviewCertificate(
      this.props.registrationId,
      this.props.event
    )
  }

  render = () => {
    const { intl, application, event } = this.props
    const eventDate = this.getEventDate(application.data, event)

    const paymentAmount = calculatePrice(event, eventDate)

    const serviceMessage = getServiceMessage(event, eventDate)

    return (
      <>
        <ActionPageLight title={'Certificate collection'} goBack={goBack}>
          <Header>{intl.formatMessage(messages.payment)}</Header>
          <Instruction>
            {intl.formatMessage(messages.paymentInstruction)}
          </Instruction>
          <GreyBody>
            <LabelValue
              id="service"
              label={intl.formatMessage(messages.receiptService)}
              value={intl.formatMessage(serviceMessage)}
            />
            <LabelValue
              id="amountDue"
              label={intl.formatMessage(messages.amountDue)}
              value={intl.formatMessage(messages.paymentAmount, {
                paymentAmount
              })}
            />
            <TertiaryButton
              id="print-receipt"
              icon={() => <Print />}
              align={0}
              onClick={() => {}}
            >
              {intl.formatMessage(messages.printReceipt)}
            </TertiaryButton>
          </GreyBody>
          <Action>
            <PrimaryButton id="Continue" onClick={this.continue}>
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          </Action>
        </ActionPageLight>
      </>
    )
  }
}

const getEvent = (eventType: string | undefined) => {
  switch (eventType && eventType.toLowerCase()) {
    case 'birth':
    default:
      return Event.BIRTH
    case 'death':
      return Event.DEATH
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ registrationId: string; eventType: string }>
) {
  const { registrationId, eventType } = props.match.params
  const event = getEvent(eventType)
  const application = state.applicationsState.applications.find(
    app => app.id === registrationId && app.event === event
  )

  if (!application) {
    throw new Error(`Application "${registrationId}" missing!`)
  }

  return {
    event: application.event,
    registrationId,
    language: state.i18n.language,
    application,
    userDetails: getUserDetails(state)
  }
}

export const Payment = connect(
  mapStatetoProps,
  {
    goToReviewCertificate: goToReviewCertificateAction
  }
)(injectIntl(withTheme(PaymentComponent)))
