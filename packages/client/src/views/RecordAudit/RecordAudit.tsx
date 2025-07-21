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
import { Header } from '@client/components/Header/Header'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Navigation } from '@client/components/interface/Navigation'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import styled from 'styled-components'
import {
  DeclarationIcon,
  BackArrow,
  Duplicate
} from '@opencrvs/components/lib/icons'
import { connect, useDispatch } from 'react-redux'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { generateGoToHomeTabUrl } from '@client/navigation'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps,
  useIntl
} from 'react-intl'
import {
  archiveDeclaration,
  clearCorrectionAndPrintChanges,
  IDeclaration,
  SUBMISSION_STATUS,
  DOWNLOAD_STATUS,
  modifyDeclaration,
  deleteDeclaration
} from '@client/declarations'
import { IStoreState } from '@client/store'
import type { GQLEventSearchSet } from '@client/utils/gateway-deprecated-do-not-use'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Loader } from '@opencrvs/components/lib/Loader'
import { getScope } from '@client/profile/profileSelectors'
import {
  PrimaryButton,
  TertiaryButton,
  DangerButton,
  CircleButton
} from '@opencrvs/components/lib/buttons'
import { ARCHIVED } from '@client/utils/constants'
import { IQueryData } from '@client/workqueue'
import { Query } from '@client/components/Query'
import { FETCH_DECLARATION_SHORT_INFO } from '@client/views/RecordAudit/queries'
import { HOME } from '@client/navigation/routes'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { IForm } from '@client/forms'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { getLanguage } from '@client/i18n/selectors'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import {
  MarkEventAsReinstatedMutation,
  MarkEventAsReinstatedMutationVariables,
  EventType,
  History
} from '@client/utils/gateway'
import { get } from 'lodash'
import { IRegisterFormState } from '@client/forms/register/reducer'
import {
  IDeclarationData,
  getGQLDeclaration,
  getDraftDeclarationData,
  getWQDeclarationData
} from './utils'
import { GetDeclarationInfo } from './DeclarationInfo'
import { ShowDownloadButton } from './ActionButtons'
import { GetHistory } from './History'
import { ActionDetailsModal } from './ActionDetailsModal'
import { DuplicateWarning } from '@client/views/Duplicates/DuplicateWarning'
import { getPotentialDuplicateIds } from '@client/transformer/index'
import { Downloaded } from '@opencrvs/components/lib/icons/Downloaded'
import { Mutation } from '@apollo/client/react/components'
import {
  REINSTATE_BIRTH_DECLARATION,
  REINSTATE_DEATH_DECLARATION
} from './mutations'
import { useDeclaration } from '@client/declarations/selectors'
import { errorMessages } from '@client/i18n/messages/errors'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar, IAppBarProps } from '@opencrvs/components/lib/AppBar'

import { UserDetails } from '@client/utils/userUtils'
import { client } from '@client/utils/apolloClient'
import { usePermissions } from '@client/hooks/useAuthorization'
import { IReviewFormState } from '@client/forms/register/reviewReducer'
import { ActionMenu } from './ActionMenu'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'

const DesktopHeader = styled(Header)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const MobileHeader = styled(AppBar)`
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const BackButtonDiv = styled.div`
  display: inline;
`

const BackButton = styled(CircleButton)`
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  margin-left: -8px;
`

const StyledDuplicateWarning = styled(DuplicateWarning)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 16px 24px;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 16px 0;
  }
`

interface IStateProps {
  userDetails: UserDetails | null
  language: string
  resources: IOfflineData
  scope: Scope[]
  declarationId?: string
  draft: IDeclaration | null
  tab?: IRecordAuditTabs
  workqueueDeclaration: GQLEventSearchSet | null
  registerForm: IRegisterFormState
  offlineData: Partial<IOfflineData>
  reviewForm: IReviewFormState
}

interface IDispatchProps {
  archiveDeclaration: typeof archiveDeclaration
  clearCorrectionAndPrintChanges: typeof clearCorrectionAndPrintChanges
}

type IRecordAuditTabs = keyof IQueryData | 'search'

type RouteProps = RouteComponentProps<{
  tab?: IRecordAuditTabs
  declarationId?: string
}>

type ValidatedProps = Omit<IFullProps, 'declarationId' | 'tab'> & {
  declarationId: string
  tab: IRecordAuditTabs
}

type IFullProps = IDispatchProps & IStateProps & IntlShapeProps & RouteProps

