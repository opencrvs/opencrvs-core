import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { messages } from '@register/i18n/messages/views/certificate'
import { buttonMessages } from '@register/i18n/messages'
import { goBack } from '@register/navigation'
import { IStoreState } from '@register/store'
import { RouteComponentProps } from 'react-router'
import { Event } from '@register/forms'
import { IApplication } from '@register/applications'
import { ITheme } from '@register/styledComponents'
import { connect } from 'react-redux'
import { calculatePrice, getServiceMessage } from './calculatePrice'
import { Print } from '@opencrvs/components/lib/icons'

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

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <StyledLabel>{label}</StyledLabel>
      <StyledValue>{value}</StyledValue>
    </div>
  )
}

type State = {}

interface IProps {
  event: Event
  registrationId: string
  language: string
  application: IApplication
  theme: ITheme
}

type IFullProps = IProps & InjectedIntlProps

class PaymentComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {}
  }
  getEventDate(data: any, event: Event) {
    switch (event) {
      case Event.BIRTH:
        return data.child.childBirthDate
      case Event.DEATH:
        return data.deceased.deathOfDate
    }
  }
  continue = () => {}
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
              label={intl.formatMessage(messages.receiptService)}
              value={intl.formatMessage(serviceMessage)}
            />
            <LabelValue
              label={intl.formatMessage(messages.amountDue)}
              value={intl.formatMessage(messages.paymentAmount, {
                paymentAmount
              })}
            />
            <TertiaryButton icon={() => <Print />} align={0}>
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
  const { registrationId } = props.match.params

  const application = state.applicationsState.applications.find(
    app => app.id === registrationId
  )

  if (!application) {
    throw new Error(`Application "${registrationId}" missing!`)
  }

  return {
    event: application.event,
    registrationId,
    language: state.i18n.language,
    application
  }
}

export const Payment = connect((state: IStoreState) => mapStatetoProps)(
  injectIntl(withTheme(PaymentComponent))
)
