/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import React from 'react'
import { Header } from '@client/components/Header/Header'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import styled from 'styled-components'
import {
  DeclarationIcon,
  Edit,
  BackArrow,
  Duplicate
} from '@opencrvs/components/lib/icons'
import { connect, useDispatch, useSelector } from 'react-redux'
import { RouteComponentProps, Redirect, useParams } from 'react-router'
import {
  goToHomeTab,
  goToPage,
  goToCertificateCorrection,
  goToPrintCertificate,
  goToUserProfile,
  goToTeamUserList,
  goToViewRecordPage,
  goToIssueCertificate
} from '@client/navigation'
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
  modifyDeclaration
} from '@client/declarations'
import { IStoreState } from '@client/store'
import { GQLEventSearchSet } from '@opencrvs/gateway/src/graphql/schema'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { Toast } from '@opencrvs/components/lib/Toast'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Loader } from '@opencrvs/components/lib/Loader'
import { getScope } from '@client/profile/profileSelectors'
import { Scope, hasRegisterScope } from '@client/utils/authUtils'
import {
  PrimaryButton,
  TertiaryButton,
  ICON_ALIGNMENT,
  DangerButton,
  CircleButton
} from '@opencrvs/components/lib/buttons'
import {
  ARCHIVED,
  DECLARED,
  VALIDATED,
  REJECTED,
  FIELD_AGENT_ROLES,
  IN_PROGRESS
} from '@client/utils/constants'
import { IQueryData } from '@client/workqueue'
import { Query } from '@client/components/Query'
import { FETCH_DECLARATION_SHORT_INFO } from '@client/views/RecordAudit/queries'
import { HOME } from '@client/navigation/routes'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { CorrectionSection, IForm } from '@client/forms'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { getLanguage } from '@client/i18n/selectors'
import {
  MarkEventAsReinstatedMutation,
  MarkEventAsReinstatedMutationVariables,
  Event,
  History
} from '@client/utils/gateway'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { get } from 'lodash'
import { IRegisterFormState } from '@client/forms/register/reducer'
import { goBack } from 'connected-react-router'
import {
  IDeclarationData,
  getGQLDeclaration,
  getDraftDeclarationData,
  getWQDeclarationData
} from './utils'
import { GetDeclarationInfo } from './DeclarationInfo'
import {
  ShowDownloadButton,
  ShowReviewButton,
  ShowUpdateButton,
  ShowPrintButton,
  ShowIssueButton
} from './ActionButtons'
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
import { selectDeclaration } from '@client/declarations/selectors'
import { errorMessages } from '@client/i18n/messages/errors'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar, IAppBarProps } from '@opencrvs/components/lib/AppBar'
import { useOnlineStatus } from '@client/utils'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'

import { UserDetails } from '@client/utils/userUtils'

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

const StyledTertiaryButton = styled(TertiaryButton)`
  align-self: center;
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

const DesktopDiv = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: none;
  }
`

interface IStateProps {
  userDetails: UserDetails | null
  language: string
  resources: IOfflineData
  scope: Scope | null
  declarationId: string
  draft: IDeclaration | null
  tab: IRecordAuditTabs
  workqueueDeclaration: GQLEventSearchSet | null
  registerForm: IRegisterFormState
  offlineData: Partial<IOfflineData>
}

interface IDispatchProps {
  archiveDeclaration: typeof archiveDeclaration
  clearCorrectionAndPrintChanges: typeof clearCorrectionAndPrintChanges
  goToCertificateCorrection: typeof goToCertificateCorrection
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToHomeTab: typeof goToHomeTab
  goToUserProfile: typeof goToUserProfile
  goToTeamUserList: typeof goToTeamUserList
  goBack: typeof goBack
}

export type IRecordAuditTabs = keyof IQueryData | 'search'

type RouteProps = RouteComponentProps<{
  tab: IRecordAuditTabs
  declarationId: string
}>

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
  WAITING_VALIDATION: 'teal',
  SUBMITTED: 'orange',
  SUBMITTING: 'orange',
  ISSUED: 'blue'
}