export const STATUSTOCOLOR: { [key: string]: string } = {
  ARCHIVED: 'grey',
  DRAFT: 'purple',
  IN_PROGRESS: 'purple',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'grey',
  REGISTERED: 'green',
  CERTIFIED: 'teal',
  CORRECTION_REQUESTED: 'blue',
  WAITING_VALIDATION: 'teal',
  SUBMITTED: 'orange',
  SUBMITTING: 'orange',
  ISSUED: 'blue'
}

function ReinstateButton({
  toggleDisplayDialog,
  refetchDeclarationInfo
}: {
  toggleDisplayDialog: () => void
  refetchDeclarationInfo?: () => void
}) {
  const { declarationId } = useParams<{ declarationId: string }>()
  const intl = useIntl()
  const dispatch = useDispatch()
  const declaration = useDeclaration(declarationId)

  if (!declaration) {
    return <Navigate to={HOME} />
  }

  /* TODO: handle error */
  return (
    <Mutation<
      MarkEventAsReinstatedMutation,
      MarkEventAsReinstatedMutationVariables
    >
      mutation={
        declaration.event === EventType.Birth
          ? REINSTATE_BIRTH_DECLARATION
          : REINSTATE_DEATH_DECLARATION
      }
      // update the store and indexDb with the latest status of the declaration
      onCompleted={() => {
        refetchDeclarationInfo?.()
        dispatch(deleteDeclaration(declaration.id, client))
      }}
    >
      {(reinstateDeclaration) => (
        <PrimaryButton
          id="reinstate_confirm"
          key="reinstate_confirm"
          size="medium"
          onClick={() => {
            reinstateDeclaration({ variables: { id: declaration.id } })
            dispatch(
              modifyDeclaration({
                ...declaration,
                submissionStatus: SUBMISSION_STATUS.REINSTATING
              })
            )
            toggleDisplayDialog()
          }}
        >
          {intl.formatMessage(
            recordAuditMessages.reinstateDeclarationDialogConfirm
          )}
        </PrimaryButton>
      )}
    </Mutation>
  )
}

