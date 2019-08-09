import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import { PDFViewer } from '@opencrvs/components/lib/forms'
import { ErrorText } from '@opencrvs/components/lib/forms/ErrorText'
import { Check } from '@opencrvs/components/lib/icons'
import {
  Box,
  EventTopBar,
  ResponsiveModal,
  Spinner
} from '@opencrvs/components/lib/interface'
import { BodyContent, Container } from '@opencrvs/components/lib/layout'
import {
  createReviewApplication,
  IApplication,
  IApplicationsState,
  modifyApplication,
  storeApplication,
  SUBMISSION_STATUS
} from '@opencrvs/register/src/applications'
import { Action, Event, IForm, IFormData } from '@register/forms'
import { constantsMessages, errorMessages } from '@register/i18n/messages'
import { buttonMessages } from '@register/i18n/messages/buttons'
import { messages as certificateMessages } from '@register/i18n/messages/views/certificate'
import {
  goToHome,
  goToRegistrarHomeTab as goToRegistrarHomeTabAction
} from '@register/navigation'
import { IStoreState } from '@register/store'
import styled from '@register/styledComponents'
import { gqlToDraftTransformer } from '@register/transformer'
import {
  QueryContext,
  QueryProvider
} from '@register/views/DataProvider/QueryProvider'
import { TAB_ID } from '@register/views/RegistrationHome/tabs/inProgress/inProgressTab'
import * as Sentry from '@sentry/browser'
import 'moment/locale/bn'
import 'moment/locale/en-ie'
import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Dispatch } from 'redux'

export const ActionPageWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`
const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`
const FormContainer = styled.div`
  padding: 35px 25px;
`
const CustomTertiaryButton = styled(TertiaryButton)`
  height: 48px;
  &:disabled {
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.scrollBarGrey};
  }
`
const ButtonWrapper = styled.div`
  display: flex;

  button {
    margin-right: 10px;
  }
  button:last-child {
    margin-right: 0px;
  }
`
const PdfWrapper = styled.div`
  background: ${({ theme }) => theme.colors.blueDeepSeaLight};
  display: flex;
  height: 80vh;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
`

const Info = styled.div`
  ${({ theme }) => theme.fonts.bodyStyle};
  margin-bottom: 30px;
  color: ${({ theme }) => theme.colors.menuBackground};
`
const Title = styled.h4`
  ${({ theme }) => theme.fonts.h4Style};
  margin: 0 0 20px 0;
`

type State = {
  certificatePdf: string
  showConfirmationModal: boolean
}
type IProps = {
  event: Event
  registrationId: string
  draft: IApplication
  registerForm: IForm
  goToRegistrarHomeTab: typeof goToRegistrarHomeTabAction
}

type IFullProps = InjectedIntlProps &
  RouteComponentProps<{}> &
  IProps & { dispatch: Dispatch; drafts: IApplicationsState }

class ReviewCertificateActionComponent extends React.Component<
  IFullProps,
  State
> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      certificatePdf: '',
      showConfirmationModal: false
    }
  }

  toggleModal = () => {
    this.setState({
      showConfirmationModal: !this.state.showConfirmationModal
    })
  }

  readyToCertify = () => {
    const { dispatch, draft } = this.props
    draft.submissionStatus = SUBMISSION_STATUS.READY_TO_CERTIFY
    draft.action = Action.COLLECT_CERTIFICATE
    dispatch(modifyApplication(draft))
    this.toggleModal()
    dispatch(goToRegistrarHomeTabAction(TAB_ID.readyForPrint))
  }

  getTitle = () => {
    const { intl, event } = this.props
    let eventName = intl
      .formatHTMLMessage(constantsMessages.birth)
      .toLowerCase()

    switch (event) {
      case Event.BIRTH:
        return intl.formatHTMLMessage(certificateMessages.retiewTitle, {
          event: eventName
        })
      case Event.DEATH:
        eventName = intl
          .formatHTMLMessage(constantsMessages.death)
          .toLowerCase()
        return intl.formatHTMLMessage(certificateMessages.retiewTitle, {
          event: eventName
        })
      default:
        return intl.formatHTMLMessage(certificateMessages.retiewTitle, {
          event: eventName
        })
    }
  }

  render = () => {
    const {
      dispatch,
      registrationId,
      event,
      intl,
      drafts: { applications: drafts }
    } = this.props

    return (
      <Container>
        <EventTopBar
          title={intl.formatHTMLMessage(
            certificateMessages.certificateCollectionTitle
          )}
          goHome={() => dispatch(goToHome())}
        />
        <BodyContent>
          <FormContainer>
            <QueryProvider
              event={event}
              action={Action.LOAD_CERTIFICATE_APPLICATION}
              payload={{ id: registrationId }}
            >
              <QueryContext.Consumer>
                {({ loading, error, data, dataKey }) => {
                  if (loading) {
                    return <StyledSpinner id="print-certificate-spinner" />
                  }

                  if (error) {
                    Sentry.captureException(error)

                    return (
                      <ErrorText id="print-certificate-queue-error-text">
                        {intl.formatMessage(errorMessages.printQueryError)}
                      </ErrorText>
                    )
                  }

                  if (data) {
                    // @ts-ignore
                    const retrievedData = data[dataKey]
                    const transData: IFormData = gqlToDraftTransformer(
                      this.props.registerForm,
                      retrievedData
                    )
                    const reviewDraft = createReviewApplication(
                      registrationId,
                      transData,
                      event
                    )
                    const draftExist = !!drafts.find(
                      draft => draft.id === registrationId
                    )
                    if (!draftExist) {
                      dispatch(storeApplication(reviewDraft))
                    }

                    return (
                      <Box>
                        <Title>{this.getTitle()}</Title>
                        <Info>
                          {intl.formatHTMLMessage(
                            certificateMessages.retiewDescription
                          )}
                        </Info>

                        <PdfWrapper>
                          <PDFViewer pdfSource="" />
                        </PdfWrapper>

                        <ButtonWrapper>
                          <PrimaryButton
                            align={0}
                            id="myButton"
                            onClick={this.toggleModal}
                            icon={() => <Check />}
                          >
                            {intl.formatHTMLMessage(
                              certificateMessages.confirmAndPrint
                            )}
                          </PrimaryButton>

                          <CustomTertiaryButton disabled>
                            {intl.formatHTMLMessage(buttonMessages.editRecord)}
                          </CustomTertiaryButton>
                        </ButtonWrapper>
                      </Box>
                    )
                  }
                }}
              </QueryContext.Consumer>
            </QueryProvider>

            <ResponsiveModal
              title={intl.formatMessage(certificateMessages.modalTitle)}
              actions={[
                <CustomTertiaryButton onClick={this.toggleModal}>
                  {intl.formatHTMLMessage(buttonMessages.cancel)}
                </CustomTertiaryButton>,
                <PrimaryButton onClick={this.readyToCertify}>
                  {intl.formatHTMLMessage(buttonMessages.print)}
                </PrimaryButton>
              ]}
              show={this.state.showConfirmationModal}
              handleClose={this.toggleModal}
              contentHeight={100}
            >
              {intl.formatHTMLMessage(certificateMessages.modalBody)}
            </ResponsiveModal>
          </FormContainer>
        </BodyContent>
      </Container>
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

const getDraft = (
  drafts: IApplication[],
  registrationId: string,
  eventType: string
) =>
  drafts.find(draftItem => draftItem.id === registrationId) || {
    id: '',
    data: {},
    event: getEvent(eventType)
  }

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ registrationId: string; eventType: string }>
) {
  const { registrationId, eventType } = props.match.params

  const draft = getDraft(
    state.applicationsState.applications,
    registrationId,
    eventType
  )
  const event = getEvent(draft.event)

  return {
    event,
    registrationId,
    draft,
    drafts: state.applicationsState,
    registerForm: state.registerForm.registerForm[event]
  }
}
export const ReviewCertificateAction = connect(
  (state: IStoreState) => mapStatetoProps
)(injectIntl(ReviewCertificateActionComponent))
