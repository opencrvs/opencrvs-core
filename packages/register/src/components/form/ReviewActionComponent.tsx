import {
  DangerButton,
  ICON_ALIGNMENT,
  PrimaryButton,
  SuccessButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { Upload, Check, Cross } from '@opencrvs/components/lib/icons'
import {
  IApplication,
  IPayload,
  SUBMISSION_STATUS
} from '@register/applications'
import { messages } from '@register/i18n/messages/views/review'
import { buttonMessages, constantsMessages } from '@register/i18n/messages'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { Action } from '@register/forms'
import styled from '@register/styledComponents'
import * as React from 'react'

interface IReviewActionProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  draftApplication?: boolean
  completeApplication: boolean
  applicationToBeValidated?: boolean
  applicationToBeRegistered?: boolean
  alreadyRejectedApplication: boolean
  application: IApplication
  submitApplicationAction: (
    application: IApplication,
    submissionStatus: string,
    action: string,
    payload?: IPayload
  ) => void
  rejectApplicationAction?: () => void
}

const Container = styled.div`
  position: relative;
  margin-top: 32px;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 32px -32px -32px -32px;
  }
`
const Content = styled.div`
  z-index: 1;
  padding: 24px 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding-bottom: 32px;
  }
`
const UnderLayBackground = styled.div.attrs<{ background: string }>({})`
  background-color: ${({ background, theme }) =>
    background === 'success'
      ? theme.colors.success
      : background === 'error'
      ? theme.colors.error
      : theme.colors.primary};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.16;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle}
  margin-bottom: 8px;
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin-bottom: 16px;
`

const ActionContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;

  button:first-child {
    margin-right: 16px;
  }

  & > button {
    margin-bottom: 8px;
  }
