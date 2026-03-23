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
import { messages } from '@client/i18n/messages/views/userForm'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { Icon } from '@client/v2-events/components/IconWithName'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { ROUTES } from '@client/v2-events/routes'
import { create } from 'zustand'
import {
  ActionType,
  alwaysTrue,
  deepDropNulls,
  EventConfig,
  FieldType,
  never,
  PageTypes,
  UserInput,
  SCOPES
} from '@opencrvs/commons/client'
import { AppBar, Frame, Spinner, ToggleMenu } from '@opencrvs/components'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import { Button } from '@opencrvs/components/src/Button'
import React, { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { formatUserRole, useRoles } from '@client/v2-events/hooks/useRoles'
import { defineConditional } from '@opencrvs/commons/client'
import { CircleButton } from '@opencrvs/components/src/buttons'
import { BackArrowDeepBlue, Cross } from '@opencrvs/components/src/icons'
import styled from 'styled-components'
import { useUsers } from '../../../../../v2-events/hooks/useUsers'

type RoleWithLabel = { id: string; label: string; scopes: string[] }
function getUserEditConfig(
  roles: RoleWithLabel[],
  selectedRoleId: string
): EventConfig {
  const selectedRole = roles.find((role) => role.id === selectedRoleId)

  return {
    id: '__user__',
    title: {
      id: 'user.title',
      defaultMessage: 'User',
      description: ''
    },
    label: {
      id: 'user.label',
      defaultMessage: 'User',
      description: ''
    },
    declaration: {
      label: {
        id: 'foobar',
        defaultMessage: 'foo',
        description: ''
      },
      pages: [
        {
          id: 'user.office',
          title: messages.assignedRegistrationOfficeGroupTitle,
          type: PageTypes.enum.FORM,
          requireCompletionToContinue: true,
          fields: [
            {
              id: 'primaryOfficeId',
              type: FieldType.LOCATION,
              required: true,
              configuration: {
                locationTypes: ['CRVS_OFFICE']
              },
              label: {
                id: 'user.office',
                defaultMessage: 'Office',
                description: ''
              }
            }
          ]
        },
        {
          id: 'user.details',
          title: messages.userDetails,
          type: PageTypes.enum.FORM,
          requireCompletionToContinue: true,
          fields: [
            {
              id: 'name',
              type: FieldType.NAME,
              required: true,
              hideLabel: true,
              label: {
                id: 'user.name',
                defaultMessage: 'Name',
                description: ''
              }
            },
            {
              id: 'phoneNumber',
              type: FieldType.PHONE,
              required: false,
              label: messages.phoneNumber
            },
            {
              id: 'email',
              type: FieldType.EMAIL,
              required: true,
              label: messages.email
            },
            {
              id: 'fullHonorificName',
              type: FieldType.TEXT,
              required: false,
              label: messages.fullHonorificName
            },
            {
              id: 'divider',
              type: FieldType.DIVIDER,
              label: {
                id: 'user.divider',
                defaultMessage: '',
                description: ''
              }
            },
            {
              id: 'role',
              type: FieldType.SELECT,
              required: true,
              label: messages.labelRole,
              options: roles.map((role) => ({
                value: role.id,
                label: role.label
              }))
            },
            {
              id: 'device',
              type: FieldType.TEXT,
              required: false,
              label: messages.userDevice
            }
          ]
        },
        {
          id: 'user.signature',
          title: messages.userSignatureAttachmentTitle,
          requireCompletionToContinue: true,
          type: PageTypes.enum.FORM,
          conditional: selectedRole?.scopes.includes(
            SCOPES.PROFILE_ELECTRONIC_SIGNATURE
          )
            ? defineConditional(alwaysTrue())
            : never(),
          fields: [
            {
              id: 'user.signature',
              type: FieldType.SIGNATURE,
              required: true,
              label: messages.userSignatureAttachment,
              signaturePromptLabel: {
                id: 'user.signature.prompt',
                defaultMessage: 'Sign here',
                description: ''
              },
              configuration: {
                maxFileSize: 123456
              }
            }
          ]
        }
      ]
    },
    actions: []
  }
}
type EventState = any
interface ActionAnnotationProps {
  userForm?: EventState
  setUserForm: (data: EventState) => void
  getUserForm: (initialValues?: EventState) => EventState
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
}

const useUserFormState = create<ActionAnnotationProps>()((set, get) => ({
  getUserForm: (initialValues?: EventState) =>
    get().userForm || deepDropNulls(initialValues ?? {}),
  setUserForm: (data: EventState) => {
    return set(() => ({ userForm: data }))
  },
  getTouchedFields: () =>
    Object.fromEntries(
      Object.entries(get().getUserForm()).map(([key]) => [key, true])
    ),
  clear: () => set(() => ({ userForm: undefined }))
}))

const NEW_USER = '__NEW__'
export const CreateNewUser = () => {
  const [{ officeId }] = useTypedSearchParams(ROUTES.V2.SETTINGS.USER.CREATE)
  const navigate = useNavigate()
  const { clear, setUserForm } = useUserFormState()
  useEffect(() => {
    clear()
    setUserForm({ primaryOfficeId: officeId })
    navigate(
      ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
        userId: NEW_USER,
        pageId: 'user.details'
      })
    )
  }, [clear, navigate, officeId, setUserForm])
  return <div />
}

