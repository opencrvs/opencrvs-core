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
import { buttonMessages, errorMessages } from '@client/i18n/messages'
import { userMessages } from '@client/i18n/messages'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { messages } from '@client/i18n/messages/views/userForm'
import * as routes from '@client/navigation/routes'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useRoles } from '@client/v2-events/hooks/useRoles'
import { ROUTES } from '@client/v2-events/routes/routes'
import {
  ActionType,
  FieldValue,
  FileFieldValue,
  TokenUserType,
  UUID,
  CreateUserInput,
  UpdateUserInput
} from '@opencrvs/commons/client'
import { AppBar, Frame, Spinner } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import {
  CircleButton,
  ICON_ALIGNMENT,
  SuccessButton
} from '@opencrvs/components/lib/buttons'
import { Check, Cross } from '@opencrvs/components/lib/icons'
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import { Toast } from '@opencrvs/components/lib/Toast'
import { TRPCClientError } from '@trpc/client'
import React, { useCallback, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import styled from 'styled-components'
import { useUsers } from '../../../../../v2-events/hooks/useUsers'
import { createTemporaryId, isTemporaryId } from '@client/v2-events/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import { usePermissions } from '@client/hooks/useAuthorization'
import toast from 'react-hot-toast'
import { useUserEditConfig } from '@client/hooks/useUserEditConfig'
import { useUserFormState } from './useUserFormState'

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

type EventState = {
  primaryOfficeId?: string
  role?: string
  name?: { firstname: string; surname: string }
  phoneNumber?: string
  email?: string
  fullHonorificName?: string
  device?: string
  signature?: FileFieldValue
  [key: string]: unknown
}

interface UserFormState {
  userForm?: EventState
  setUserForm: (data: EventState) => void
  getUserForm: (initialValues?: EventState) => EventState
  getTouchedFields: () => Record<string, boolean>
  clear: () => void
}

const USER_OFFICE_PAGE_ID = 'user.office'
const UNAUTHORIZED_TOAST_ID = 'user-editor-unauthorized'
const EMPTY_FORM: EventState = {}

/**
 * Shared close/redirect handler for the EditUser and ReviewUser flows.
 *
 * `replace: true` is used for forced redirects (e.g. unauthorized) so the
 * gated page is not left in the browser history.
 */
function useCloseUserForm({
  isNewUser,
  primaryOfficeId,
  fromUserList,
  userId,
  setUserForm
}: {
  isNewUser: boolean
  primaryOfficeId: string | undefined
  fromUserList: boolean
  userId: UUID
  setUserForm: (data: EventState) => void
}) {
  const navigate = useNavigate()
  return useCallback(
    (options?: { replace?: boolean }) => {
      setUserForm(EMPTY_FORM)
      if (isNewUser) {
        navigate(
          primaryOfficeId
            ? `${routes.TEAM_USER_LIST}?locationId=${primaryOfficeId}`
            : routes.TEAM_USER_LIST,
          options
        )
        return
      }
      if (fromUserList) {
        navigate(
          {
            pathname: routes.TEAM_USER_LIST,
            search: serializeSearchParams({ locationId: primaryOfficeId })
          },
          options
        )
      } else {
        navigate(ROUTES.V2.SETTINGS.USER.VIEW.buildPath({ userId }), options)
      }
    },
    [isNewUser, primaryOfficeId, fromUserList, userId, navigate, setUserForm]
  )
}

const CreateNewUserComponent = () => {
  const [{ officeId, from }] = useTypedSearchParams(
    ROUTES.V2.SETTINGS.USER.CREATE
  )
  const navigate = useNavigate()
  const { clear, setUserForm } = useUserFormState()
  useEffect(() => {
    clear()
    setUserForm({ primaryOfficeId: officeId })
    navigate(
      ROUTES.V2.SETTINGS.USER.EDIT.buildPath(
        {
          userId: createTemporaryId(),
          pageId: 'user.details'
        },
        { from }
      )
    )
  }, [clear, navigate, officeId, setUserForm, from])
  return <div />
}

export const CreateNewUser = withSuspense(CreateNewUserComponent)

const EditUserComponent = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { pageId, userId } = useTypedParams(ROUTES.V2.SETTINGS.USER.EDIT)
  const [searchParams] = useTypedSearchParams(ROUTES.V2.SETTINGS.USER.EDIT)
  const userForm = useUserFormState((s) => s.userForm)
  const setUserForm = useUserFormState((s) => s.setUserForm)
  const formState = userForm ?? EMPTY_FORM
  const { listRoles } = useRoles()
  const [roles] = listRoles.useSuspenseQuery()
  const selectedRole = roles.find((role) => role.id === formState['role'])
  const isNewUser = isTemporaryId(userId)
  const { getUser } = useUsers()
  const userQuery = getUser.useQuery(userId, { enabled: !isNewUser })
  const targetUser = userQuery.data
  const additionalFields = window.config.ADDITIONAL_USER_FIELDS ?? []
  const maybeLocationId = UUID.safeParse(userForm?.primaryOfficeId)
  const { getConfig } = useUserEditConfig(
    maybeLocationId.success ? maybeLocationId.data : undefined,
    selectedRole,
    additionalFields
  )
  const eventConfig = getConfig()
  const formConfig = eventConfig.declaration

  const { canEditUser, canAddOfficeUsers } = usePermissions()

  const handleClose = useCloseUserForm({
    isNewUser,
    primaryOfficeId: formState['primaryOfficeId'],
    fromUserList: searchParams.from === 'user.list',
    userId,
    setUserForm
  })

  const newUserOfficeId = formState['primaryOfficeId'] as UUID | undefined

  const isNewUserBlocked =
    isNewUser &&
    !!newUserOfficeId &&
    !canAddOfficeUsers({ id: newUserOfficeId })

  const isExistingUserBlocked =
    !isNewUser &&
    !!targetUser &&
    (targetUser.type !== TokenUserType.enum.user || !canEditUser(targetUser))

  const isUnauthorized = isNewUserBlocked || isExistingUserBlocked

  // Office-required redirect: any page other than the office picker needs
  // primaryOfficeId in the form state. Skipped while the auth gate is firing.
  useEffect(() => {
    if (isUnauthorized) {
      return
    }
    if (!formState['primaryOfficeId'] && pageId !== USER_OFFICE_PAGE_ID) {
      navigate(
        ROUTES.V2.SETTINGS.USER.EDIT.buildPath(
          {
            pageId: USER_OFFICE_PAGE_ID,
            userId
          },
          searchParams
        )
      )
    }
  }, [formState, navigate, userId, pageId, searchParams, isUnauthorized])

  if (userQuery.isLoading) {
    return (
      <ActionPageLight
        title={intl.formatMessage(sysAdminMessages.editUserDetailsTitle)}
        goBack={() => navigate(-1)}
        hideBackground={true}
      >
        <Container>
          <SpinnerWrapper>
            <Spinner id="user-form-loading-spinner" size={25} />
          </SpinnerWrapper>
        </Container>
      </ActionPageLight>
    )
  }

  return (
    <FormLayout
      onClose={handleClose}
      isUnauthorized={isUnauthorized}
      userId={userId}
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
        formData={formState as Record<string, FieldValue>}
        formPages={formConfig.pages}
        pageId={pageId || eventConfig.declaration.pages[0].id}
        setFormData={(data) => {
          setUserForm(data)
        }}
        validatorContext={{}}
        onPageChange={(nextPageId: string) =>
          navigate(
            ROUTES.V2.SETTINGS.USER.EDIT.buildPath(
              {
                pageId: nextPageId,
                userId: userId
              },
              searchParams
            )
          )
        }
        onSubmit={() => {
          navigate(
            ROUTES.V2.SETTINGS.USER.REVIEW.buildPath(
              {
                userId: userId
              },
              searchParams
            )
          )
        }}
      />
    </FormLayout>
  )
}

