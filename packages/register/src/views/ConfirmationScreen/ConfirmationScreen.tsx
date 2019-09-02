import * as React from 'react'
import { connect } from 'react-redux'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { Box } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import {
  OffLineCircled,
  Rejected,
  CompleteTick
} from '@opencrvs/components/lib/icons'
import {
  ViewFooter,
  FooterAction,
  FooterPrimaryButton
} from '@opencrvs/register/src/components/interface/footer'
import { RouteComponentProps } from 'react-router'
import { IStoreState } from '@register/store'
import { IntlState } from '@register/i18n/reducer'
import {
  DECLARATION,
  REJECTION,
  BIRTH,
  OFFLINE
} from '@register/utils/constants'
import { HomeViewHeader } from '@register/components/HomeViewHeader'
import { messages } from '@register/i18n/messages/views/confirmationScreen'

const Container = styled.div`
  z-index: 1;
  width: 80%;
  margin: 0 auto;
  margin-top: -55px;
  max-width: 940px;
`
const StyledP = styled.p`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
`

const SubmissionName = styled(StyledP)`
  margin-right: 4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-right: 0px;
    text-align: center;
  }
`

const SubmissionText = styled(StyledP)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin-top: -15px;
    text-align: center;
  }
`

const TrackingBox = styled(Box)<StyleProps>`
  background: linear-gradient(
    137.89deg,
    ${({ theme, offline }) =>
        offline ? theme.colors.disabled : theme.colors.primary}
      0%,
    ${({ theme, offline }) =>
        offline ? theme.colors.white : theme.colors.secondary}
      100%
  );
  color: ${({ theme, offline }) =>
    offline ? theme.colors.black : theme.colors.white};

  text-align: center;
  margin: 15px 0;

  /* stylelint-disable */
  ${StyledP} {
    /* stylelint-enable */
    color: ${({ theme, offline }) =>
      offline ? theme.colors.placeholder : theme.colors.white};
  }
`

const ImgHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  /* stylelint-disable */
  align-iems: center;
  /* stylelint-enable */
`

const BoxIconDiv = styled.div`
  display: flex;
  justify-content: center;
  width: 100px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const BoxTextDiv = styled.div`
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`

const TrackingHeader = styled.h3`
  ${({ theme }) => theme.fonts.bigBodyStyle};
`

const TrackingNumber = styled.h2`
  ${({ theme }) => theme.fonts.h2Style};
  margin-top: -15px;
`

const Footer = styled(ViewFooter)`
  z-index: 0;
`
type StyleProps = {
  offline: boolean
}

type Props = {
  language: IntlState['language']
}

class ConfirmationScreenView extends React.Component<
  Props & IntlShapeProps & RouteComponentProps<{}>
> {
  render() {
    const { intl, history } = this.props
    const eventName = history.location.state.eventName
    const eventType = history.location.state.eventType
      ? history.location.state.eventType
      : BIRTH
    const offLine = eventName === OFFLINE
    const language = this.props.language
    const fullNameInBn = history.location.state.fullNameInBn
      ? history.location.state.fullNameInBn
      : ''
    const fullNameInEng = history.location.state.fullNameInEng
      ? history.location.state.fullNameInEng
      : ''
    const isRejection = eventName === REJECTION ? true : false
    const fullName =
      language === 'bn' || !fullNameInEng
        ? fullNameInBn + ' - এর'
        : fullNameInEng + "'s"
    const trackNumber = history.location.state.trackNumber
      ? history.location.state.trackNumber
      : 'UNAVAILABLE'
    const isDeclaration =
      history.location.state.eventName === DECLARATION ? true : false
    const isTrackingSection = history.location.state.trackingSection
      ? true
      : false
    const isDuplicate = history.location.state.duplicateContextId ? true : false
    const duplicateContextId = history.location.state.duplicateContextId

    return (
      <>
        <HomeViewHeader id="confirmation_screen_view" />
        <Container>
          <Box>
            <ImgHeaderContainer>
              <BoxIconDiv id="success_screen_icon">
                {isRejection ? (
                  <Rejected />
                ) : offLine ? (
                  <OffLineCircled />
                ) : (
                  <CompleteTick />
                )}
              </BoxIconDiv>
              <BoxTextDiv>
                <SubmissionName id="submission_name">
                  <strong>{fullName}</strong>
                </SubmissionName>
              </BoxTextDiv>
              <BoxTextDiv>
                <SubmissionText id="submission_text">
                  {intl.formatMessage(messages.boxHeaderDesc, {
                    event: eventName,
                    eventType
                  })}
                </SubmissionText>
              </BoxTextDiv>
            </ImgHeaderContainer>
          </Box>
          {isTrackingSection && (
            <TrackingBox offline={offLine}>
              <TrackingHeader id="tracking_sec_header">
                {intl.formatMessage(messages.trackingSectionTitle, {
                  event: eventName,
                  eventType
                })}
              </TrackingHeader>
              <TrackingNumber id="tracking_id_viewer">
                <strong>{trackNumber}</strong>
              </TrackingNumber>
              <StyledP id="tracking_sec_text">
                {intl.formatMessage(messages.trackingSectionDesc, {
                  event: eventName
                })}
              </StyledP>
            </TrackingBox>
          )}
        </Container>
        <Footer>
          <FooterAction>
            <FooterPrimaryButton
              id="go_to_homepage_button"
              onClick={() => (window.location.href = '/')}
            >
              {intl.formatMessage(messages.backButton)}
            </FooterPrimaryButton>
          </FooterAction>
          {!isRejection && (isDeclaration || offLine) && (
            <FooterAction>
              <FooterPrimaryButton
                id="go_to_new_declaration"
                onClick={() => (window.location.href = '/')}
              >
                {intl.formatMessage(messages.newButton)}
              </FooterPrimaryButton>
            </FooterAction>
          )}
          {isDuplicate && (
            <FooterAction>
              <FooterPrimaryButton
                id="go_to_duplicate_button"
                onClick={() => {
                  window.location.assign(`/duplicates/${duplicateContextId}`)
                }}
              >
                {intl.formatMessage(messages.backToDuplicatesButton)}
              </FooterPrimaryButton>
            </FooterAction>
          )}
        </Footer>
      </>
    )
  }
}

export const ConfirmationScreen = injectIntl(
  connect((state: IStoreState) => ({
    language: state.i18n.language
  }))(ConfirmationScreenView)
)