export const EditUser = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { pageId, userId } = useTypedParams(ROUTES.V2.SETTINGS.USER.EDIT)
  const { getUserForm, setUserForm } = useUserFormState()
  const { listRoles } = useRoles()
  const [roles] = listRoles.useSuspenseQuery()
  const formState = getUserForm()

  useEffect(() => {
    if (!formState['primaryOfficeId'] && pageId !== 'user.office') {
      navigate(
        ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
          pageId: 'user.office',
          userId: userId
        })
      )
    }
  }, [formState, navigate, userId, pageId])

  const rolesWithHumanReadableNames = roles.map((role) => ({
    ...role,
    label: formatUserRole(role.id, intl)
  }))
  const eventConfig = getUserEditConfig(
    rolesWithHumanReadableNames,
    formState['role']
  )
  const formConfig = eventConfig.declaration
  return (
    <FormLayout actionComponent={<div>todo</div>}>
      <PagesComponent
        showReviewButton={false}
        actionType={ActionType.DECLARE}
        eventConfig={eventConfig}
        form={formState}
        formPages={formConfig.pages}
        pageId={pageId}
        back
        setFormData={(data) => setUserForm(data)}
        validatorContext={{}}
        onPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
              pageId: nextPageId,
              userId: userId
            })
          )
        }
        onSubmit={() => {
          navigate(
            ROUTES.V2.SETTINGS.USER.REVIEW.buildPath({
              userId: userId
            })
          )
        }}
      />
      {/*{modal}*/}
    </FormLayout>
  )
}

export const ReviewUser = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { getUserForm, getTouchedFields, clear } = useUserFormState()
  const formState = getUserForm()
  const { userId } = useTypedParams(ROUTES.V2.SETTINGS.USER.REVIEW)
  const { listRoles } = useRoles()
  const [roles] = listRoles.useSuspenseQuery()
  const rolesWithHumanReadableNames = roles.map((role) => ({
    ...role,
    label: formatUserRole(role.id, intl)
  }))
  const { createUser } = useUsers()
  const createUserMutation = createUser()
  const eventConfig = getUserEditConfig(
    rolesWithHumanReadableNames,
    formState['role']
  )
  const formConfig = eventConfig.declaration
  return (
    <FormLayout actionComponent={<div>todo</div>}>
      <ReviewComponent.Body
        // annotation={{}}
        // onAnnotationChange={(values) => console.log(values)}
        form={formState}
        formConfig={formConfig}
        reviewFields={[]}
        title={'TODO'}
        validatorContext={{}}
        onEdit={(values) =>
          navigate(
            ROUTES.V2.SETTINGS.USER.EDIT.buildPath({
              userId: userId,
              pageId: values.pageId
            })
          )
        }
      >
        <Button
          id="submit_user_form"
          type="positive"
          size="large"
          fullWidth
          onClick={() => {
            console.log({ formState })
            const payload: UserInput = {
              ...formState,
              name: [
                {
                  use: 'en',
                  given: [formState.name.firstname],
                  family: formState.name.surname
                }
              ]
            }

            createUserMutation.mutate(payload, {
              onSuccess: (data) => {
                navigate(
                  ROUTES.V2.SETTINGS.USER.VIEW.buildPath({
                    userId: data.id
                  })
                )
              }
            })
            // navigate(
            //   ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath(
            //     { eventId },
            //     { workqueue: slug }
            //   )
            // )
          }}
        >
          {intl.formatMessage(messages.creatingNewUser)}
        </Button>
      </ReviewComponent.Body>
    </FormLayout>
  )
}

