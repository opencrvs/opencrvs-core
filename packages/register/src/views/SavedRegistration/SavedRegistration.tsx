import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { ViewHeader } from '../../components/ViewHeader'
import { Box } from '@opencrvs/components/lib/interface'
import styled from 'styled-components'
import CompleteTick from './CompleteTick.svg'
import NoConnectivity from './NoConnectivity.svg'
import {
  ViewFooter,
  FooterAction,
  FooterPrimaryButton
} from '@opencrvs/register/src/components/interface/footer'
import { RouteComponentProps } from 'react-router'

const messages = defineMessages({
  onlineTitle: {
    id: 'register.savedRegistration.online.title',
    defaultMessage: 'Declaration submitted',
    description:
      'The title that appears on the saved registration page when the client is online'
  },
  onlineDesc: {
    id: 'register.savedRegistration.online.desc',
    defaultMessage: 'The declaration is now on its way for validation.',
    description:
      'The description that appears on the saved registration page when the client is online'
  },
  offlineTitle: {
    id: 'register.savedRegistration.offline.title',
    defaultMessage: 'Declaration pending connectivity',
    description:
      'The title that appears on the saved registration page when the client is offline'
  },
  offlineDesc: {
    id: 'register.savedRegistration.offline.desc',
    defaultMessage:
      'The declaration will automatically be sent out for validation once your device has internet connectivity.',
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
  onlineNoticeCardText: {
    id: 'register.savedRegistration.online.noticeCard.text',
    defaultMessage:
      'The birth declaration of First Last Name has been successfully submitted to the registration office.',
    description:
      'The text of the notice card that appears on the saved registration page when the client is online'
  },
  offlineNoticeCardText: {
    id: 'register.savedRegistration.offline.noticeCard.text',
    defaultMessage:
      'The birth declaration of First Last Name is pending due to no internet connection. ',
    description:
      'The text of the notice card that appears on the saved registration page when the client is offline'
  },
  trackingCardTitle: {
    id: 'register.savedRegistration.trackingCard.title',
    defaultMessage: 'Tracking ID number:',
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
      'Once the declaration is succesfully submited, you and the informant will be notified when the registration is complete.',
    description:
      'The text of the what next card that appears on the saved registration page when the client is offline'
  },
  backButton: {
    id: 'register.savedRegistration.buttons.back',
    defaultMessage: 'Back to homescreen',
    description: 'The button to return to the homescreen'
  },
  newButton: {
    id: 'register.savedRegistration.buttons.newDeclaration',
    defaultMessage: 'New declaration',
    description:
      'The button to start a new declaration now that they are finished with this one'
  }
})

const Container = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
  z-index: 1;
`

const StyledP = styled.p`
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
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
`

const BoxHeader = styled.h2`
  color: ${({ theme }) => theme.colors.copy};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 24px;
  font-weight: 300;
  line-height: 33px;
`

const ImgHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
`

const Img = styled.img`
  margin-right: 22px;
`

const TrackingHeader = styled.h3`
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
`

const TrackingNumber = styled.h1`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 30px;
`

class SavedRegistrationView extends React.Component<
  InjectedIntlProps & RouteComponentProps<{}>
> {
  render() {
    const { intl, history } = this.props
    const online = navigator.onLine

    return (
      <>
        <ViewHeader
          title={intl.formatMessage(
            online ? messages.onlineTitle : messages.offlineTitle
          )}
          description={intl.formatMessage(
            online ? messages.onlineDesc : messages.offlineDesc
          )}
          id="saved_registration_view"
        />
        <Container>
          <Box>
            <ImgHeaderContainer>
              <Img src={online ? CompleteTick : NoConnectivity} />
              <BoxHeader id="submission_title">
                {intl.formatMessage(
                  online
                    ? messages.onlineNoticeCardTitle
                    : messages.offlineNoticeCardTitle
                )}
              </BoxHeader>
            </ImgHeaderContainer>
            <StyledP id="submission_text">
              {intl.formatMessage(
                online
                  ? messages.onlineNoticeCardText
                  : messages.offlineNoticeCardText
              )}
            </StyledP>
          </Box>
          <TrackingBox>
            <TrackingHeader>
              {intl.formatMessage(messages.trackingCardTitle)}
            </TrackingHeader>
            <TrackingNumber>{history.location.state.trackingId}</TrackingNumber>
            <StyledP>{intl.formatMessage(messages.trackingCardText)}</StyledP>
          </TrackingBox>
          <NextBox>
            <BoxHeader>{intl.formatMessage(messages.nextCardTitle)}</BoxHeader>
            <StyledP id="whats_next_title">
              {intl.formatMessage(
                online
                  ? messages.onlineNextCardText1
                  : messages.offlineNextCardText1
              )}
            </StyledP>
            <StyledP id="whats_next_text">
              {intl.formatMessage(
                online
                  ? messages.onlineNextCardText2
                  : messages.offlineNextCardText2
              )}
            </StyledP>
          </NextBox>
        </Container>
        <ViewFooter>
          <FooterAction>
            <FooterPrimaryButton onClick={() => history.push('/')}>
              {intl.formatMessage(messages.backButton)}
            </FooterPrimaryButton>
          </FooterAction>
          <FooterAction>
            <FooterPrimaryButton onClick={() => history.push('/')}>
              {intl.formatMessage(messages.newButton)}
            </FooterPrimaryButton>
          </FooterAction>
        </ViewFooter>
      </>
    )
  }
}

export const SavedRegistration = injectIntl(connect()(SavedRegistrationView))
