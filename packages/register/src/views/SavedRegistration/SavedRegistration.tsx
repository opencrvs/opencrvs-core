import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { ViewHeader } from '../../components/ViewHeader'
import { Box } from '@opencrvs/components/lib/interface'
import styled from 'styled-components'
import {
  NoConnectivity,
  Rejected,
  CompleteTick
} from '@opencrvs/components/lib/icons'
import {
  ViewFooter,
  FooterAction,
  FooterPrimaryButton
} from '@opencrvs/register/src/components/interface/footer'
import { RouteComponentProps } from 'react-router'
import { IStoreState } from 'src/store'
import { IntlState } from 'src/i18n/reducer'

const messages = defineMessages({
  registrationCompleteTitle: {
    id: 'register.completeRegistration.online.title',
    defaultMessage: 'Registration complete',
    description:
      'The title that appears on the complete registration page when client is online'
  },
  rejectionTitle: {
    id: 'register.rejectionTitle',
    defaultMessage: 'Application rejected',
    description:
      'The title that appears on the complete registration page when application is rejected'
  },
  onlineTitle: {
    id: 'register.savedRegistration.online.title',
    defaultMessage: 'Application submitted',
    description:
      'The title that appears on the saved registration page when the client is online'
  },
  onlineDesc: {
    id: 'register.savedRegistration.online.desc',
    defaultMessage: 'The application is now on its way for validation.',
    description:
      'The description that appears on the saved registration page when the client is online'
  },
  offlineTitle: {
    id: 'register.savedRegistration.offline.title',
    defaultMessage: 'Application pending connectivity',
    description:
      'The title that appears on the saved registration page when the client is offline'
  },
  offlineDesc: {
    id: 'register.savedRegistration.offline.desc',
    defaultMessage:
      'The application will automatically be sent out for validation once your device has internet connectivity.',
    description:
      'The description that appears on the saved registration page when the client is offline'
  },
  onlineNoticeCardTitle: {
    id: 'register.savedRegistration.online.noticeCard.title',
    defaultMessage: 'All done!',
    description:
      'The title of the notice card that appears on the saved registration page when the client is online'
  },
  offlineNoticeCardTitle: {
    id: 'register.savedRegistration.offline.noticeCard.title',
    defaultMessage: 'Almost there',
    description:
      'The title of the notice card that appears on the saved registration page when the client is offline'
  },
  onlineNoticeCardText1: {
    id: 'register.savedRegistration.online.noticeCard.text1',
    defaultMessage: 'The birth application of',
    description:
      'The text of the notice card that appears on the saved registration page when the client is online'
  },
  onlineNoticeCardText2: {
    id: 'register.savedRegistration.online.noticeCard.text2',
    defaultMessage:
      'has been successfully submitted to the registration office.',
    description:
      'The text of the notice card that appears on the saved registration page when the client is online'
  },
  offlineNoticeCardText1: {
    id: 'register.savedRegistration.offline.noticeCard.text1',
    defaultMessage: 'The birth application of',
    description:
      'The text of the notice card that appears on the saved registration page when the client is offline'
  },
  offlineNoticeCardText2: {
    id: 'register.savedRegistration.offline.noticeCard.text2',
    defaultMessage: 'is pending due to no internet connection.',
    description:
      'The text of the notice card that appears on the saved registration page when the client is offline'
  },
  registrationNoticeCardText1: {
    id: 'register.completeRegistration.noticeCard.text1',
    defaultMessage: 'The birth of',
    description:
      'The text of the notice card that appears on the complete registration page'
  },
  registrationNoticeCardText2: {
    id: 'register.completeRegistration.noticeCard.text2',
    defaultMessage: 'has been registered.',
    description:
      'The text of the notice card that appears on the complete registration page'
  },
  trackingCardTitle: {
    id: 'register.savedRegistration.trackingCard.title',
    defaultMessage: 'Tracking ID number:',
    description:
      'The title of the tracking card that appears on the saved registration page'
  },
  registrationCardTitle: {
    id: 'register.completeRegistration.trackingCard.title',
    defaultMessage: 'Birth Registration Number:',
    description:
      'The title of the tracking card that appears on the saved registration page'
  },
  trackingCardText: {
    id: 'register.savedRegistration.trackingCard.text',
    defaultMessage:
      'The informant will receive this number via SMS, but make sure they write it down and keep it safe. They should use the number as a reference if enquiring about their registration.',
    description:
      'The text of the tracking card that appears on the saved registration page'
  },
  registrationCardText: {
    id: 'register.savedRegistration.registrationNumber.text',
    defaultMessage:
      'The informant will receive this number via SMS with instructions on how and where to collect the certificate. They should use the number as a reference if enquiring about their registration.',
    description:
      'The text of the registration number card that appears on the saved registration page'
  },
  nextCardTitle: {
    id: 'register.savedRegistration.nextCard.title',
    defaultMessage: 'What next?',
    description:
      'The title of the what next card that appears on the saved registration page'
  },
  onlineNextCardText1: {
    id: 'register.savedRegistration.online.nextCard.text1',
    defaultMessage:
      'You will be notified through OpenCRVS when registration is complete or if there are any delays in the process.',
    description:
      'The text of the what next card that appears on the saved registration page when the client is online'
  },
  offlineNextCardText1: {
    id: 'register.savedRegistration.offline.nextCard.text1',
    defaultMessage:
      'All you need to do is login once you have internet connectivity on your device within the next 7 days. OpenCRVS will automatically submit the form, so you won’t need to do anything else.',
    description:
      'The text of the what next card that appears on the saved registration page when the client is offline'
  },
  onlineNextCardText2: {
    id: 'register.savedRegistration.online.nextCard.text2',
    defaultMessage:
      'The informant has given their contact details and will also be informed when the registration is complete.',
    description:
      'The text of the what next card that appears on the saved registration page when the client is online'
  },
  offlineNextCardText2: {
    id: 'register.savedRegistration.offline.nextCard.text2',
    defaultMessage:
      'Once the application is succesfully submited, you and the informant will be notified when the registration is complete.',
    description:
      'The text of the what next card that appears on the saved registration page when the client is offline'
  },
  registrationNextCardText1: {
    id: 'register.completeRegistration.nextCard.text1',
    defaultMessage: 'The registration process is complete.',
    description:
      'The text of the what next card that appears on the complete registration page'
  },
  registrationNextCardText2: {
    id: 'register.completeRegistration.nextCard.text2',
    defaultMessage:
      'The certificate should only be printed once the informant goes to collect it.',
    description:
      'The text of the what next card that appears on the complete registration page'
  },
  rejectedNoticeCardText2: {
    id: 'register.rejectedNoticeCardText2',
    defaultMessage:
      'has been rejected. The application agent will be informed about the reasons for rejection and instructed to follow up.',
    description:
      'The text of the what next card that appears on the rejected registration page'
  },
  backButton: {
    id: 'register.savedRegistration.buttons.back',
    defaultMessage: 'Back to homescreen',
    description: 'The button to return to the homescreen'
  },
  newButton: {
    id: 'register.savedRegistration.buttons.newDeclaration',
    defaultMessage: 'New application',
    description:
      'The button to start a new application now that they are finished with this one'
  },
  duplicationButton: {
    id: 'register.savedRegistration.buttons.back.duplicate',
    defaultMessage: 'Back to duplicate',
    description:
      'The button to start a new application now that they are finished with this one'
  }
})