/**
 * Layout for form and review pages.
 *
 */
function FormLayout({
  children,
  onSaveAndExit,
  actionComponent
}: {
  children: React.ReactNode
  onSaveAndExit?: () => void | Promise<void>
  actionComponent?: React.ReactNode
}) {
  const intl = useIntl()

  return (
    <Frame
      header={
        <FormHeader
          actionComponent={actionComponent}
          label={intl.formatMessage(sysAdminMessages.editUserDetailsTitle)}
          onSaveAndExit={onSaveAndExit}
        />
      }
      skipToContentText="Skip to form"
    >
      <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
        {children}
      </React.Suspense>
    </Frame>
  )
}

function FormHeader({
  label,
  onSaveAndExit,
  actionComponent
}: {
  label: string
  onSaveAndExit?: () => void
  actionComponent?: React.ReactNode
}) {
  const intl = useIntl()

  const onExit = useCallback(async () => {
    console.log('Edit')
  }, [])

  const onDelete = useCallback(async () => {
    console.log('Delete')
  }, [])

  const menuItems = []

  const getActionComponent = () => {
    if (onSaveAndExit) {
      return (
        <>
          <Button
            disabled={false}
            id="save-exit-btn"
            size="small"
            type="primary"
            onClick={onSaveAndExit}
          >
            <Icon name="FloppyDisk" />
            {'TOddaaDO'}
          </Button>

          <Button
            data-testid="exit-button"
            size="small"
            type="secondary"
            onClick={onExit}
          >
            <Icon name="X" />
            {'TOddDO'}
          </Button>
          {menuItems.length > 0 && (
            <ToggleMenu
              id="event-menu"
              menuItems={menuItems}
              toggleButton={
                <Icon
                  color="primary"
                  data-testid="event-menu-toggle-button-image"
                  name="DotsThreeVertical"
                  size="large"
                />
              }
            />
          )}
        </>
      )
    }

    return (
      <>
        {actionComponent}
        <Button
          data-testid="exit-button"
          size="small"
          type="icon"
          onClick={async () => console.log('FOO')}
        >
          <Icon name="X" />
        </Button>
      </>
    )
  }

  const BackButtonContainer = styled.div`
    margin-right: 16px;
    cursor: pointer;
  `

  const BackButtonText = styled.span`
    ${({ theme }) => theme.fonts.bold16};
    text-transform: capitalize;
    @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
      display: none;
    }
  `

  const getHeaderLeft = () => {
    return (
      <BackButtonContainer
        id="action_page_back_button"
        onClick={() => console.log('back')}
        key="action_page_back_button"
      >
        <CircleButton>{<BackArrowDeepBlue />}</CircleButton>
      </BackButtonContainer>
    )
  }

  const getHeaderRight = () => {
    return (
      <CircleButton
        data-testid="crcl-btn"
        id="crcl-btn"
        onClick={() => console.log('home')}
        key="crcl-btn"
      >
        <Cross color="currentColor" />
      </CircleButton>
    )
  }

  return (
    <>
      <AppBar
        desktopTitle={label}
        mobileTitle={label}
        desktopRight={getHeaderRight()}
        mobileRight={getHeaderRight()}
        mobileLeft={getHeaderLeft()}
        desktopLeft={getHeaderLeft()}
      />
    </>
  )
}
