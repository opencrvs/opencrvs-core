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
import {
  buttonMessages,
  constantsMessages,
  errorMessages,
  userMessages
} from '@client/i18n/messages'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { messages } from '@client/i18n/messages/views/userForm'
import * as routes from '@client/navigation/routes'
import { Pages as PagesComponent } from '@client/v2-events/features/events/components/Pages'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useRoles } from '@client/v2-events/hooks/useRoles'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { ROUTES } from '@client/v2-events/routes/routes'
import {
  FieldValue,
  FilePathPrefix,
  FileFieldValue,
  getDeclaration,
  getDeclarationPages,
  TokenUserType,
  UUID,
  CreateUserInput,
  UpdateUserInput
} from '@opencrvs/commons/client'
import {
  AppBar,
  Frame,
  Spinner,
  Toast,
  Button,
  Icon,
  Dialog,
  Text
} from '@opencrvs/components'
import { Check, Cross } from '@opencrvs/components/lib/icons'
import { CircleButton } from '@opencrvs/components/lib/buttons'
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
import { todayISO } from '@opencrvs/commons/client'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import { usePermissions } from '@client/hooks/useAuthorization'
import toast from 'react-hot-toast'
import { showToast } from '@client/v2-events/features/events/useToastAndRedirect'
import { messages as notificationMessages } from '@client/i18n/messages/views/notifications'
import { getFormBackAction } from '@client/v2-events/layouts/form/FormBackAction'
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

/**
 * Component to initiate the creation of a new user.
 * Immediately navigates to the user editor flow, supplying a temporary user ID and "user.details" page.
 */
