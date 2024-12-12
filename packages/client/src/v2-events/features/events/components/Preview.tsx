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

import { EventConfig } from '@opencrvs/commons'
import {
  Accordion,
  Button,
  Frame,
  Icon,
  Link,
  ResponsiveModal,
  Text,
  ListReview,
  Stack
} from '@opencrvs/components'
import React from 'react'
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'

import { FormConfig } from '@opencrvs/commons/client'
import { FormHeader } from '@client/v2-events/features/events/components/FormHeader'

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
  changeButton: {
    id: 'buttons.change',
    defaultMessage: 'Change',
    description: 'The label for the change button'
  },
  actionModalCancel: {
    id: 'actionModal.cancel',
    defaultMessage: 'Cancel',
    description: 'The label for cancel button of action modal'
  },
  actionModalPrimaryAction: {
    id: 'actionModal.PrimaryAction',
    defaultMessage: '{action, select, declare{Declare} other{{action}}}',
    description: 'The label for primary action button of action modal'
  },
  actionModalTitle: {
    id: 'actionModal.title',
    defaultMessage:
      '{action, select, declare{Declare} other{{action}}} the member?',
    description: 'The title for action modal'
  },
  actionModalDescription: {
    id: 'actionModal.description',
    defaultMessage:
      'The declarant will be notified of this action and a record of this decision will be recorded',
    description: 'The description for action modal'
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

/**
 * Preview component, used to display the "read-only" version of the form.
 * User can review the data and take actions like declare, reject or edit the data.
 */
export const PreviewComponent = ({
  eventConfig,
  formConfig,
  form,
  onEdit,
  children,
  title
}: {
  children: React.ReactNode
  eventConfig: EventConfig
  formConfig: FormConfig
  form: Record<string, any>
  onEdit: ({ pageId, fieldId }: { pageId: string; fieldId?: string }) => void
  title: string
}) => {
  const intl = useIntl()

  return (
    <Frame
      skipToContentText="Skip to form"
      header={<FormHeader label={eventConfig.label} />}
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
                    {eventConfig.label.defaultMessage}
                  </TitleContainer>
                  <SubjectContainer id={`header_subject`}>
                    {title}
                  </SubjectContainer>
                </Stack>
              </HeaderContent>
            </HeaderContainer>
            <FormData>
              <ReviewContainter>
                {formConfig.pages.map((page) => {
                  return (
                    <DeclarationDataContainer
                      key={'Section_' + page.title.defaultMessage}
                    >
                      <Accordion
                        name={'Accordion_' + page.id}
                        label={intl.formatMessage(page.title)}
                        labelForHideAction="Hide"
                        labelForShowAction="Show"
                        action={
                          <Link
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit({ pageId: page.id })
                            }}
                          >
                            {intl.formatMessage(messages.changeButton)}
                          </Link>
                        }
                        expand={true}
                      >
                        <ListReview id={'Section_' + page.id}>
                          {page.fields.map((field) => (
                            <ListReview.Row
                              id={field.id}
                              key={field.id}
                              label={intl.formatMessage(field.label)}
                              value={form[field.id] || ''}
                              actions={
                                <Link
                                  onClick={(e) => {
                                    e.stopPropagation()

                                    onEdit({
                                      pageId: page.id,
                                      fieldId: field.id
                                    })
                                  }}
                                >
                                  {intl.formatMessage(messages.changeButton)}
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
          {children}
        </LeftColumn>
      </Row>
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

const PreviewActionComponent = ({
  onConfirm,
  onReject,
  messages
}: {
  onConfirm: () => void
  onReject?: () => void
  messages: {
    title: MessageDescriptor
    description: MessageDescriptor
    onConfirm: MessageDescriptor
  }
}) => {
  const intl = useIntl()
  return (
    <Container>
      <UnderLayBackground background="success">
        <Content>
          <Title>{intl.formatMessage(messages.title)}</Title>
          <Description>{intl.formatMessage(messages.description)}</Description>
          <ActionContainer>
            <Button
              type="positive"
              size="large"
              id="validateDeclarationBtn"
              onClick={onConfirm}
            >
              <Icon name="Check" />
              {intl.formatMessage(messages.onConfirm)}
            </Button>
          </ActionContainer>
        </Content>
      </UnderLayBackground>
    </Container>
  )
}

const EditModal: React.FC<{
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

const ActionModal: React.FC<{
  close: (result: boolean | null) => void
  action: string
}> = ({ close, action }) => {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title={intl.formatMessage(messages.actionModalTitle, { action })}
      actions={[
        <Button
          type="tertiary"
          id={'cancel_' + action}
          key={'cancel_' + action}
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(messages.actionModalCancel)}
        </Button>,
        <Button
          type="primary"
          key={'confirm_' + action}
          id={'confirm_' + action}
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(messages.actionModalPrimaryAction, { action })}
        </Button>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      <Stack>
        <Text variant="reg16" element="p" color="grey500">
          {intl.formatMessage(messages.actionModalDescription)}
        </Text>
      </Stack>
    </ResponsiveModal>
  )
}

export const Preview = {
  Body: PreviewComponent,
  Actions: PreviewActionComponent,
  EditModal: EditModal,
  ActionModal: ActionModal
}
