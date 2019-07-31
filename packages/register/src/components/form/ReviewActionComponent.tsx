import {
  DangerButton,
  ICON_ALIGNMENT,
  PrimaryButton,
  SuccessButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { Check, Cross, Upload } from '@opencrvs/components/lib/icons'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import {
  IApplication,
  IPayload,
  SUBMISSION_STATUS
} from '@register/applications'
import { Action } from '@register/forms'
import styled from '@register/styledComponents'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'

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
  flex-direction: row;
  align-items: center;

  button:first-child {
    margin-right: 16px;
  }
`
const messages = defineMessages({
  reviewActionTitle: {
    id: 'review.actions.title.applicationStatus',
    defaultMessage:
      'Application is {completeApplication, select, true {complete} false {incomplete}}',
    description: 'Title for review action component'
  },
  reviewActionDescriptionIncomplete: {
    id: 'review.actions.description.confirmInComplete',
    defaultMessage:
      'By sending this incomplete application, there will be a digital record made.\n\nTell the applicant that they will receive an SMS with a tracking ID. They will need this to complete the application at a registration office within 30 days. The applicant will need to provide all mandatory information before the birth can be registered.',
    description:
      'Description for review action component when incomplete application'
  },
  reviewActionDescriptionComplete: {
    id: 'review.actions.description.confirmComplete',
    defaultMessage:
      'By sending this application for review, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.',
    description:
      'Description for review action component when complete application'
  },
  registerActionDescriptionIncomplete: {
    id: 'register.actions.description.confirmInComplete',
    defaultMessage:
      'Mandatory information is missing. Please add this information so that you can complete the registration process.'
  },
  registerActionDescriptionComplete: {
    id: 'register.actions.description.confirmComplete',
    defaultMessage:
      'By clicking register, you confirm that the information is correct and has been reviewed by the applicant. The applicant understands that it will be used to register the birth and for planning purposes.\n\nBy registering this birth, a birth certificate will be generated with your signature for issuance.'
  },
  registerActionTitle: {
    id: 'register.actions.title.applicationStatus',
    defaultMessage: 'Register or reject?'
  },
  registerActionDescription: {
    id: 'register.actions.description',
    defaultMessage:
      'By registering this birth, a birth certificate will be generated with your signature for issuance.'
  },
  createAndValidateApplicationActionDescription: {
    id: 'create.validate.application.action.decription',
    defaultMessage:
      '{completeApplication, select, true {By sending for approval you confirm that the information has been reviewed by the applicant and that it is ready to register.} false {Mandatory information is missing. Please add this information so that you can send to register.}}'
  },
  validateCompleteApplicationActionTitle: {
    id: 'validate.complete.application.action.title',
    defaultMessage: 'Ready to approve?'
  },
  validateCompleteApplicationActionDescription: {
    id: 'validate.complete.application.action.description',
    defaultMessage:
      'By approving you confirm that the applicatiohn is ready to register'
  },
  validateApplicationActionModalTitle: {
    id: 'validate.application.action.modal.title',
    defaultMessage: 'Send for approval?'
  },
  validateApplicationActionModalDescription: {
    id: 'validate.application.action.modal.description',
    defaultMessage:
      'This application will be sent to the registrar from them to register'
  },
  valueSendForReview: {
    id: 'register.form.submit',
    defaultMessage: 'SEND FOR REVIEW',
    description: 'Submit Button Text'
  },
  valueSendForReviewIncomplete: {
    id: 'register.form.submitIncomplete',
    defaultMessage: 'Send incomplete application',
    description: 'Title for Incomplete submit button'
  },
  valueRegister: {
    id: 'review.button.register',
    defaultMessage: 'REGISTER',
    description: 'Register button text'
  },
  valueReject: {
    id: 'review.button.reject',
    defaultMessage: 'Reject Application',
    description: 'Reject application button text'
  },
  submitConfirmationTitle: {
    id: 'register.form.modal.title.submitConfirmation',
    defaultMessage:
      '{completeApplication, select, true {Send application for review?} false {Send incomplete application?}}',
    description: 'Submit title text on modal'
  },
  submitConfirmationDesc: {
    id: 'register.form.modal.desc.submitConfirmation',
    defaultMessage:
      '{completeApplication, select, true {This application will be sent to the registrar for them to review.} false {This application will be sent to the register who is now required to complete the application.}}',
    description: 'Submit description text on modal'
  },
  registerConfirmationTitle: {
    id: 'register.form.modal.title.registerConfirmation',
    defaultMessage: 'Register this application?',
    description: 'Title for register confirmation modal'
  },
  registerConfirmationDesc: {
    id: 'register.form.modal.desc.registerConfirmation',
    defaultMessage: 'Are you sure?',
    description: 'Description for register confirmation modal'
  },
  registerButtonTitle: {
    id: 'register.form.modal.button.title.registerConfirmation',
    defaultMessage: 'Register',
    description: 'Label for button on register confirmation modal'
  },
  approveButton: {
    id: 'button.approve',
    defaultMessage: 'Approve'
  },
  submitButton: {
    id: 'register.form.modal.submitButton',
    defaultMessage: 'Send',
    description: 'Submit button on submit modal'
  },
  cancel: {
    id: 'register.form.modal.cancel',
    defaultMessage: 'Cancel',
    description: 'Cancel button on submit modal'
  }
})

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
                message: messages.registerConfirmationDesc
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
                message: messages.registerConfirmationDesc
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
  IReviewActionProps & InjectedIntlProps,
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
      ACTION_TO_CONTENT_MAP[action].draftStatus[String(draftApplication)]
        .completionStatus[String(completeApplication)]
    return (
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
                {intl.formatMessage(messages.valueRegister)}
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
                    ? messages.valueSendForReview
                    : messages.approveButton
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
                    ? messages.valueSendForReview
                    : messages.valueSendForReviewIncomplete
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
                {intl.formatMessage(messages.valueReject)}
              </DangerButton>
            )}
          </ActionContainer>
        </Content>
        {actionContent.modal && (
          <ResponsiveModal
            title={intl.formatMessage(
              actionContent.modal.title.message,
              actionContent.modal.title.payload
            )}
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
                {intl.formatMessage(messages.cancel)}
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
                  ? intl.formatMessage(messages.registerButtonTitle)
                  : applicationToBeValidated
                  ? intl.formatMessage(messages.approveButton)
                  : intl.formatMessage(messages.submitButton)}
              </PrimaryButton>
            ]}
            show={this.state.showSubmitModal}
            handleClose={this.toggleSubmitModalOpen}
          >
            {intl.formatMessage(
              actionContent.modal.description.message,
              actionContent.modal.description.payload
            )}
          </ResponsiveModal>
        )}
      </Container>
    )
  }
}

export const ReviewAction = injectIntl(ReviewActionComponent)
