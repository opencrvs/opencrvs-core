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
import { Header } from '@client/components/interface/Header/Header'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import styled from '@client/styledComponents'
import {
  RotateLeft,
  Archive,
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
  goToTeamUserList
} from '@client/navigation'
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps,
  useIntl
} from 'react-intl'
import {
  archiveDeclaration,
  clearCorrectionChange,
  IDeclaration,
  SUBMISSION_STATUS,
  DOWNLOAD_STATUS,
  modifyDeclaration
} from '@client/declarations'
import { IStoreState } from '@client/store'
import { GQLEventSearchSet } from '@opencrvs/gateway/src/graphql/schema'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  ResponsiveModal,
  Loader,
  PageHeader,
  IPageHeaderProps
} from '@opencrvs/components/lib/interface'
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
  FIELD_AGENT_ROLES
} from '@client/utils/constants'
import { IQueryData } from '@client/views/OfficeHome/OfficeHome'
import { Query } from '@client/components/Query'
import { FETCH_DECLARATION_SHORT_INFO } from '@client/views/RecordAudit/queries'
import { HOME } from '@client/navigation/routes'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { CorrectionSection, IForm } from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
import { getLanguage } from '@client/i18n/selectors'
import { IUserDetails } from '@client/utils/userUtils'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'
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
  ShowPrintButton
} from './ActionButtons'
import { IActionDetailsData, GetHistory } from './History'
import { ActionDetailsModal } from './ActionDetailsModal'
import { DuplicateWarning } from '@client/views/Duplicates/DuplicateWarning'
import { getPotentialDuplicateIds } from '@client/transformer/index'
import { Uploaded } from '@opencrvs/components/lib/icons/Uploaded'
import { Mutation } from 'react-apollo'
import {
  MarkEventAsReinstatedMutation,
  MarkEventAsReinstatedMutationVariables,
  Event
} from '@client/utils/gateway'
import {
  REINSTATE_BIRTH_DECLARATION,
  REINSTATE_DEATH_DECLARATION
} from './mutations'
import { selectDeclaration } from '@client/declarations/selectors'
import { OperationVariables } from 'apollo-client'

const DesktopHeader = styled(Header)`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const MobileHeader = styled(PageHeader)`
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const BodyContainer = styled.div`
  margin-left: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 250px;
    padding: 0px 24px;
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
  userDetails: IUserDetails | null
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
  clearCorrectionChange: typeof clearCorrectionChange
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
  CERTIFIED: 'blue',
  WAITING_VALIDATION: 'teal',
  SUBMITTED: 'orange',
  SUBMITTING: 'orange'
}

const ARCHIVABLE_STATUSES = [DECLARED, VALIDATED, REJECTED]

function ReinstateButton({
  toggleDisplayDialog,
  refetch
}: {
  toggleDisplayDialog: () => void
  refetch: ((variables?: OperationVariables) => void) | undefined
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
        if (refetch) {
          refetch({ id: declaration.id })
        }
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
  clearCorrectionChange,
  declaration,
  draft,
  duplicates,
  intl,
  goToCertificateCorrection,
  goToPrintCertificate,
  goToPage,
  goToHomeTab,
  scope,
  userDetails,
  registerForm,
  refetch,
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
  userDetails: IUserDetails | null
  registerForm: IRegisterFormState
  offlineData: Partial<IOfflineData>
  tab: IRecordAuditTabs
  refetch?: (variables?: OperationVariables) => void
} & IDispatchProps) {
  const [showDialog, setShowDialog] = React.useState(false)
  const [showActionDetails, setActionDetails] = React.useState(false)
  const [actionDetailsData, setActionDetailsData] = React.useState({})

  if (!registerForm.registerForm || !declaration.type) return <></>

  const toggleActionDetails = (actionItem: IActionDetailsData | null) => {
    actionItem && setActionDetailsData(actionItem)
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
    userHasRegisterScope &&
    (declaration.status === SUBMISSION_STATUS.REGISTERED ||
      declaration.status === SUBMISSION_STATUS.CERTIFIED)
  ) {
    actions.push(
      <StyledTertiaryButton
        id="btn-correct-record"
        align={ICON_ALIGNMENT.LEFT}
        icon={() => <Edit />}
        onClick={() => {
          clearCorrectionChange(declaration.id)
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
      <StyledTertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        id="archive_button"
        key="archive_button"
        icon={() => <Archive />}
        onClick={toggleDisplayDialog}
      >
        {intl.formatMessage(buttonMessages.archive)}
      </StyledTertiaryButton>
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
      <StyledTertiaryButton
        align={ICON_ALIGNMENT.LEFT}
        id="reinstate_button"
        key="reinstate_button"
        icon={() => <RotateLeft />}
        onClick={toggleDisplayDialog}
      >
        {intl.formatMessage(buttonMessages.reinstate)}
      </StyledTertiaryButton>
    )
    desktopActionsView.push(actions[actions.length - 1])
  }

  if (
    (declaration.status === SUBMISSION_STATUS.DECLARED ||
      declaration.status === SUBMISSION_STATUS.VALIDATED) &&
    userDetails?.role &&
    !FIELD_AGENT_ROLES.includes(userDetails.role)
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
      userDetails?.role &&
      !FIELD_AGENT_ROLES.includes(userDetails.role))
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
    declaration.status === SUBMISSION_STATUS.CERTIFIED
  ) {
    actions.push(
      ShowPrintButton({
        declaration,
        intl,
        userDetails,
        draft,
        goToPrintCertificate,
        goToTeamUserList
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
      actions.push(<Uploaded />)
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
    toggleActionDetails,
    intl,
    goToUser: goToUserProfile,
    registerForm: regForm,
    offlineData
  }

  const mobileProps: IPageHeaderProps = {
    id: 'mobileHeader',
    mobileTitle:
      declaration.name || intl.formatMessage(recordAuditMessages.noName),
    mobileLeft: [
      <BackButtonDiv>
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

  const hasDuplicates = !!(duplicates && duplicates.length > 0)

  return (
    <>
      <MobileHeader {...mobileProps} key={'record-audit-mobile-header'} />
      <StyledDuplicateWarning
        duplicateIds={duplicates?.filter(
          (duplicate): duplicate is string => !!duplicate
        )}
      />
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
              refetch={refetch}
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

function getBodyContent({
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
}: IFullProps) {
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
          fetchPolicy="cache-and-network"
        >
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return <Loader id="search_loader" marginPercent={35} />
            } else if (error) {
              return <Redirect to={HOME} />
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
                status: data.fetchRegistration?.registration?.status[0].type
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
                intl={intl}
                scope={scope}
                refetch={refetch}
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
      draft && draft.downloadStatus !== DOWNLOAD_STATUS.DOWNLOADING
        ? getDraftDeclarationData(draft, resources, intl, trackingId)
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
    <>
      <DesktopHeader />
      <Navigation deselectAllTabs={true} />
      <BodyContainer>{getBodyContent(props)}</BodyContainer>
      <NotificationToast />
    </>
  )
}

function mapStateToProps(state: IStoreState, props: RouteProps): IStateProps {
  const { declarationId, tab } = props.match.params
  return {
    declarationId,
    draft:
      state.declarationsState.declarations.find(
        (declaration) =>
          declaration.id === declarationId ||
          declaration.compositionId === declarationId
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
  clearCorrectionChange,
  goToCertificateCorrection,
  goToPage,
  goToPrintCertificate,
  goToHomeTab,
  goToUserProfile,
  goToTeamUserList,
  goBack
})(injectIntl(RecordAuditComp))