const Container = styled.div`
  z-index: 1;
  width: 80%;
  margin: 0 auto;
  margin-top: -55px;
`
const StyledP = styled.p`
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  width: 450px;
  margin: 0 auto;
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const SubmissionText = styled(StyledP)`
  text-align: center;
  margin-top: 15px;
`
const TrackingBox = styled(Box)`
  background: linear-gradient(
    137.89deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.accentLight} 100%
  );
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  margin: 15px 0;

  /* stylelint-disable */
  ${StyledP} {
    /* stylelint-enable */
    color: ${({ theme }) => theme.colors.white};
  }
`
const NextBox = styled(Box)`
  text-align: center;
  padding-bottom: 40px;
`

const BoxHeader = styled.h2`
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 24px;
  font-weight: 300;
  line-height: 33px;
`

const ImgHeaderContainer = styled.div`
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  h2 {
    padding-left: 10px;
    margin-top: 13px;
  }
`

const TrackingHeader = styled.h3`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
`

const TrackingNumber = styled.h1`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 30px;
  margin-top: -15px;
`

const Footer = styled(ViewFooter)`
  z-index: 0;
`

const Header = styled(ViewHeader)`
  width: 80%;
  margin: 0 auto;
  box-shadow: none;
  background: none;
  #view_title {
    margin-bottom: 30px;
  }
`

const HeaderWrapper = styled.div`
  background: linear-gradient(
    270deg,
    ${({ theme }) => theme.colors.headerGradientLight} 0%,
    ${({ theme }) => theme.colors.headerGradientDark} 100%
  );
