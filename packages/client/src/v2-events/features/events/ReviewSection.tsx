/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { useModal } from '@client/v2-events/hooks/useModal'
import { EventConfig } from '@opencrvs/commons'
import {
  Accordion,
  Button,
  Checkbox,
  Frame,
  Icon,
  Link,
  ListReview,
  ResponsiveModal,
  Stack,
  Text,
  TextInput
} from '@opencrvs/components'
import React, { useState } from 'react'
import styled from 'styled-components'
import { FormHeader } from './EventFormWizard'
import { defineMessages, useIntl } from 'react-intl'

const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`
const HeaderContainer = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`
const HeaderContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: left;
  gap: 16px;
  align-items: center;
  ${({ theme }) => theme.fonts.h2}
  color: ${({ theme }) => theme.colors.copy};
`

const TitleContainer = styled.div`
  ${({ theme }) => theme.fonts.bold14}
  color: ${({ theme }) => theme.colors.supportingCopy};
  text-transform: uppercase;
`
const SubjectContainer = styled.div`
  ${({ theme }) => theme.fonts.h2}
  overflow-wrap: anywhere;
`
const RightColumn = styled.div`
  width: 40%;
  border-radius: 4px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
const LeftColumn = styled.div`
  flex-grow: 1;
  max-width: 840px;
  overflow: hidden;
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    border: 0;
    margin: 0;
  }
`

const FormData = styled.div`
  padding-top: 24px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
  }
`

const ReviewContainter = styled.div`
  padding: 0px 32px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0;
  }
`
const DeclarationDataContainer = styled.div``

const messages = defineMessages({
  chagneButton: {
    id: 'buttons.chagne',
    defaultMessage: 'Change',
    description: 'The label for the change button'
  },
  reviewActionTitle: {
    id: 'reviewAction.title',
    defaultMessage: 'Register member',
    description: 'The title for review action'
  },
  reviewActionDescription: {
    id: 'reviewAction.description',
    defaultMessage:
      'By clicking register, you confirm that the information entered is correct and the member can be registered.',
    description: 'The description for review action'
  },
  reviewActionRegister: {
    id: 'reviewAction.register',
    defaultMessage: 'Register',
    description: 'The label for register button of review action'
  },
  reviewActionReject: {
    id: 'reviewAction.reject',
    defaultMessage: 'Reject',
    description: 'The label for reject button of review action'
  },
  registerModalCancel: {
    id: 'registerModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of register modal'
  },
  registerModalRegister: {
    id: 'registerModal.register',
    defaultMessage: 'Register',
    description: 'The label for register button of register modal'
  },
  registerModalTitle: {
    id: 'registerModal.title',
    defaultMessage: 'Register the member?',
    description: 'The title for register modal'
  },
  registerModalDescription: {
    id: 'registerModal.description',
    defaultMessage:
      'The declarant will be notified of this correction and a record of this decision will be recorded',
    description: 'The description for register modal'
  },
  rejectModalCancel: {
    id: 'rejectModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of reject modal'
  },
  rejectModalArchive: {
    id: 'rejectModal.archive',
    defaultMessage: 'Archive',
    description: 'The label for archive button of reject modal'
  },
  rejectModalSendForUpdate: {
    id: 'rejectModal.sendForUpdate',
    defaultMessage: 'Send For Update',
    description: 'The label for send For Update button of reject modal'
  },
  rejectModalTitle: {
    id: 'rejectModal.title',
    defaultMessage: 'Reason for rejection?',
    description: 'The title for reject modal'
  },
  rejectModalDescription: {
    id: 'rejectModal.description',
    defaultMessage:
      'Please describe the updates required to this record for follow up action.',
    description: 'The description for reject modal'
  },
  rejectModalMarkAsDuplicate: {
    id: 'rejectModal.markAsDuplicate',
    defaultMessage: 'Mark as a duplicate',
    description: 'The label for mark as duplicate checkbox of reject modal'
  },
  changeModalCancel: {
    id: 'changeModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of change modal'
  },
  changeModalContinue: {
    id: 'changeModal.continue',
    defaultMessage: 'Continue',
    description: 'The label for continue button of change modal'
  },
  changeModalTitle: {
    id: 'changeModal.title',
    defaultMessage: 'Edit declaration?',
    description: 'The title for change modal'
  },
  changeModalDescription: {
    id: 'changeModal.description',
    defaultMessage: 'A record will be created of any changes you make',
    description: 'The description for change modal'
  }
})

