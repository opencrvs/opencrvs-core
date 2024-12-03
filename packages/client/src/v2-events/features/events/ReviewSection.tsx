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

import React from 'react'
import { tennisClubMemberDeclaration as declaration } from './fixtures'
import styled from 'styled-components'
import {
  Accordion,
  AppBar,
  Button,
  Frame,
  Icon,
  Link,
  ListReview,
  ResponsiveModal,
  Stack,
  Text
} from '@opencrvs/components'
import { ReviewHeader } from '../../../views/RegisterForm/review/ReviewHeader'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { useParams } from 'react-router-dom'
import { useEventConfiguration } from './useEventConfiguration'
import { useEventForm } from './useEventForm'
import { EventConfig } from '@opencrvs/commons'
import { useModal } from '@client/hooks/useModal'
// @ToDO: Fix import

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

export const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  height: 700px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

// @ToDO: Fix any
const getValueFromFieldId = (declaration: any, fieldId: any) =>
  fieldId.split('.').reduce((acc: any, part: any) => acc?.[part], declaration)

const ReviewSectionComponent = ({ event }: { event: EventConfig }) => {
  const [modal, openModal] = useModal()

  const { title, pages, exit, saveAndExit } = useEventForm(event)
  const offlineCountryConfig = useSelector(getOfflineData)

  const handleRegister = async () => {
    const confirmedRegister = await openModal<boolean | null>((close) => (
      <RegisterModal close={close}></RegisterModal>
    ))
    if (confirmedRegister) {
      alert('Registered new member')
    }
    return
  }

  const goBackToForm = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
    fieldId: string
  ) => {
    e.stopPropagation()
    alert('Going back to ' + fieldId)
  }

  return (
    <Frame
      skipToContentText="Skip to form"
      header={
        <AppBar
          mobileLeft={title}
          desktopLeft={title}
          desktopRight={
            <Stack direction="row">
              <Button type="primary" onClick={saveAndExit}>
                <Icon name="DownloadSimple" />
                Save and exit
              </Button>
              <Button type="secondary" onClick={exit}>
                <Icon name="X" />
                Exit
              </Button>
            </Stack>
          }
        />
      }
    >
      <Row>
        <LeftColumn>
          <Card>
            <ReviewHeader
              id="review_header"
              logoSource={offlineCountryConfig.config.COUNTRY_LOGO.file}
              title={event.label.defaultMessage}
              subject={
                'Member registration for ' +
                declaration.applicant.firstname +
                ' ' +
                declaration.applicant.surname
              }
            />
            <FormData>
              <ReviewContainter>
                {pages.map((page) => {
                  return (
                    <DeclarationDataContainer
                      key={'Section_' + page.title.defaultMessage}
                    >
                      <Accordion
                        name={page.title.defaultMessage}
                        label={page.title.defaultMessage}
                        labelForHideAction="Hide"
                        labelForShowAction="Show"
                        action={
                          <Link onClick={(e) => goBackToForm(e, page.id)}>
                            Change
                          </Link>
                        }
                        expand={true}
                      >
                        <ListReview id={'Section_' + page.title.defaultMessage}>
                          {page.fields.map((field, id) => (
                            <ListReview.Row
                              id={id.toString()}
                              key={id}
                              label={field.label.defaultMessage}
                              value={getValueFromFieldId(declaration, field.id)}
                              actions={
                                <Link
                                  onClick={(e) => goBackToForm(e, field.id)}
                                >
                                  Change
                                </Link>
                              }
                            />
                          ))}
                        </ListReview>
                      </Accordion>
                    </DeclarationDataContainer>
                  )
                })}
              </ReviewContainter>
            </FormData>
          </Card>
          <ReviewActionComponent onRegister={handleRegister} />
        </LeftColumn>
        <RightColumn></RightColumn>
      </Row>
      {modal}
    </Frame>
  )
}

export const ReviewSection = () => {
  const { eventType } = useParams<{ eventType: string }>()

  const { event, isLoading } = useEventConfiguration(eventType)
  if (isLoading) return <div>Loading...</div>
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
  /* position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; */
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

const ReviewActionComponent = ({ onRegister }: { onRegister: () => {} }) => {
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
              onClick={() => alert('Rejected')}
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
    title="Register the death?"
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
        type="negative"
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
