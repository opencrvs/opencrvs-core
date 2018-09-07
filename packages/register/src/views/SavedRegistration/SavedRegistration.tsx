import * as React from 'react'
import { connect } from 'react-redux'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { ViewHeader } from '../../components/ViewHeader'
import { Box, Header } from '@opencrvs/components/lib/interface'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import styled from 'styled-components'
import CompleteTick from './CompleteTick.svg'

export const messages = defineMessages({
  savedRegistrationOnlineTitle: {
    id: 'register.savedRegistration.online.title',
    defaultMessage: 'Declaration submitted',
    description:
      'The title that appears on the saved registration page when the client is online'
  },
  savedRegistrationOnlineDesc: {
    id: 'register.savedRegistration.online.desc',
    defaultMessage: 'The declaration is now on its way for validation.',
    description:
      'The description that appears on the saved registration page when the client is online'
  }
})

const Container = styled.div`
  padding: 35px 25px;
  padding-bottom: 0;
  z-index: 1;
`

const TrackingBox = styled(Box)`
  background: linear-gradient(137.89deg, #4c68c1 0%, #5e93ed 100%);
  color: #ffffff;
  text-align: center;
  margin: 15px 0;
`

const NextBox = styled(Box)`
  text-align: center;
`

const BoxHeader = styled.h2`
  color: #35495d;
  font-family: ${({ theme }) => theme.fonts.lightFont};
  font-size: 24px;
  font-weight: 300;
  line-height: 33px;
`

const StyledP = styled.p`
  color: #35495d;
  font-family: ${({ theme }) => theme.fonts.regularFont};
  font-size: 18px;
  font-weight: 500;
  line-height: 24px;
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

const StyledPWhite = styled(StyledP)`
  color: #ffffff;
`

// The following copied from BirthParentForm (generalise these)

const FormAction = styled.div`
  display: flex;
  justify-content: center;
`

const FormPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

const ViewFooter = styled(Header)`
  flex-grow: 1;
  margin-top: -50px;
  padding-top: 100px;
  padding-bottom: 40px;
  /* stylelint-disable */
  ${FormPrimaryButton} {
    /* stylelint-enable */
    width: 270px;
    justify-content: center;
  }
  /* stylelint-disable */
  ${FormAction} {
    /* stylelint-enable */
    margin-bottom: 1em;
  }
`

class SavedRegistrationView extends React.Component<InjectedIntlProps> {
  render() {
    const { intl } = this.props
    return (
      <>
        <ViewHeader
          title={intl.formatMessage(messages.savedRegistrationOnlineTitle)}
          description={intl.formatMessage(
            messages.savedRegistrationOnlineDesc
          )}
          id="saved_registration_view"
        />
        <Container>
          <Box>
            <ImgHeaderContainer>
              <Img src={CompleteTick} />
              <BoxHeader>All done!</BoxHeader>
            </ImgHeaderContainer>
            <StyledP>
              The birth declaration of <b>First Middle Last Name</b> has been
              successfully submitted to the registration office.
            </StyledP>
          </Box>
          <TrackingBox>
            <TrackingHeader>Tracking ID number:</TrackingHeader>
            <TrackingNumber>187 372 019 2819</TrackingNumber>
            <StyledPWhite>
              The informant will receive this number via SMS, but make sure they
              write it down and keep it safe. They should use the number as a
              reference if enquiring about their registration.
            </StyledPWhite>
          </TrackingBox>
          <NextBox>
            <BoxHeader>What next?</BoxHeader>
            <StyledP>
              You will be notified through OpenCRVS when registration is
              complete or if there are any delays in the process.
            </StyledP>
            <StyledP>
              The informant has given their contact details and will also be
              informed when the registration is complete.
            </StyledP>
          </NextBox>
        </Container>
        <ViewFooter>
          <FormAction>
            <FormPrimaryButton>BACK TO HOMESCREEN</FormPrimaryButton>
          </FormAction>
          <FormAction>
            <FormPrimaryButton>NEW DECLARATION</FormPrimaryButton>
          </FormAction>
        </ViewFooter>
      </>
    )
  }
}

export const SavedRegistration = injectIntl(connect()(SavedRegistrationView))