enum REJECT_ACTIONS {
  ARCHIVE,
  SEND_FOR_UPDATE
}

interface RejectionState {
  rejectAction: REJECT_ACTIONS
  details: string
  isDuplicate: boolean
}
type Props = {
  data: Record<string, any>
  configuration: EventConfig
}

export const ReviewSection = ({ data, configuration }: Props) => {
  const [modal, openModal] = useModal()
  const intl = useIntl()

  const { forms } = configuration.actions.filter(
    (action) => action.type === 'DECLARE'
  )[0]

  const handleRegister = async () => {
    const confirmedRegister = await openModal<boolean | null>((close) => (
      <RegisterModal close={close}></RegisterModal>
    ))
    if (confirmedRegister) {
      alert('Registered new member')
    }
    return
  }

  const handleReject = async () => {
    const confirmedReject = await openModal<RejectionState | null>((close) => (
      <RejectModal close={close}></RejectModal>
    ))
    if (confirmedReject) {
      const { rejectAction, ...rest } = confirmedReject
      switch (rejectAction) {
        case REJECT_ACTIONS.ARCHIVE:
          alert('Archived the registration ' + JSON.stringify(rest))
          break
        case REJECT_ACTIONS.SEND_FOR_UPDATE:
          alert('Sent the registration for update ' + JSON.stringify(rest))
          break
        default:
          break
      }
    }
    return
  }

  const handleEdit = async (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
    fieldId: string
  ) => {
    e.stopPropagation()
    const confirmedEdit = await openModal<boolean | null>((close) => (
      <EditFieldModal close={close}></EditFieldModal>
    ))
    if (confirmedEdit) {
      alert('Editing field: ' + fieldId)
    }
    return
  }

  return (
    <Frame
      skipToContentText="Skip to form"
      header={<FormHeader label={configuration.label} />}
    >
      <Row>
        <LeftColumn>
          <Card>
            <HeaderContainer>
              <HeaderContent>
                <Stack
                  direction="column"
                  alignItems="flex-start"
                  justify-content="flex-start"
                  gap={6}
                >
                  <TitleContainer id={`header_title`}>
                    {configuration.label.defaultMessage}
                  </TitleContainer>
                  <SubjectContainer id={`header_subject`}>
                    {'Member registration for ' +
                      (data['applicant.firstname'] || '') +
                      ' ' +
                      (data['applicant.surname'] || '')}
                  </SubjectContainer>
                </Stack>
              </HeaderContent>
            </HeaderContainer>
            <FormData>
              <ReviewContainter>
                {forms[0].pages.map((page) => {
                  return (
                    <DeclarationDataContainer
                      key={'Section_' + page.title.defaultMessage}
                    >
                      <Accordion
                        name={'Accordion_' + page.id}
                        label={page.id}
                        labelForHideAction="Hide"
                        labelForShowAction="Show"
                        action={
                          <Link onClick={(e) => handleEdit(e, page.id)}>
                            {intl.formatMessage(messages.chagneButton)}
                          </Link>
                        }
                        expand={true}
                      >
                        <ListReview id={'Section_' + page.id}>
                          {page.fields.map((field, index) => {
                            const id =
                              field.type === 'TEXT' || field.type === 'DATE'
                                ? field.id
                                : index.toString()

                            return (
                              <ListReview.Row
                                id={id}
                                key={id}
                                label={field.label.defaultMessage}
                                value={data[id] || ''}
                                actions={
                                  <Link onClick={(e) => handleEdit(e, id)}>
                                    {intl.formatMessage(messages.chagneButton)}
                                  </Link>
                                }
                              />
                            )
                          })}
                        </ListReview>
                      </Accordion>
                    </DeclarationDataContainer>
                  )
                })}
              </ReviewContainter>
            </FormData>
          </Card>
          <ReviewActionComponent
            onRegister={handleRegister}
            onReject={handleReject}
          />
        </LeftColumn>
      </Row>
      {modal}
    </Frame>
  )
}