export const EditUser = withSuspense(EditUserComponent)

const ReviewUserComponent = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const userForm = useUserFormState((s) => s.userForm)
  const setUserForm = useUserFormState((s) => s.setUserForm)
  const clear = useUserFormState((s) => s.clear)
  const { userId } = useTypedParams(ROUTES.V2.SETTINGS.USER.REVIEW)

  const [searchParams] = useTypedSearchParams(ROUTES.V2.SETTINGS.USER.REVIEW)
  const isNewUser = isTemporaryId(userId)
  const { getUser, createUser, updateUser } = useUsers()
  const { listRoles } = useRoles()
  const [roles] = listRoles.useSuspenseQuery()
  const selectedRole = roles.find(
    (role) => role.id === (userForm ?? EMPTY_FORM)['role']
  )

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
  const additionalFields = window.config.ADDITIONAL_USER_FIELDS ?? []
  const maybeLocationId = UUID.safeParse(userForm?.primaryOfficeId)
  const { getConfig } = useUserEditConfig(
    maybeLocationId.success ? maybeLocationId.data : undefined,
    selectedRole,
    additionalFields
  )
  const eventConfig = getConfig()
  const formConfig = eventConfig.declaration

  useEffect(() => {
    if (isNewUser || !existingUserQuery.data) return
    const user = existingUserQuery.data
    if (user.type !== TokenUserType.enum.user) return
    if (userForm && Object.keys(userForm).length > 0) return

    setUserForm({
      primaryOfficeId: user.primaryOfficeId,
      role: user.role,
      name: {
        firstname: user.name.firstname,
        surname: user.name.surname
      },
      phoneNumber: user.mobile,
      email: user.email,
      fullHonorificName: user.fullHonorificName,
      signature: user.signature
        ? { path: user.signature, originalFilename: '', type: '' }
        : undefined,
      device: user.device,
      // Additional field values are spread at the top level because FormFieldGenerator
      // looks up values by field ID as a flat key (e.g. formState['user.staffId']).
      // The nesting into data: {} only happens when building the UserInput payload.
      ...(user.data ?? {})
    })
  }, [isNewUser, existingUserQuery.data, setUserForm, userForm])

  const formState = userForm ?? EMPTY_FORM
  const createUserMutation = createUser()
  const updateUserMutation = updateUser()

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

  const handleClose = useCloseUserForm({
    isNewUser,
    primaryOfficeId: formState['primaryOfficeId'],
    fromUserList: searchParams.from === 'user.list',
    userId,
    setUserForm
  })

  const { canEditUser, canAddOfficeUsers } = usePermissions()
  const targetUser = existingUserQuery.data

  const newUserOfficeId = formState['primaryOfficeId'] as UUID | undefined

  const isNewUserBlocked =
    isNewUser &&
    !!newUserOfficeId &&
    !canAddOfficeUsers({ id: newUserOfficeId })

  const isExistingUserBlocked =
    !isNewUser &&
    !!targetUser &&
    (targetUser.type !== TokenUserType.enum.user || !canEditUser(targetUser))

  const isUnauthorized = isNewUserBlocked || isExistingUserBlocked

  const isSubmitting =
    createUserMutation.isPending || updateUserMutation.isPending

  if (existingUserQuery.isLoading) {
    return (
      <ActionPageLight
        title={intl.formatMessage(sysAdminMessages.editUserDetailsTitle)}
        goBack={() => navigate(-1)}
        hideBackground={true}
      >
        <Container>
          <SpinnerWrapper>
            <Spinner id="user-form-submitting-spinner" size={25} />
          </SpinnerWrapper>
        </Container>
      </ActionPageLight>
    )
  }

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
      isUnauthorized={isUnauthorized}
      userId={userId}
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
        form={formState as Record<string, FieldValue>}
        formConfig={formConfig}
        reviewFields={[]}
        title={intl.formatMessage(messages.userFormReviewTitle)}
        validatorContext={{}}
        onEdit={(values) =>
          navigate(
            ROUTES.V2.SETTINGS.USER.EDIT.buildPath(
              {
                userId: userId,
                pageId: values.pageId
              },
              searchParams
            )
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
              const data: Record<string, FieldValue> = Object.fromEntries(
                additionalFields.map((f) => [
                  f.id,
                  formState[f.id] as FieldValue
                ])
              )
              const payload: CreateUserInput = {
                // Normalise to undefined so an empty string isn't stored as a
                // unique value, causing duplicate-key errors on the next submit.
                mobile: formState.phoneNumber || undefined,
                email: formState.email || undefined,
                role: formState.role!,
                primaryOfficeId: formState.primaryOfficeId as UUID,
                signature: formState.signature,
                name: {
                  firstname: formState!.name!.firstname,
                  surname: formState!.name!.surname
                },
                data
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
              const data: Record<string, FieldValue> = Object.fromEntries(
                additionalFields.map((f) => [
                  f.id,
                  formState[f.id] as FieldValue
                ])
              )
              const payload: UpdateUserInput = {
                id: userId,
                // See create payload above — same normalisation needed.
                mobile: formState.phoneNumber || undefined,
                email: formState.email || undefined,
                role: formState.role!,
                primaryOfficeId: formState.primaryOfficeId as UUID,
                signature: formState.signature,
                name: {
                  firstname: formState!.name!.firstname,
                  surname: formState!.name!.surname
                },
                data
              }
              updateUserMutation.mutate(payload, {
                onSuccess: (data) => {
                  clear()
                  navigate(
                    ROUTES.V2.SETTINGS.USER.VIEW.buildPath({
                      userId: data.id
                    })
                  )
                },
                onError: handleMutationError
              })
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
export const ReviewUser = withSuspense(ReviewUserComponent)

/**
 * Layout for form and review pages.
 *
 */
function FormLayout({
  children,
  onSaveAndExit,
  onClose,
  title,
  actionComponent,
  isUnauthorized,
  userId
}: {
  children: React.ReactNode
  onSaveAndExit?: () => void | Promise<void>
  onClose?: (options?: { replace?: boolean }) => void
  title: string
  actionComponent?: React.ReactNode
  isUnauthorized?: boolean
  userId?: string
}) {
  const intl = useIntl()
  const unauthorizedHandledRef = React.useRef(false)

  useEffect(() => {
    unauthorizedHandledRef.current = false
  }, [userId])

  useEffect(() => {
    if (isUnauthorized && !unauthorizedHandledRef.current) {
      unauthorizedHandledRef.current = true
      toast.custom(
        <Toast
          type="warning"
          onClose={() => toast.remove(UNAUTHORIZED_TOAST_ID)}
        >
          {intl.formatMessage(errorMessages.unauthorized)}
        </Toast>,
        { id: UNAUTHORIZED_TOAST_ID }
      )
      onClose?.({ replace: true })
    }
  }, [isUnauthorized, onClose, intl])

  return (
    <Frame
      header={
        <FormHeader
          actionComponent={actionComponent}
          label={title}
          onSaveAndExit={onSaveAndExit}
          onClose={onClose ? () => onClose() : undefined}
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
      />
    </>
  )
}