function RecordAuditBody({
  archiveDeclaration,
  declaration,
  draft,
  duplicates,
  intl,
  refetchDeclarationInfo,
  userDetails,
  registerForm,
  offlineData,
  reviewForm
}: {
  declaration: IDeclarationData
  draft: IDeclaration | null
  duplicates?: string[]
  intl: IntlShape
  scope: Scope[]
  userDetails: UserDetails | null
  registerForm: IRegisterFormState
  offlineData: Partial<IOfflineData>
  refetchDeclarationInfo?: () => void
  tab: IRecordAuditTabs
  reviewForm: IReviewFormState
} & IDispatchProps) {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = React.useState(false)
  const [showActionDetails, setActionDetails] = React.useState(false)
  const [actionDetailsIndex, setActionDetailsIndex] = React.useState(-1)

  const [actionDetailsData, setActionDetailsData] = React.useState<History>()

  const { hasScope } = usePermissions()

  if (!registerForm.registerForm || !declaration.type) return <></>

  const toggleActionDetails = (actionItem: History | null, itemIndex = -1) => {
    actionItem && setActionDetailsData(actionItem)
    setActionDetailsIndex(itemIndex)
    setActionDetails((prevValue) => !prevValue)
  }
  const toggleDisplayDialog = () => setShowDialog((prevValue) => !prevValue)

  const actions: React.ReactElement[] = []
  const mobileActions: React.ReactElement[] = []
  const desktopActionsView: React.ReactElement[] = []

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  actions.push(
    <ActionMenu
      declaration={declaration}
      duplicates={duplicates}
      draft={draft}
      toggleDisplayDialog={toggleDisplayDialog}
    />
  )
  desktopActionsView.push(actions[actions.length - 1])

  if (!isDownloaded) {
    actions.push(
      ShowDownloadButton({
        declaration,
        draft,
        userDetails
      })
    )
    desktopActionsView.push(actions[actions.length - 1])
  } else {
    if (draft?.submissionStatus === SUBMISSION_STATUS.DRAFT) {
      actions.push(<Downloaded />)
    } else {
      actions.push(
        ShowDownloadButton({
          declaration,
          draft,
          userDetails
        })
      )
    }
    desktopActionsView.push(actions[actions.length - 1])
  }

  let regForm: IForm
  const eventType = declaration.type
  if (eventType in registerForm.registerForm)
    regForm = get(registerForm.registerForm, eventType)
  else regForm = registerForm.registerForm[EventType.Birth]

  const actionDetailsModalProps = {
    show: showActionDetails,
    actionDetailsData,
    actionDetailsIndex,
    toggleActionDetails,
    intl,
    userDetails,
    registerForm: regForm,
    offlineData,
    draft,
    reviewForm
  }

  const mobileProps: IAppBarProps = {
    id: 'mobileHeader',
    mobileTitle:
      declaration.name || intl.formatMessage(recordAuditMessages.noName),
    mobileLeft: [
      <BackButtonDiv key="go-back">
        <BackButton onClick={() => navigate(-1)}>
          <BackArrow />
        </BackButton>
      </BackButtonDiv>
    ],
    mobileRight: desktopActionsView
  }

  const isValidatedOnReview =
    declaration.status === SUBMISSION_STATUS.VALIDATED &&
    hasScope(SCOPES.RECORD_REGISTER)

  const hasDuplicates = !!(
    duplicates &&
    duplicates.length > 0 &&
    declaration.status !== SUBMISSION_STATUS.CERTIFIED &&
    declaration.status !== SUBMISSION_STATUS.REGISTERED
  )

  return (
    <>
      <MobileHeader {...mobileProps} key={'record-audit-mobile-header'} />
      {hasDuplicates && (
        <StyledDuplicateWarning
          duplicateIds={duplicates?.filter(
            (duplicate): duplicate is string => !!duplicate
          )}
        />
      )}
      <Content
        title={
          declaration.name || intl.formatMessage(recordAuditMessages.noName)
        }
        titleColor={declaration.name ? 'copy' : 'grey600'}
        size={ContentSize.LARGE}
        topActionButtons={desktopActionsView}
        icon={() =>
          hasDuplicates ? (
            <Duplicate />
          ) : (
            <DeclarationIcon
              isArchive={declaration?.status === ARCHIVED}
              isValidatedOnReview={isValidatedOnReview}
              color={
                STATUSTOCOLOR[
                  (declaration && declaration.status) || SUBMISSION_STATUS.DRAFT
                ]
              }
            />
          )
        }
      >
        <GetDeclarationInfo
          declaration={declaration}
          isDownloaded={isDownloaded}
          intl={intl}
          actions={mobileActions}
        />
        <GetHistory
          declaration={declaration}
          intl={intl}
          draft={draft}
          userDetails={userDetails}
          toggleActionDetails={toggleActionDetails}
        />
      </Content>
      {actionDetailsModalProps.actionDetailsData && (
        <ActionDetailsModal
          {...actionDetailsModalProps}
          actionDetailsData={actionDetailsModalProps.actionDetailsData}
        />
      )}
      <ResponsiveModal
        title={
          declaration.status && ARCHIVED.includes(declaration.status)
            ? intl.formatMessage(
                recordAuditMessages.reinstateDeclarationDialogTitle
              )
            : intl.formatMessage(recordAuditMessages.confirmationTitle)
        }
        contentHeight={96}
        responsive={false}
        actions={[
          <TertiaryButton
            id="cancel-btn"
            key="cancel"
            onClick={toggleDisplayDialog}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </TertiaryButton>,
          declaration.status && ARCHIVED.includes(declaration.status) ? (
            <ReinstateButton
              toggleDisplayDialog={toggleDisplayDialog}
              refetchDeclarationInfo={refetchDeclarationInfo}
            />
          ) : (
            <DangerButton
              id="archive_confirm"
              key="archive_confirm"
              size={'medium'}
              onClick={() => {
                archiveDeclaration(declaration.id)
                toggleDisplayDialog()

                navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyForReview
                  })
                )
              }}
            >
              {intl.formatMessage(buttonMessages.archive)}
            </DangerButton>
          )
        ]}
        show={showDialog}
        handleClose={toggleDisplayDialog}
      >
        {declaration.status && ARCHIVED.includes(declaration.status)
          ? intl.formatMessage(
              recordAuditMessages.reinstateDeclarationDialogDescription
            )
          : intl.formatMessage(recordAuditMessages.confirmationBody)}
      </ResponsiveModal>
    </>
  )
}