const ARCHIVABLE_STATUSES = [IN_PROGRESS, DECLARED, VALIDATED, REJECTED]

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
  const declaration = useSelector((store: IStoreState) =>
    selectDeclaration(store, declarationId)
  )

  if (!declaration) {
    return <Redirect to={HOME} />
  }

  /* TODO: handle error */
  return (
    <Mutation<
      MarkEventAsReinstatedMutation,
      MarkEventAsReinstatedMutationVariables
    >
      mutation={
        declaration.event === Event.Birth
          ? REINSTATE_BIRTH_DECLARATION
          : REINSTATE_DEATH_DECLARATION
      }
      onCompleted={() => {
        refetchDeclarationInfo?.()
        dispatch(
          modifyDeclaration({
            ...declaration,
            submissionStatus: ''
          })
        )
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
  clearCorrectionAndPrintChanges,
  declaration,
  draft,
  duplicates,
  intl,
  goToCertificateCorrection,
  goToPrintCertificate,
  goToPage,
  goToHomeTab,
  scope,
  refetchDeclarationInfo,
  userDetails,
  registerForm,
  goToUserProfile,
  goToTeamUserList,
  goBack,
  offlineData
}: {
  declaration: IDeclarationData
  draft: IDeclaration | null
  duplicates?: string[]
  intl: IntlShape
  scope: Scope | null
  userDetails: UserDetails | null
  registerForm: IRegisterFormState
  offlineData: Partial<IOfflineData>
  refetchDeclarationInfo?: () => void
  tab: IRecordAuditTabs
} & IDispatchProps) {
  const [showDialog, setShowDialog] = React.useState(false)
  const [showActionDetails, setActionDetails] = React.useState(false)
  const [actionDetailsIndex, setActionDetailsIndex] = React.useState(-1)
  const [actionDetailsData, setActionDetailsData] = React.useState({})
  const isOnline = useOnlineStatus()
  const dispatch = useDispatch()

  if (!registerForm.registerForm || !declaration.type) return <></>

  const toggleActionDetails = (actionItem: History | null, itemIndex = -1) => {
    actionItem && setActionDetailsData(actionItem)
    setActionDetailsIndex(itemIndex)
    setActionDetails((prevValue) => !prevValue)
  }
  const toggleDisplayDialog = () => setShowDialog((prevValue) => !prevValue)

  const userHasRegisterScope = scope && scope.includes('register')
  const userHasValidateScope = scope && scope.includes('validate')

  const actions: React.ReactElement[] = []
  const mobileActions: React.ReactElement[] = []
  const desktopActionsView: React.ReactElement[] = []

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  if (
    isDownloaded &&
    declaration.type !== Event.Marriage &&
    userHasRegisterScope &&
    (declaration.status === SUBMISSION_STATUS.REGISTERED ||
      declaration.status === SUBMISSION_STATUS.ISSUED)
  ) {
    actions.push(
      <StyledTertiaryButton
        key="btn-correct-record"
        id="btn-correct-record"
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <Edit />}
        onClick={() => {
          clearCorrectionAndPrintChanges(declaration.id)
          goToCertificateCorrection(declaration.id, CorrectionSection.Corrector)
        }}
      >
        {intl.formatMessage(correctionMessages.title)}
      </StyledTertiaryButton>
    )
    desktopActionsView.push(actions[actions.length - 1])
  }

  if (
    isDownloaded &&
    declaration.status &&
    ARCHIVABLE_STATUSES.includes(declaration.status) &&
    (userHasRegisterScope ||
      (userHasValidateScope && declaration.status !== VALIDATED))
  ) {
    actions.push(
      <Button
        id="archive_button"
        type="tertiary"
        key="archive_button"
        disabled={!isOnline}
        onClick={toggleDisplayDialog}
      >
        <Icon name="Archive" color="currentColor" size="large" />{' '}
        {intl.formatMessage(buttonMessages.archive)}
      </Button>
    )
    desktopActionsView.push(actions[actions.length - 1])
  }

  if (
    isDownloaded &&
    (userHasValidateScope || userHasRegisterScope) &&
    declaration.status &&
    ARCHIVED.includes(declaration.status)
  ) {
    actions.push(
      <Button
        id="reinstate_button"
        type="tertiary"
        key="reinstate_button"
        disabled={!isOnline}
        onClick={toggleDisplayDialog}
      >
        <Icon name="ArchiveTray" color="currentColor" size="large" />
        {intl.formatMessage(buttonMessages.reinstate)}
      </Button>
    )
    desktopActionsView.push(actions[actions.length - 1])
  }

  if (
    declaration.status !== SUBMISSION_STATUS.DRAFT &&
    (userHasRegisterScope || userHasValidateScope)
  ) {
    actions.push(
      <Button
        type="secondary"
        onClick={() => {
          dispatch(goToViewRecordPage(declaration.id as string))
        }}
      >
        <Icon name="Eye" color="currentColor" size="large" />
        {intl.formatMessage(buttonMessages.view)}
      </Button>
    )
    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }

  if (
    (declaration.status === SUBMISSION_STATUS.DECLARED ||
      declaration.status === SUBMISSION_STATUS.VALIDATED) &&
    userDetails?.systemRole &&
    !FIELD_AGENT_ROLES.includes(userDetails.systemRole)
  ) {
    actions.push(
      ShowReviewButton({
        declaration,
        intl,
        userDetails,
        draft,
        goToPage
      })
    )

    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }
  if (
    declaration.status === SUBMISSION_STATUS.DRAFT ||
    ((declaration.status === SUBMISSION_STATUS.IN_PROGRESS ||
      declaration.status === SUBMISSION_STATUS.REJECTED) &&
      userDetails?.systemRole &&
      !FIELD_AGENT_ROLES.includes(userDetails.systemRole))
  ) {
    actions.push(
      ShowUpdateButton({
        declaration,
        intl,
        userDetails,
        draft,
        goToPage
      })
    )
    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }

  if (
    declaration.status === SUBMISSION_STATUS.REGISTERED ||
    declaration.status === SUBMISSION_STATUS.ISSUED
  ) {
    actions.push(
      ShowPrintButton({
        declaration,
        intl,
        userDetails,
        draft,
        goToPrintCertificate,
        goToTeamUserList,
        clearCorrectionAndPrintChanges
      })
    )
    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }
  if (declaration.status === SUBMISSION_STATUS.CERTIFIED) {
    actions.push(
      ShowIssueButton({
        declaration,
        intl,
        userDetails,
        draft,
        goToIssueCertificate
      })
    )
    mobileActions.push(actions[actions.length - 1])
    desktopActionsView.push(
      <DesktopDiv key={actions.length}>
        {actions[actions.length - 1]}
      </DesktopDiv>
    )
  }

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
  else regForm = registerForm.registerForm['birth']

  const actionDetailsModalProps = {
    show: showActionDetails,
    actionDetailsData,
    actionDetailsIndex,
    toggleActionDetails,
    intl,
    userDetails,
    goToUser: goToUserProfile,
    registerForm: regForm,
    offlineData,
    draft
  }

  const mobileProps: IAppBarProps = {
    id: 'mobileHeader',
    mobileTitle:
      declaration.name || intl.formatMessage(recordAuditMessages.noName),
    mobileLeft: [
      <BackButtonDiv key="go-back">
        <BackButton onClick={() => goBack()}>
          <BackArrow />
        </BackButton>
      </BackButtonDiv>
    ],
    mobileRight: desktopActionsView
  }

  const isValidatedOnReview =
    declaration.status === SUBMISSION_STATUS.VALIDATED &&
    hasRegisterScope(scope)
      ? true
      : false

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
          goToUserProfile={goToUserProfile}
          goToTeamUserList={goToTeamUserList}
          toggleActionDetails={toggleActionDetails}
        />
      </Content>
      <ActionDetailsModal {...actionDetailsModalProps} />
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
                goToHomeTab(WORKQUEUE_TABS.readyForReview)
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
  goBack,
  ...actionProps
}: IFullProps) => {
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
          fetchPolicy="no-cache"
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
                status: data.fetchRegistration?.registration?.status[0].type,
                assignment: data.fetchRegistration?.registration?.assignment
              }
            } else {
              declaration = getGQLDeclaration(data.fetchRegistration, language)
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
                goBack={goBack}
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
            assignment: workqueueDeclaration?.registration?.assignment
          }
        : getWQDeclarationData(
            workqueueDeclaration as NonNullable<typeof workqueueDeclaration>,
            language,
            trackingId
          )
    const wqStatus = workqueueDeclaration?.registration?.status
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
        goBack={goBack}
      />
    )
  }
}

const RecordAuditComp = (props: IFullProps) => {
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
      <BodyContent {...props} />
    </Frame>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { declarationId, tab } = props.match.params
  return {
    declarationId,
    draft:
      state.declarationsState.declarations.find(
        (declaration) => declaration.id === declarationId
      ) || null,
    language: getLanguage(state),
    resources: getOfflineData(state),
    scope: getScope(state),
    tab,
    userDetails: state.profile.userDetails,
    registerForm: state.registerForm,
    offlineData: state.offline.offlineData,
    workqueueDeclaration:
      (tab !== 'search' &&
        state.workqueueState.workqueue.data[tab]?.results?.find(
          (gqlSearchSet) => gqlSearchSet?.id === declarationId
        )) ||
      null
  }
}

export const RecordAudit = connect<
  IStateProps,
  IDispatchProps,
  RouteProps,
  IStoreState
>(mapStateToProps, {
  archiveDeclaration,
  clearCorrectionAndPrintChanges,
  goToCertificateCorrection,
  goToPage,
  goToPrintCertificate,
  goToHomeTab,
  goToUserProfile,
  goToTeamUserList,
  goBack
})(injectIntl(RecordAuditComp))