`

type Props = {
  language: IntlState['language']
}

class SavedRegistrationView extends React.Component<
  Props & InjectedIntlProps & RouteComponentProps<{}>
> {
  render() {
    const { intl, history } = this.props
    const online = navigator.onLine
    const language = this.props.language
    const fullNameInBn = history.location.state.fullNameInBn
    const fullNameInEng = history.location.state.fullNameInEng
    let headerTitle: string
    let headerDesc: string
    let noticeCardText1: string
    let noticeCardText2: string
    let trackingCardTitle: string
    let trackingNumber: string
    let nextCardText1: string
    let nextCardText2: string
    let trackingCardText: string
    let isDeclaration: boolean
    let isRejection: boolean = false
    if (history.location.state.declaration) {
      headerTitle = intl.formatMessage(
        online ? messages.onlineTitle : messages.offlineTitle
      )
      headerDesc = intl.formatMessage(
        online ? messages.onlineDesc : messages.offlineDesc
      )
      noticeCardText1 = intl.formatMessage(
        online
          ? messages.onlineNoticeCardText1
          : messages.offlineNoticeCardText1
      )
      noticeCardText2 = intl.formatMessage(
        online
          ? messages.onlineNoticeCardText2
          : messages.offlineNoticeCardText2
      )
      trackingCardTitle = intl.formatMessage(messages.trackingCardTitle)
      trackingNumber = history.location.state.trackingId || ''
      nextCardText1 = intl.formatMessage(
        online ? messages.onlineNextCardText1 : messages.offlineNextCardText1
      )
      nextCardText2 = intl.formatMessage(
        online ? messages.onlineNextCardText2 : messages.offlineNextCardText2
      )
      trackingCardText = intl.formatMessage(messages.trackingCardText)
      isDeclaration = true
      isRejection = false
    } else if (history.location.state.rejection) {
      isRejection = true
      isDeclaration = false
      headerTitle = intl.formatMessage(messages.rejectionTitle)
      headerDesc = ''
      trackingCardTitle = ''
      trackingNumber = ''
      trackingCardText = ''
      nextCardText1 = ''
      nextCardText2 = ''
      noticeCardText1 = intl.formatMessage(messages.onlineNoticeCardText1)
      noticeCardText2 = intl.formatMessage(messages.rejectedNoticeCardText2)
    } else {
      headerTitle = intl.formatMessage(messages.registrationCompleteTitle)
      headerDesc = ''
      noticeCardText1 = intl.formatMessage(messages.registrationNoticeCardText1)
      noticeCardText2 = intl.formatMessage(messages.registrationNoticeCardText2)
      trackingCardTitle = intl.formatMessage(messages.registrationCardTitle)
      trackingNumber = history.location.state.registrationNumber || ''
      nextCardText1 = intl.formatMessage(messages.registrationNextCardText1)
      nextCardText2 = intl.formatMessage(messages.registrationNextCardText2)
      trackingCardText = intl.formatMessage(messages.registrationCardText)
      isRejection = false
      isDeclaration = false
    }

    return (
      <>
        <HeaderWrapper>
          <Header
            title={headerTitle}
            description={headerDesc}
            hideBackButton={!isDeclaration}
            id="saved_registration_view"
          />
        </HeaderWrapper>
        <Container>
          <Box>
            <ImgHeaderContainer>
              {isRejection ? (
                <Rejected />
              ) : !online ? (
                <NoConnectivity />
              ) : (
                <CompleteTick />
              )}
              <BoxHeader id="submission_title">
                {intl.formatMessage(
                  online && !isRejection
                    ? messages.onlineNoticeCardTitle
                    : isRejection
                    ? messages.rejectionTitle
                    : messages.offlineNoticeCardTitle
                )}
              </BoxHeader>
            </ImgHeaderContainer>
            <SubmissionText id="submission_text">
              {language === 'en' ? (
                <span>
                  {noticeCardText1}{' '}
                  <strong>
                    {fullNameInEng ? fullNameInEng : fullNameInBn}
                  </strong>{' '}
                  {noticeCardText2}
                </span>
              ) : (
                <span>
                  <strong>{fullNameInBn}</strong> {noticeCardText2}
                </span>
              )}
            </SubmissionText>
          </Box>
          {!isRejection && (
            <TrackingBox>
              <TrackingHeader>{trackingCardTitle}</TrackingHeader>
              <TrackingNumber id="trackingIdViewer">
                {trackingNumber}
              </TrackingNumber>
              <StyledP>{trackingCardText}</StyledP>
            </TrackingBox>
          )}
          {!isRejection && (
            <NextBox>
              <BoxHeader>
                {intl.formatMessage(messages.nextCardTitle)}
              </BoxHeader>
              <StyledP id="whats_next_title">{nextCardText1}</StyledP>
              <StyledP id="whats_next_text">{nextCardText2}</StyledP>
            </NextBox>
          )}
        </Container>
        <Footer>
          {!isRejection &&
            (isDeclaration ? (
              <FooterAction>
                <FooterPrimaryButton onClick={() => history.push('/')}>
                  {intl.formatMessage(messages.newButton)}
                </FooterPrimaryButton>
              </FooterAction>
            ) : (
              <FooterAction>
                <FooterPrimaryButton onClick={() => history.push('/')}>
                  {intl.formatMessage(messages.duplicationButton)}
                </FooterPrimaryButton>
              </FooterAction>
            ))}

          <FooterAction>
            <FooterPrimaryButton onClick={() => history.push('/')}>
              {intl.formatMessage(messages.backButton)}
            </FooterPrimaryButton>
          </FooterAction>
        </Footer>
      </>
    )
  }
}

export const SavedRegistration = injectIntl(
  connect((state: IStoreState) => ({
    language: state.i18n.language
  }))(SavedRegistrationView)
)
