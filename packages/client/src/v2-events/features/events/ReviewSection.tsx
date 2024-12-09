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

import React, { useState } from 'react'
import styled from 'styled-components'
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
import { useParams } from 'react-router-dom'
import { useEventConfiguration } from './useEventConfiguration'
import { EventDocument } from '@opencrvs/commons'
import { useModal } from '@client/v2-events/hooks/useModal'
import { FormHeader } from './EventFormWizard'
import { useEvents } from './useEvents/useEvents'

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

enum REJECT_ACTIONS {
  ARCHIVE,
  SEND_FOR_UPDATE
}

interface RejectionState {
  rejectAction: REJECT_ACTIONS
  details: string
  isDuplicate: boolean
}

const ReviewSectionComponent = ({ event }: { event: EventDocument }) => {
  const [modal, openModal] = useModal()

  const { data } = event.actions.filter(
    (action) => action.type === 'DECLARE'
  )[0]

  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )

  if (!configuration) {
    throw new Error('Event configuration not found with type: ' + event.type)
  }

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
                            Change
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
                                    Change
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
        <RightColumn></RightColumn>
      </Row>
      {modal}
    </Frame>
  )
}

export const ReviewSection = () => {
  const { eventId } = useParams<{
    eventId: string
  }>()
  const events = useEvents()

  const [event] = events.getEvent(eventId)

  if (!event) {
    throw new Error('Event not found')
  }

  if (!event) return <div>Failed to get event</div>
  return <ReviewSectionComponent event={event}></ReviewSectionComponent>
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
  return (
    <Container>
      <UnderLayBackground background="success">
        <Content>
          <Title>Register member</Title>
          <Description>
            By clicking register, you confirm that the information entered is
            correct and the member can be registered.
          </Description>
          <ActionContainer>
            <Button
              type="positive"
              size="large"
              id="validateDeclarationBtn"
              onClick={onRegister}
            >
              <Icon name="Check" />
              Register
            </Button>
            <Button
              type="negative"
              size="large"
              id="rejectDeclarationBtn"
              onClick={onReject}
            >
              <Icon name="X" />
              Reject
            </Button>
          </ActionContainer>
        </Content>
      </UnderLayBackground>
    </Container>
  )
}

const RegisterModal: React.FC<{
  close: (result: boolean | null) => void
}> = ({ close }) => (
  <ResponsiveModal
    autoHeight
    responsive={false}
    title="Register the member?"
    actions={[
      <Button
        type="tertiary"
        id="cancel_register"
        key="cancel_register"
        onClick={() => {
          close(null)
        }}
      >
        Cancel
      </Button>,
      <Button
        type="primary"
        key="confirm_register"
        id="confirm_register"
        onClick={() => {
          close(true)
        }}
      >
        Register
      </Button>
    ]}
    show={true}
    handleClose={() => close(null)}
  >
    <Stack>
      <Text variant="reg16" element="p" color="grey500">
        The action will be recorded.
      </Text>
    </Stack>
  </ResponsiveModal>
)

const RejectModal: React.FC<{
  close: (result: RejectionState | null) => void
}> = ({ close }) => {
  const [state, setState] = useState<RejectionState>({
    rejectAction: REJECT_ACTIONS.ARCHIVE,
    details: '',
    isDuplicate: false
  })

  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title="Reason for rejection?"
      actions={[
        <Button
          type="tertiary"
          id="cancel_reject"
          key="cancel_reject"
          onClick={() => {
            close(null)
          }}
        >
          Cancel
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
          Archive
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
          Send for updates
        </Button>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      <Stack direction="column" alignItems="left">
        <Text variant="reg16" element="p" color="grey500">
          Please describe the updates required to this record for follow up
          action.
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
          label={'Mark as a duplicate'}
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
}> = ({ close }) => (
  <ResponsiveModal
    autoHeight
    responsive={false}
    title="Edit declaration?"
    actions={[
      <Button
        type="tertiary"
        id="cancel_edit"
        key="cancel_edit"
        onClick={() => {
          close(null)
        }}
      >
        Cancel
      </Button>,
      <Button
        type="primary"
        key="confirm_edit"
        id="confirm_edit"
        onClick={() => {
          close(true)
        }}
      >
        Continue
      </Button>
    ]}
    show={true}
    handleClose={() => close(null)}
  >
    <Stack>
      <Text variant="reg16" element="p" color="grey500">
        A record will be created of any changes you make
      </Text>
    </Stack>
  </ResponsiveModal>
)