`

enum ACTION {
  APPLICATION_TO_BE_DECLARED = 'APPLICATION_TO_BE_DECLARED',
  APPLICATION_TO_BE_VALIDATED = 'APPLICATION_TO_BE_VALIDATED',
  APPLICATION_TO_BE_REGISTERED = 'APPLICATION_TO_BE_REGISTERED'
}

const ACTION_TO_CONTENT_MAP: { [key: string]: any } = {
  [String(ACTION.APPLICATION_TO_BE_DECLARED)]: {
    draftStatus: {
      true: {
        completionStatus: {
          true: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: true }
            },
            description: {
              message: messages.reviewActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.submitConfirmationTitle,
                payload: { completeApplication: true }
              },
              description: {
                message: messages.submitConfirmationDesc,
                payload: { completeApplication: true }
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: false }
            },
            description: {
              message: messages.reviewActionDescriptionIncomplete
            },
            modal: {
              title: {
                message: messages.submitConfirmationTitle,
                payload: { completeApplication: false }
              },
              description: {
                message: messages.submitConfirmationDesc,
                payload: { completeApplication: false }
              }
            }
          }
        }
      }
    }
  },
  [String(ACTION.APPLICATION_TO_BE_VALIDATED)]: {
    draftStatus: {
      true: {
        completionStatus: {
          true: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: true }
            },
            description: {
              message: messages.reviewActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.submitConfirmationTitle,
                payload: { completeApplication: true }
              },
              description: {
                message: messages.submitConfirmationDesc,
                payload: { completeApplication: true }
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: false }
            },
            description: {
              message: messages.reviewActionDescriptionIncomplete
            }
          }
        }
      },
      false: {
        completionStatus: {
          true: {
            title: {
              message: messages.validateCompleteApplicationActionTitle
            },
            description: {
              message: messages.validateCompleteApplicationActionDescription
            },
            modal: {
              title: {
                message: messages.validateConfirmationTitle,
                payload: { completeApplication: true }
              },
              description: {
                message: messages.validateConfirmationDesc,
                payload: { completeApplication: true }
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: false }
            },
            description: {
              message: messages.registerActionDescriptionIncomplete
            }
          }
        }
      }
    }
  },
  [String(ACTION.APPLICATION_TO_BE_REGISTERED)]: {
    draftStatus: {
      true: {
        completionStatus: {
          true: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: true }
            },
            description: {
              message: messages.registerActionDescriptionComplete
            },
            modal: {
              title: {
                message: messages.registerConfirmationTitle
              },
              description: {
                message: constantsMessages.areYouSure
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: false }
            },
            description: {
              message: messages.registerActionDescriptionIncomplete
            }
          }
        }
      },
      false: {
        completionStatus: {
          true: {
            title: {
              message: messages.registerActionTitle
            },
            description: {
              message: messages.registerActionDescription
            },
            modal: {
              title: {
                message: messages.registerConfirmationTitle
              },
              description: {
                message: constantsMessages.areYouSure
              }
            }
          },
          false: {
            title: {
              message: messages.reviewActionTitle,
              payload: { completeApplication: false }
            },
            description: {
              message: messages.registerActionDescriptionIncomplete
            }
          }
        }
      }
    }
  }
}

interface IReviewActionState {
  showSubmitModal: boolean
}
class ReviewActionComponent extends React.Component<
  IReviewActionProps & IntlShapeProps,
  IReviewActionState
> {
  state = { showSubmitModal: false }
  toggleSubmitModalOpen = () => {
    this.setState(prevState => ({
      showSubmitModal: !prevState.showSubmitModal
    }))
  }
  render() {
    const {
      id,
      applicationToBeValidated,
      applicationToBeRegistered,
      alreadyRejectedApplication,
      completeApplication,
      application,
      submitApplicationAction,
      draftApplication,
      rejectApplicationAction,
      intl
    } = this.props

    const background = !completeApplication
      ? 'error'
      : draftApplication
      ? 'success'
      : ''
    const action = applicationToBeRegistered
      ? ACTION.APPLICATION_TO_BE_REGISTERED
      : applicationToBeValidated
      ? ACTION.APPLICATION_TO_BE_VALIDATED
      : ACTION.APPLICATION_TO_BE_DECLARED

    const actionContent =
      (ACTION_TO_CONTENT_MAP[action].draftStatus[String(draftApplication)] &&
        ACTION_TO_CONTENT_MAP[action].draftStatus[String(draftApplication)]
          .completionStatus[String(completeApplication)]) ||
      null
    return !actionContent ? null : (
      <Container id={id}>
        <UnderLayBackground background={background} />
        <Content>
          <Title>
            {intl.formatMessage(
              actionContent.title.message,
              actionContent.title.payload
            )}
          </Title>
          <Description>
            {intl.formatMessage(
              actionContent.description.message,
              actionContent.description.payload
            )}
          </Description>
          <ActionContainer>
            {applicationToBeRegistered ? (
              <SuccessButton
                id="registerApplicationBtn"
                icon={() => <Check />}
                onClick={this.toggleSubmitModalOpen}
                disabled={!completeApplication}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(buttonMessages.register)}
              </SuccessButton>
            ) : applicationToBeValidated ? (
              <PrimaryButton
                id="validateApplicationBtn"
                icon={() => <Upload />}
                onClick={this.toggleSubmitModalOpen}
                disabled={!completeApplication}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(
                  draftApplication
                    ? buttonMessages.sendForReview
                    : buttonMessages.sendForApproval
                )}
              </PrimaryButton>
            ) : (
              <PrimaryButton
                id="submit_form"
                icon={() => <Upload />}
                onClick={this.toggleSubmitModalOpen}
                disabled={false}
                align={ICON_ALIGNMENT.LEFT}
              >
                {intl.formatMessage(
                  completeApplication
                    ? buttonMessages.sendForReview
                    : buttonMessages.sendIncomplete
                )}
              </PrimaryButton>
            )}

            {rejectApplicationAction && !alreadyRejectedApplication && (
              <DangerButton
                id="rejectApplicationBtn"
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <Cross color="white" />}
                onClick={rejectApplicationAction}
              >
                {intl.formatMessage(buttonMessages.reject)}
              </DangerButton>
            )}
          </ActionContainer>
        </Content>
        {actionContent.modal && (
          <ResponsiveModal
            title={intl.formatMessage(actionContent.modal.title.message, {
              ...actionContent.modal.title.payload,
              event: application.event
            })}
            contentHeight={96}
            actions={[
              <TertiaryButton
                id="cancel-btn"
                key="cancel"
                onClick={() => {
                  this.toggleSubmitModalOpen()
                  if (document.documentElement) {
                    document.documentElement.scrollTop = 0
                  }
                }}
              >
                {intl.formatMessage(buttonMessages.cancel)}
              </TertiaryButton>,
              <PrimaryButton
                key="submit"
                id="submit_confirm"
                onClick={() =>
                  draftApplication
                    ? submitApplicationAction(
                        application,
                        SUBMISSION_STATUS.READY_TO_SUBMIT,
                        Action.SUBMIT_FOR_REVIEW
                      )
                    : applicationToBeRegistered
                    ? submitApplicationAction(
                        application,
                        SUBMISSION_STATUS.READY_TO_REGISTER,
                        Action.REGISTER_APPLICATION
                      )
                    : submitApplicationAction(
                        application,
                        SUBMISSION_STATUS.READY_TO_APPROVE,
                        Action.APPROVE_APPLICATION
                      )
                }
              >
                {applicationToBeRegistered
                  ? intl.formatMessage(buttonMessages.register)
                  : applicationToBeValidated
                  ? intl.formatMessage(buttonMessages.send)
                  : intl.formatMessage(buttonMessages.send)}
              </PrimaryButton>
            ]}
            show={this.state.showSubmitModal}
            handleClose={this.toggleSubmitModalOpen}
          >
            {intl.formatMessage(actionContent.modal.description.message, {
              ...actionContent.modal.description.payload,
              event: application.event
            })}
          </ResponsiveModal>
        )}
      </Container>
    )
  }
}

export const ReviewAction = injectIntl(ReviewActionComponent)