const Container = styled.div`
  position: relative;
  margin-top: 48px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey300};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    max-width: 100vw;
  }
`
const Content = styled.div`
  z-index: 1;
  padding: 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px;
    padding-bottom: 32px;
  }
`
const UnderLayBackground = styled.div<{ background: string }>`
  background-color: ${({ background, theme }) =>
    background === 'success'
      ? theme.colors.greenLighter
      : background === 'error'
      ? theme.colors.redLighter
      : theme.colors.greenLighter};
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.h2}
  margin-bottom: 12px;
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.reg18};
  margin-bottom: 32px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    ${({ theme }) => theme.fonts.reg16}
  }
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

const ReviewActionComponent = ({
  onRegister,
  onReject
}: {
  onRegister: () => {}
  onReject: () => {}
}) => {
  const intl = useIntl()
  return (
    <Container>
      <UnderLayBackground background="success">
        <Content>
          <Title>{intl.formatMessage(messages.reviewActionTitle)}</Title>
          <Description>
            {intl.formatMessage(messages.reviewActionDescription)}
          </Description>
          <ActionContainer>
            <Button
              type="positive"
              size="large"
              id="validateDeclarationBtn"
              onClick={onRegister}
            >
              <Icon name="Check" />
              {intl.formatMessage(messages.reviewActionRegister)}
            </Button>
            <Button
              type="negative"
              size="large"
              id="rejectDeclarationBtn"
              onClick={onReject}
            >
              <Icon name="X" />
              {intl.formatMessage(messages.reviewActionReject)}
            </Button>
          </ActionContainer>
        </Content>
      </UnderLayBackground>
    </Container>
  )
}

const RegisterModal: React.FC<{
  close: (result: boolean | null) => void
}> = ({ close }) => {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title={intl.formatMessage(messages.registerModalTitle)}
      actions={[
        <Button
          type="tertiary"
          id="cancel_register"
          key="cancel_register"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(messages.registerModalCancel)}
        </Button>,
        <Button
          type="primary"
          key="confirm_register"
          id="confirm_register"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(messages.registerModalRegister)}
        </Button>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      <Stack>
        <Text variant="reg16" element="p" color="grey500">
          {intl.formatMessage(messages.registerModalDescription)}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

const RejectModal: React.FC<{
  close: (result: RejectionState | null) => void
}> = ({ close }) => {
  const [state, setState] = useState<RejectionState>({
    rejectAction: REJECT_ACTIONS.ARCHIVE,
    details: '',
    isDuplicate: false
  })

  const intl = useIntl()

  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title={intl.formatMessage(messages.rejectModalTitle)}
      actions={[
        <Button
          type="tertiary"
          id="cancel_reject"
          key="cancel_reject"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(messages.rejectModalCancel)}
        </Button>,
        <Button
          type="secondaryNegative"
          key="confirm_reject_with_archive"
          id="confirm_reject_with_archive"
          onClick={() => {
            close({
              ...state,
              rejectAction: REJECT_ACTIONS.ARCHIVE
            })
          }}
        >
          {intl.formatMessage(messages.rejectModalArchive)}
        </Button>,
        <Button
          type="negative"
          key="confirm_reject_with_update"
          id="confirm_reject_with_update"
          onClick={() => {
            close({
              ...state,
              rejectAction: REJECT_ACTIONS.SEND_FOR_UPDATE
            })
          }}
        >
          {intl.formatMessage(messages.rejectModalSendForUpdate)}
        </Button>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      <Stack direction="column" alignItems="left">
        <Text variant="reg16" element="p" color="grey500">
          {intl.formatMessage(messages.rejectModalDescription)}
        </Text>
        <TextInput
          required={true}
          value={state.details}
          onChange={(e) =>
            setState((prev) => ({ ...prev, details: e.target.value }))
          }
        />
        <Checkbox
          name={'markDUplicate'}
          label={intl.formatMessage(messages.rejectModalMarkAsDuplicate)}
          value={''}
          selected={state.isDuplicate}
          onChange={() =>
            setState((prev) => ({ ...prev, isDuplicate: !prev.isDuplicate }))
          }
        />
      </Stack>
    </ResponsiveModal>
  )
}

const EditFieldModal: React.FC<{
  close: (result: boolean | null) => void
}> = ({ close }) => {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title={intl.formatMessage(messages.changeModalTitle)}
      actions={[
        <Button
          type="tertiary"
          id="cancel_edit"
          key="cancel_edit"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(messages.changeModalCancel)}
        </Button>,
        <Button
          type="primary"
          key="confirm_edit"
          id="confirm_edit"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(messages.changeModalContinue)}
        </Button>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      <Stack>
        <Text variant="reg16" element="p" color="grey500">
          {intl.formatMessage(messages.changeModalDescription)}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}