const CreateNewUserComponent = () => {
  const [{ officeId, from }] = useTypedSearchParams(
    ROUTES.V2.SETTINGS.USER.CREATE
  )
  const navigate = useNavigate()
  const { clear, setUserForm } = useUserFormState()
  useEffect(() => {
    clear()
    useEventFormData.getState().clear()
    setUserForm({ primaryOfficeId: officeId })
    navigate(
      ROUTES.V2.SETTINGS.USER.EDIT.buildPath(
        {
          userId: createTemporaryId(),
          pageId: 'user.details'
        },
        { from }
      ),
      { replace: true }
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
  const formConfig = getDeclaration(eventConfig)

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

  const title = isNewUser
    ? intl.formatMessage(messages.userFormTitle)
    : intl.formatMessage(sysAdminMessages.editUserDetailsTitle)

  if (userQuery.isLoading) {
    return (
      <Frame
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
        header={<FormHeader label={title} onClose={() => navigate(-1)} />}
      >
        <Container>
          <SpinnerWrapper>
            <Spinner id="user-form-loading-spinner" size={25} />
          </SpinnerWrapper>
        </Container>
      </Frame>
    )
  }

  const currentPageId = pageId || getDeclarationPages(eventConfig)[0].id

  const onPageChange = (nextPageId: string) =>
    navigate(
      ROUTES.V2.SETTINGS.USER.EDIT.buildPath(
        { pageId: nextPageId, userId: userId },
        searchParams
      )
    )

  const backAction = getFormBackAction({
    formPages: formConfig.pages,
    formData: formState as Record<string, FieldValue>,
    validatorContext: {},
    pageId: currentPageId,
    onNavigateToPage: onPageChange
  })

  return (
    <FormLayout
      backAction={backAction}
      onClose={handleClose}
      isUnauthorized={isUnauthorized}
      userId={userId}
      title={title}
    >
      <PagesComponent
        attachmentPath={`${FilePathPrefix.Users}/${userId}/`}
        hideBackToReview={true}
        eventConfig={eventConfig}
        formData={formState as Record<string, FieldValue>}
        formPages={formConfig.pages}
        pageId={currentPageId}
        setFormData={setUserForm}
        validatorContext={{}}
        onPageChange={onPageChange}
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
  const getUserForm = useUserFormState((s) => s.getUserForm)
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
  const [pendingPayload, setPendingPayload] =
    React.useState<UpdateUserInput | null>(null)

  const resetErrors = () => {
    setShowDuplicateMobileError(false)
    setDuplicatePhoneNumber('')
    setShowDuplicateEmailError(false)
    setDuplicateEmail('')
  }

  const submitUpdate = (payload: UpdateUserInput) => {
    updateUserMutation.mutate(payload, {
      onSuccess: (data) => {
        clear()
        showToast({
          message: notificationMessages.userFormUpdateSuccess,
          toastType: 'success',
          toastId: 'user-update-success'
        })
        navigate(ROUTES.V2.SETTINGS.USER.VIEW.buildPath({ userId: data.id }))
      },
      onError: handleMutationError
    })
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
  const formConfig = getDeclaration(eventConfig)

  const alreadyInitialized =
    useUserFormState.getState().userId === userId &&
    Object.keys(getUserForm()).length > 0

  if (
    !isNewUser &&
    !alreadyInitialized &&
    existingUserQuery.data?.type === TokenUserType.enum.user
  ) {
    const user = existingUserQuery.data
    setUserForm(
      {
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
      },
      userId
    )
  }

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

    showToast({
      message: notificationMessages.userFormFail,
      toastType: 'error',
      toastId: 'user-form-error'
    })
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

  if (existingUserQuery.isLoading || isSubmitting) {
    const title = isNewUser
      ? intl.formatMessage(messages.userFormTitle)
      : intl.formatMessage(sysAdminMessages.editUserDetailsTitle)

    const submittingText = isNewUser
      ? intl.formatMessage(messages.creatingNewUser)
      : intl.formatMessage(messages.updatingUser)

    return (
      <Frame
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
        header={<FormHeader label={title} onClose={() => navigate(-1)} />}
      >
        <Container>
          <SpinnerWrapper>
            <Spinner id="user-form-submitting-spinner" size={25} />
            {isSubmitting && <p>{submittingText}</p>}
          </SpinnerWrapper>
        </Container>
      </Frame>
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
        anchor={todayISO()}
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
                fullHonorificName: formState.fullHonorificName || undefined,
                device: formState.device || undefined,
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
                  showToast({
                    message: notificationMessages.userFormSuccess,
                    toastType: 'success',
                    toastId: 'user-create-success'
                  })
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
          <Button
            type="positive"
            size="large"
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
                fullHonorificName: formState.fullHonorificName || undefined,
                device: formState.device || undefined,
                role: formState.role!,
                primaryOfficeId: formState.primaryOfficeId as UUID,
                signature: formState.signature,
                name: {
                  firstname: formState!.name!.firstname,
                  surname: formState!.name!.surname
                },
                data
              }
              const officeChanged =
                targetUser?.type === TokenUserType.enum.user &&
                payload.primaryOfficeId !== targetUser.primaryOfficeId
              if (officeChanged) {
                setPendingPayload(payload)
              } else {
                submitUpdate(payload)
              }
            }}
          >
            <Check /> {intl.formatMessage(buttonMessages.confirm)}
          </Button>
        )}
      </ReviewComponent.Body>
      {pendingPayload && (
        <Dialog
          actions={[
            <Button
              key="cancel_office_change"
              id="cancel_office_change"
              size="medium"
              type="tertiary"
              onClick={() => {
                setPendingPayload(null)
              }}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Button>,
            <Button
              key="confirm_office_change"
              id="confirm_office_change"
              size="medium"
              type="negative"
              onClick={() => {
                submitUpdate(pendingPayload)
                setPendingPayload(null)
              }}
            >
              {intl.formatMessage(buttonMessages.confirm)}
            </Button>
          ]}
          isOpen={true}
          title={intl.formatMessage(messages.changeOfficeWarningTitle)}
          onClose={() => {
            setPendingPayload(null)
          }}
        >
          <Text color="grey500" element="p" variant="reg16">
            {intl.formatMessage(messages.changeOfficeWarningBody)}
          </Text>
        </Dialog>
      )}
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
  userId,
  backAction
}: {
  children: React.ReactNode
  onSaveAndExit?: () => void | Promise<void>
  onClose?: (options?: { replace?: boolean }) => void
  title: string
  actionComponent?: React.ReactNode
  isUnauthorized?: boolean
  userId?: string
  backAction?: () => void
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
          backAction={backAction}
          label={title}
          onSaveAndExit={onSaveAndExit}
          onClose={onClose ? () => onClose() : undefined}
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
        {children}
      </React.Suspense>
    </Frame>
  )
}

function FormHeader({
  label,
  onClose,
  backAction
}: {
  label: string
  onSaveAndExit?: () => void
  onClose?: () => void
  actionComponent?: React.ReactNode
  backAction?: () => void
}) {
  const intl = useIntl()

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

  const leftSlot = backAction ? (
    <Button
      aria-label={intl.formatMessage(buttonMessages.back)}
      data-testid="back-button"
      size="small"
      type="icon"
      onClick={backAction}
    >
      <Icon name="ArrowLeft" />
    </Button>
  ) : null

  return (
    <>
      <AppBar
        desktopLeft={leftSlot}
        desktopTitle={label}
        mobileLeft={leftSlot}
        mobileTitle={label}
        desktopRight={getHeaderRight()}
        mobileRight={getHeaderRight()}
      />
    </>
  )
}