const BodyContent = ({
  declarationId,
  draft,
  intl,
  language,
  scope,
  resources,
  tab,
  userDetails,
  workqueueDeclaration,
  ...actionProps
}: ValidatedProps) => {
  const [isErrorDismissed, setIsErrorDismissed] = React.useState(false)
  if (
    tab === 'search' ||
    (draft?.submissionStatus !== SUBMISSION_STATUS.DRAFT &&
      !workqueueDeclaration)
  ) {
    return (
      <>
        <Query
          query={FETCH_DECLARATION_SHORT_INFO}
          variables={{
            id: declarationId
          }}
          fetchPolicy="network-only"
        >
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return <Loader id="search_loader" marginPercent={35} />
            } else if (error) {
              return (
                (!isErrorDismissed && (
                  <Toast
                    type="warning"
                    actionText={intl.formatMessage(buttonMessages.retry)}
                    onActionClick={() => {
                      refetch()
                      setIsErrorDismissed(false)
                    }}
                    onClose={() => setIsErrorDismissed(true)}
                  >
                    {intl.formatMessage(errorMessages.pleaseTryAgainError)}
                  </Toast>
                )) ||
                null
              )
            }

            let declaration
            if (
              draft?.data?.registration?.trackingId &&
              draft?.downloadStatus !== DOWNLOAD_STATUS.DOWNLOADING
            ) {
              declaration = getDraftDeclarationData(
                draft,
                resources,
                intl,
                draft?.data?.registration?.trackingId?.toString()
              )
              declaration = {
                ...declaration,
                status: data.fetchRegistration?.registration?.status[0]
                  .type as SUBMISSION_STATUS,
                assignment: draft?.assignmentStatus
              }
            } else {
              declaration = getGQLDeclaration(data.fetchRegistration, intl)
              /* draft might not be in store for unassigned record,
              in that case use the one from the short declaration info query */
              declaration.assignment ??= draft?.assignmentStatus
            }

            return (
              <RecordAuditBody
                key={`record-audit-${declarationId}`}
                {...actionProps}
                declaration={declaration}
                tab={tab}
                draft={draft}
                duplicates={getPotentialDuplicateIds(data.fetchRegistration)}
                refetchDeclarationInfo={refetch}
                intl={intl}
                scope={scope}
                userDetails={userDetails}
              />
            )
          }}
        </Query>
      </>
    )
  } else {
    const trackingId =
      draft?.data?.registration?.trackingId?.toString() ||
      workqueueDeclaration?.registration?.trackingId ||
      ''
    let declaration =
      draft &&
      (draft.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
        draft.submissionStatus === SUBMISSION_STATUS.DRAFT)
        ? {
            ...getDraftDeclarationData(draft, resources, intl, trackingId),
            assignment: draft?.assignmentStatus
          }
        : getWQDeclarationData(
            workqueueDeclaration as NonNullable<typeof workqueueDeclaration>,
            intl,
            trackingId
          )
    const wqStatus = workqueueDeclaration?.registration
      ?.status as SUBMISSION_STATUS
    const draftStatus =
      draft?.submissionStatus?.toString() ||
      draft?.registrationStatus?.toString() ||
      SUBMISSION_STATUS.DRAFT

    declaration = {
      ...declaration,
      status: wqStatus || draftStatus
    }

    return (
      <RecordAuditBody
        key={`record-audit-${declarationId}`}
        {...actionProps}
        declaration={declaration}
        draft={draft}
        duplicates={getPotentialDuplicateIds(workqueueDeclaration)}
        tab={tab}
        intl={intl}
        scope={scope}
        userDetails={userDetails}
      />
    )
  }
}

const RecordAuditComp = (props: IFullProps) => {
  if (!props.declarationId || !props.tab) {
    return null
  }

  return (
    <Frame
      header={<DesktopHeader />}
      navigation={
        <Navigation deselectAllTabs={true} loadWorkqueueStatuses={false} />
      }
      skipToContentText={props.intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <BodyContent {...(props as ValidatedProps)} />
    </Frame>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { declarationId, tab } = props.router.match.params

  return {
    declarationId: props.router.match.params.declarationId,
    draft:
      state.declarationsState.declarations.find(
        (declaration) => declaration.id === declarationId
      ) || null,
    language: getLanguage(state),
    resources: getOfflineData(state),
    scope: getScope(state)!,
    tab: tab as IRecordAuditTabs,
    userDetails: state.profile.userDetails,
    registerForm: state.registerForm,
    offlineData: state.offline.offlineData,
    workqueueDeclaration:
      // @TODO: when taking typed routes into use, parse parameters and correct types
      (tab !== 'search' &&
        // @ts-ignore
        state.workqueueState.workqueue.data[tab]?.results?.find(
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          (gqlSearchSet: any) => gqlSearchSet?.id === declarationId
        )) ||
      null,
    reviewForm: state.reviewForm
  }
}

export const RecordAudit = withRouter(
  connect<IStateProps, IDispatchProps, RouteProps, IStoreState>(
    mapStateToProps,
    {
      archiveDeclaration,
      clearCorrectionAndPrintChanges
    }
  )(injectIntl(RecordAuditComp))
)
