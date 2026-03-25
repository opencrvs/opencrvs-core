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
import { buttonMessages } from '@client/i18n/messages'
import { userMessages } from '@client/i18n/messages'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { messages } from '@client/i18n/messages/views/userForm'
import * as routes from '@client/navigation/routes'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { formatUserRole, useRoles } from '@client/v2-events/hooks/useRoles'
import { ROUTES } from '@client/v2-events/routes'
import {
  ActionType,
  alwaysTrue,
  deepDropNulls,
  defineConditional,
  EventConfig,
  FieldType,
  never,
  PageTypes,
  SCOPES,
  TokenUserType,
  EventConfigToDeclarationFormType,
  UserInput
} from '@opencrvs/commons/client'
import { AppBar, Frame, Spinner } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import {
  CircleButton,
  ICON_ALIGNMENT,
  SuccessButton
} from '@opencrvs/components/lib/buttons'
import { BackArrowDeepBlue, Check, Cross } from '@opencrvs/components/lib/icons'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Toast } from '@opencrvs/components/lib/Toast'
import { TRPCClientError } from '@trpc/client'
import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import styled from 'styled-components'
import { create } from 'zustand'
import { useUsers } from '../../../../../v2-events/hooks/useUsers'
import { emptyMessage } from '@client/v2-events/utils'

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0px auto;
  width: 100%;
`

const SpinnerWrapper = styled.div`
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
`

type RoleWithLabel = { id: string; label: string; scopes: string[] }
function getUserEditConfig(roles: RoleWithLabel[], selectedRoleId?: string) {
  const selectedRole = roles.find((role) => role.id === selectedRoleId)

  return {
    id: '__user__',
    summary: {
      fields: []
    },
    advancedSearch: [],
    flags: [],
    title: emptyMessage,
    label: emptyMessage,
    declaration: {
      label: emptyMessage,
      pages: [
        {
          id: 'user.office',
          title: messages.registrationOffice,
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
              label: messages.registrationOffice
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
              label: emptyMessage
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
              label: emptyMessage
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
              id: 'signature',
              type: FieldType.SIGNATURE,
              required: false,
              label: messages.userSignatureAttachment,
              signaturePromptLabel: messages.userSignatureAttachment,
              configuration: {
                maxFileSize: 123456
              }
            }
          ]
        }
      ]
    },
    actions: []
  } as const satisfies EventConfig
}

type EventState = Partial<
  EventConfigToDeclarationFormType<ReturnType<typeof getUserEditConfig>>
>

interface UserFormState {
  userForm?: EventState
  setUserForm: (data: EventState) => void
  getUserForm: (initialValues?: EventState) => EventState
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
}

const useUserFormState = create<UserFormState>()((set, get) => ({
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
  const isNewUser = userId === NEW_USER
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

  const handleClose = () => {
    if (isNewUser) {
      const officeId = formState['primaryOfficeId']
      navigate(
        officeId
          ? `${routes.TEAM_USER_LIST}?locationId=${officeId}`
          : routes.TEAM_USER_LIST
      )
    } else {
      navigate(ROUTES.V2.SETTINGS.USER.VIEW.buildPath({ userId }))
    }
  }

  return (
    <FormLayout
      onClose={handleClose}
      title={
        isNewUser
          ? intl.formatMessage(messages.userFormTitle)
          : intl.formatMessage(sysAdminMessages.editUserDetailsTitle)
      }
    >
      <PagesComponent
        attachmentPath={`users/${userId}/`}
        showReviewButton={false}
        actionType={ActionType.DECLARE}
        eventConfig={eventConfig}
        form={formState}
        formPages={formConfig.pages}
        pageId={pageId || eventConfig.declaration.pages[0].id}
        setFormData={(data) => {
          setUserForm(data)
        }}
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
    </FormLayout>
  )
}

export const ReviewUser = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { getUserForm, getTouchedFields, setUserForm, clear } =
    useUserFormState()
  const { userId } = useTypedParams(ROUTES.V2.SETTINGS.USER.REVIEW)
  const isNewUser = userId === NEW_USER
  const { getUser, createUser, updateUser } = useUsers()
  const { listRoles } = useRoles()
  const [roles] = listRoles.useSuspenseQuery()

  const [showDuplicateMobileError, setShowDuplicateMobileError] =
    React.useState(false)
  const [duplicatePhoneNumber, setDuplicatePhoneNumber] = React.useState('')
  const [showDuplicateEmailError, setShowDuplicateEmailError] =
    React.useState(false)
  const [duplicateEmail, setDuplicateEmail] = React.useState('')

  const resetErrors = () => {
    setShowDuplicateMobileError(false)
    setDuplicatePhoneNumber('')
    setShowDuplicateEmailError(false)
    setDuplicateEmail('')
  }

  const existingUserQuery = getUser.useQuery(userId, { enabled: !isNewUser })

  useEffect(() => {
    if (isNewUser || !existingUserQuery.data) return
    const user = existingUserQuery.data
    if (user.type !== TokenUserType.enum.user) return
    if (Object.keys(getUserForm()).length > 0) return

    setUserForm({
      primaryOfficeId: user.primaryOfficeId,
      role: user.role,
      name: {
        firstname: user.name[0]?.given[0] ?? '',
        surname: user.name[0]?.family ?? '',
        middlename: ''
      },
      phoneNumber: user.mobile,
      email: user.email,
      fullHonorificName: user.fullHonorificName,
      signature: user.signature
        ? { path: user.signature, originalFilename: '', type: '' }
        : undefined,
      device: user.device
    })
  }, [isNewUser, existingUserQuery.data, setUserForm, getUserForm])

  const formState = getUserForm()

  const rolesWithHumanReadableNames = roles.map((role) => ({
    ...role,
    label: formatUserRole(role.id, intl)
  }))
  const createUserMutation = createUser()
  const updateUserMutation = updateUser()
  const eventConfig = getUserEditConfig(
    rolesWithHumanReadableNames,
    formState['role']
  )
  const formConfig = eventConfig.declaration

  const handleMutationError = (error: unknown) => {
    if (error instanceof TRPCClientError && error.data?.code === 'CONFLICT') {
      if (error.message === 'DUPLICATE_PHONE') {
        setDuplicatePhoneNumber(formState.phoneNumber ?? '')
        setShowDuplicateMobileError(true)
        return
      }
      if (error.message === 'DUPLICATE_EMAIL') {
        setDuplicateEmail(formState.email ?? '')
        setShowDuplicateEmailError(true)
        return
      }
    }
  }

  const handleClose = () => {
    if (isNewUser) {
      const officeId = formState['primaryOfficeId']
      navigate(
        officeId
          ? `${routes.TEAM_USER_LIST}?locationId=${officeId}`
          : routes.TEAM_USER_LIST
      )
    } else {
      navigate(ROUTES.V2.SETTINGS.USER.VIEW.buildPath({ userId }))
    }
  }

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending

  if (isSubmitting) {
    return (
      <ActionPageLight
        title={
          isNewUser
            ? intl.formatMessage(messages.userFormTitle)
            : intl.formatMessage(sysAdminMessages.editUserDetailsTitle)
        }
        goBack={() => navigate(-1)}
        hideBackground={true}
      >
        <Container>
          <SpinnerWrapper>
            <Spinner id="user-form-submitting-spinner" size={25} />
            <p>
              {isNewUser
                ? intl.formatMessage(messages.creatingNewUser)
                : intl.formatMessage(messages.updatingUser)}
            </p>
          </SpinnerWrapper>
        </Container>
      </ActionPageLight>
    )
  }

  return (
    <FormLayout
      title={
        isNewUser
          ? intl.formatMessage(messages.userFormTitle)
          : intl.formatMessage(sysAdminMessages.editUserDetailsTitle)
      }
      onClose={handleClose}
    >
      {showDuplicateMobileError && (
        <Toast
          id="duplicate-mobile-error-notification"
          type="warning"
          onClose={() => setShowDuplicateMobileError(false)}
        >
          {intl.formatMessage(userMessages.duplicateUserMobileErrorMessege, {
            number: duplicatePhoneNumber
          })}
        </Toast>
      )}
      {showDuplicateEmailError && (
        <Toast
          id="duplicate-email-error-notification"
          type="warning"
          onClose={() => setShowDuplicateEmailError(false)}
        >
          {intl.formatMessage(userMessages.duplicateUserEmailErrorMessege, {
            email: duplicateEmail
          })}
        </Toast>
      )}
      <ReviewComponent.Body
        form={formState}
        formConfig={formConfig}
        reviewFields={[]}
        title={intl.formatMessage(messages.userFormReviewTitle)}
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
        {isNewUser ? (
          <Button
            id="submit_user_form"
            type="positive"
            size="large"
            fullWidth
            onClick={() => {
              resetErrors()
              const payload: UserInput = {
                ...formState,
                mobile: formState.phoneNumber,
                email: formState.email!,
                role: formState.role!,
                primaryOfficeId: formState.primaryOfficeId!,
                signature: formState.signature,
                name: [
                  {
                    use: 'en',
                    given: [formState!.name!.firstname],
                    family: formState!.name!.surname
                  }
                ]
              }
              createUserMutation.mutate(payload, {
                onSuccess: () => {
                  clear()
                  navigate(
                    `${routes.TEAM_USER_LIST}?locationId=${payload.primaryOfficeId}`
                  )
                },
                onError: handleMutationError
              })
            }}
          >
            {intl.formatMessage(buttonMessages.createUser)}
          </Button>
        ) : (
          <SuccessButton
            id="submit-edit-user-form"
            onClick={() => {
              resetErrors()
              const payload: UserInput = {
                ...formState,
                mobile: formState.phoneNumber,
                email: formState.email!,
                role: formState.role!,
                primaryOfficeId: formState.primaryOfficeId!,
                signature: formState.signature,
                name: [
                  {
                    use: 'en',
                    given: [formState!.name!.firstname],
                    family: formState!.name!.surname
                  }
                ]
              }
              updateUserMutation.mutate(
                { ...payload, id: userId },
                {
                  onSuccess: (data) => {
                    clear()
                    navigate(
                      ROUTES.V2.SETTINGS.USER.VIEW.buildPath({
                        userId: data.id
                      })
                    )
                  },
                  onError: handleMutationError
                }
              )
            }}
            icon={() => <Check />}
            align={ICON_ALIGNMENT.LEFT}
          >
            {intl.formatMessage(buttonMessages.confirm)}
          </SuccessButton>
        )}
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
  onClose,
  title,
  actionComponent
}: {
  children: React.ReactNode
  onSaveAndExit?: () => void | Promise<void>
  onClose?: () => void
  title: string
  actionComponent?: React.ReactNode
}) {
  return (
    <Frame
      header={
        <FormHeader
          actionComponent={actionComponent}
          label={title}
          onSaveAndExit={onSaveAndExit}
          onClose={onClose}
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
  onClose
}: {
  label: string
  onSaveAndExit?: () => void
  onClose?: () => void
  actionComponent?: React.ReactNode
}) {
  const BackButtonContainer = styled.div`
    margin-right: 16px;
    cursor: pointer;
  `

  const getHeaderLeft = () => {
    return (
      <BackButtonContainer
        id="action_page_back_button"
        onClick={onClose}
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
        onClick={onClose}
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
