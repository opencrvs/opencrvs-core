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
import {
  filterProcessingDeclarationsFromQuery,
  IDeclaration,
  IWorkqueue,
  SUBMISSION_STATUS,
  updateRegistrarWorkqueue
} from '@client/declarations'
import { Header } from '@client/components/interface/Header/Header'
import { messages as certificateMessage } from '@client/i18n/messages/views/certificate'
import {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  getDefaultPerformanceLocationId
} from '@client/navigation'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { Scope } from '@client/utils/authUtils'
import { getUserLocation, IUserDetails } from '@client/utils/userUtils'
import NotificationToast from '@client/views/OfficeHome/NotificationToast'
import {
  FloatingActionButton,
  IButtonProps
} from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import {
  PAGE_TRANSITIONS_ENTER_TIME,
  FIELD_AGENT_ROLES,
  NATL_ADMIN_ROLES,
  SYS_ADMIN_ROLES,
  PERFORMANCE_MANAGEMENT_ROLES
} from '@client/utils/constants'
import {
  FloatingNotification,
  NOTIFICATION_TYPE,
  Spinner
} from '@opencrvs/components/lib/interface'
import { GQLEventSearchResultSet } from '@opencrvs/gateway/src/graphql/schema'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps, Redirect } from 'react-router'
import { SentForReview } from './sentForReview/SentForReview'
import { InProgress, SELECTOR_ID } from './inProgress/InProgress'
import { ReadyToPrint } from './readyToPrint/ReadyToPrint'
import { RequiresUpdate } from './requiresUpdate/RequiresUpdate'
import { ReadyForReview } from './readyForReview/ReadyForReview'
import { InExternalValidationTab } from './inExternalValidation/InExternalValidationTab'
import {
  Navigation,
  WORKQUEUE_TABS
} from '@client/components/interface/Navigation'
import { isDeclarationInReadyToReviewStatus } from '@client/utils/draftUtils'
import { PERFORMANCE_HOME } from '@client/navigation/routes'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'

export interface IProps extends IButtonProps {
  active?: boolean
  disabled?: boolean
  id: string
}
type IOwnProps = RouteComponentProps<{
  tabId: string
  selectorId?: string
}>
export interface IQueryData {
  inProgressTab: GQLEventSearchResultSet
  notificationTab: GQLEventSearchResultSet
  reviewTab: GQLEventSearchResultSet
  rejectTab: GQLEventSearchResultSet
  approvalTab: GQLEventSearchResultSet
  printTab: GQLEventSearchResultSet
  externalValidationTab: GQLEventSearchResultSet
}

export const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`
export const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`
const FABContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
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

interface IDispatchProps {
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToEvents: typeof goToEvents
  updateRegistrarWorkqueue: typeof updateRegistrarWorkqueue
}

interface IBaseOfficeHomeStateProps {
  language: string
  scope: Scope | null
  userLocationId: string
  tabId: string
  selectorId: string
  drafts: IDeclaration[]
  declarations: IDeclaration[]
  workqueue: IWorkqueue
  storedDeclarations: IDeclaration[]
  declarationsReadyToSend: IDeclaration[]
  userDetails: IUserDetails | null
}

type IOfficeHomeProps = IntlShapeProps &
  IDispatchProps &
  IBaseOfficeHomeStateProps

export const EVENT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  DECLARED: 'DECLARED',
  VALIDATED: 'VALIDATED',
  REGISTERED: 'REGISTERED',
  REJECTED: 'REJECTED',
  WAITING_VALIDATION: 'WAITING_VALIDATION'
}

export const OfficeHomeView = (props: IOfficeHomeProps) => {
  const pageSize = 10
  const showPaginated = false
  const interval: any = useRef(undefined)
  const role = props.userDetails && props.userDetails.role
  const { intl, updateRegistrarWorkqueue, userDetails } = props
  const isFieldAgent = role
    ? FIELD_AGENT_ROLES.includes(role)
      ? true
      : false
    : false
  const [draftCurrentPage, setDraftCurrentPage] = useState<number>(1)
  const [healthSystemCurrentPage, setHealthSystemCurrentPage] =
    useState<number>(1)
  const [progressCurrentPage, setProgressCurrentPage] = useState<number>(1)
  const [reviewCurrentPage, setReviewCurrentPage] = useState<number>(1)
  const [approvalCurrentPage, setApprovalCurrentPage] = useState<number>(1)
  const [printCurrentPage, setPrintCurrentPage] = useState<number>(1)
  const [viewPortWidth, setViewPortWidth] = useState<number>(window.innerWidth)
  const [requireUpdateCurrentPage, setRequireUpdateCurrentPage] =
    useState<number>(1)
  const [externalValidationCurrentPage, setExternalValidationCurrentPage] =
    useState<number>(1)
  const [showCertificateToast, setShowCertificateToast] = useState<boolean>(
    Boolean(
      props.declarations.filter(
        (item) => item.submissionStatus === SUBMISSION_STATUS.READY_TO_CERTIFY
      ).length
    )
  )

  const syncWorkqueue = useCallback(
    (
      healthSystemCurrentPage,
      progressCurrentPage,
      reviewCurrentPage,
      approvalCurrentPage,
      printCurrentPage,
      requireUpdateCurrentPage,
      externalValidationCurrentPage
    ) => {
      const updateWorkqueue = () => {
        updateRegistrarWorkqueue(
          userDetails?.practitionerId,
          pageSize,
          isFieldAgent,
          Math.max(progressCurrentPage - 1, 0) * pageSize,
          Math.max(healthSystemCurrentPage - 1, 0) * pageSize,
          Math.max(reviewCurrentPage - 1, 0) * pageSize,
          Math.max(requireUpdateCurrentPage - 1, 0) * pageSize,
          Math.max(approvalCurrentPage - 1, 0) * pageSize,
          Math.max(externalValidationCurrentPage - 1, 0) * pageSize,
          Math.max(printCurrentPage - 1, 0) * pageSize
        )
      }

      setTimeout(() => updateWorkqueue(), PAGE_TRANSITIONS_ENTER_TIME)

      interval.current = setInterval(() => {
        updateWorkqueue()
      }, 300000)
    },
    [updateRegistrarWorkqueue, userDetails, isFieldAgent, pageSize]
  )

  useEffect(() => {
    function recordWindowWidth() {
      setViewPortWidth(window.innerWidth)
    }

    window.addEventListener('resize', recordWindowWidth)

    return () => window.removeEventListener('resize', recordWindowWidth)
  }, [])

  useEffect(() => {
    syncWorkqueue(
      healthSystemCurrentPage,
      progressCurrentPage,
      reviewCurrentPage,
      approvalCurrentPage,
      printCurrentPage,
      requireUpdateCurrentPage,
      externalValidationCurrentPage
    )

    return () => {
      clearInterval(interval.current)
    }
  }, [
    draftCurrentPage,
    healthSystemCurrentPage,
    progressCurrentPage,
    reviewCurrentPage,
    approvalCurrentPage,
    printCurrentPage,
    requireUpdateCurrentPage,
    externalValidationCurrentPage,
    syncWorkqueue
  ])

  useEffect(() => {
    setDraftCurrentPage(1)
    setHealthSystemCurrentPage(1)
    setProgressCurrentPage(1)
    setReviewCurrentPage(1)
    setApprovalCurrentPage(1)
    setPrintCurrentPage(1)
    setRequireUpdateCurrentPage(1)
    setExternalValidationCurrentPage(1)
    syncWorkqueue(1, 1, 1, 1, 1, 1, 1)
  }, [props.tabId, syncWorkqueue])

  function onPageChange(newPageNumber: number) {
    switch (props.tabId) {
      case WORKQUEUE_TABS.inProgress:
        if (
          props.selectorId &&
          props.selectorId === SELECTOR_ID.fieldAgentDrafts
        ) {
          setProgressCurrentPage(newPageNumber)
        } else if (
          props.selectorId &&
          props.selectorId === SELECTOR_ID.hospitalDrafts
        ) {
          setHealthSystemCurrentPage(newPageNumber)
        } else {
          setDraftCurrentPage(newPageNumber)
        }
        break
      case WORKQUEUE_TABS.readyForReview:
        setReviewCurrentPage(newPageNumber)
        break
      case WORKQUEUE_TABS.requiresUpdate:
        setRequireUpdateCurrentPage(newPageNumber)
        break
      case WORKQUEUE_TABS.sentForApproval:
        setApprovalCurrentPage(newPageNumber)
        break
      case WORKQUEUE_TABS.readyToPrint:
        setPrintCurrentPage(newPageNumber)
        break
      case WORKQUEUE_TABS.externalValidation:
        setExternalValidationCurrentPage(newPageNumber)
        break
      case WORKQUEUE_TABS.sentForReview:
        setReviewCurrentPage(newPageNumber)
        break
      default:
        throw new Error(`Unknown tab id when changing page ${props.tabId}`)
    }
  }

  const getData = (
    draftCurrentPage: number,
    healthSystemCurrentPage: number,
    progressCurrentPage: number,
    reviewCurrentPage: number,
    approvalCurrentPage: number,
    printCurrentPage: number,
    externalValidationCurrentPage: number,
    requireUpdateCurrentPage: number
  ) => {
    const {
      workqueue,
      tabId,
      drafts,
      selectorId,
      storedDeclarations,
      declarationsReadyToSend
    } = props
    const { loading, error, data } = workqueue
    const filteredData = filterProcessingDeclarationsFromQuery(
      data,
      storedDeclarations
    )

    return (
      <>
        {role &&
          (NATL_ADMIN_ROLES.includes(role) ||
            PERFORMANCE_MANAGEMENT_ROLES.includes(role)) && (
            <Redirect to={PERFORMANCE_HOME} />
          )}
        {role && SYS_ADMIN_ROLES.includes(role) && (
          <Redirect
            to={{
              pathname: PERFORMANCE_HOME,
              search: `?locationId=${getDefaultPerformanceLocationId(
                props.userDetails as IUserDetails
              )}`
            }}
          />
        )}
        <Navigation loadWorkqueueStatuses={false} />
        <BodyContainer>
          {tabId === WORKQUEUE_TABS.inProgress && (
            <InProgress
              drafts={drafts}
              selectorId={selectorId}
              isFieldAgent={isFieldAgent}
              queryData={{
                inProgressData: filteredData.inProgressTab,
                notificationData: filteredData.notificationTab
              }}
              paginationId={{
                draftId: draftCurrentPage,
                fieldAgentId: progressCurrentPage,
                healthSystemId: healthSystemCurrentPage
              }}
              pageSize={pageSize}
              onPageChange={onPageChange}
              loading={loading}
              error={error}
              viewPortWidth={viewPortWidth}
            />
          )}
          {!isFieldAgent ? (
            <>
              {tabId === WORKQUEUE_TABS.readyForReview && (
                <ReadyForReview
                  queryData={{
                    data: filteredData.reviewTab
                  }}
                  paginationId={reviewCurrentPage}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  loading={loading}
                  error={error}
                  viewPortWidth={viewPortWidth}
                />
              )}
              {tabId === WORKQUEUE_TABS.requiresUpdate && (
                <RequiresUpdate
                  queryData={{
                    data: filteredData.rejectTab
                  }}
                  paginationId={requireUpdateCurrentPage}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  loading={loading}
                  error={error}
                  viewPortWidth={viewPortWidth}
                />
              )}

              {tabId === WORKQUEUE_TABS.externalValidation &&
                window.config.EXTERNAL_VALIDATION_WORKQUEUE && (
                  <InExternalValidationTab
                    queryData={{
                      data: filteredData.externalValidationTab
                    }}
                    paginationId={externalValidationCurrentPage}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                    loading={loading}
                    error={error}
                    viewPortWidth={viewPortWidth}
                  />
                )}
              {tabId === WORKQUEUE_TABS.sentForApproval && (
                <SentForReview
                  queryData={{
                    data: filteredData.approvalTab
                  }}
                  paginationId={approvalCurrentPage}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  loading={loading}
                  error={error}
                  viewPortWidth={viewPortWidth}
                />
              )}
              {tabId === WORKQUEUE_TABS.readyToPrint && (
                <ReadyToPrint
                  queryData={{
                    data: filteredData.printTab
                  }}
                  paginationId={printCurrentPage}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  loading={loading}
                  error={error}
                  viewPortWidth={viewPortWidth}
                />
              )}
            </>
          ) : (
            <>
              {tabId === WORKQUEUE_TABS.sentForReview && (
                <SentForReview
                  queryData={{
                    data: filteredData.reviewTab
                  }}
                  paginationId={reviewCurrentPage}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  loading={loading}
                  error={error}
                  viewPortWidth={viewPortWidth}
                />
              )}
              {tabId === WORKQUEUE_TABS.requiresUpdate && (
                <RequiresUpdate
                  queryData={{
                    data: filteredData.rejectTab
                  }}
                  paginationId={requireUpdateCurrentPage}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  loading={loading}
                  error={error}
                  viewPortWidth={viewPortWidth}
                />
              )}
            </>
          )}
        </BodyContainer>
      </>
    )
  }

  return (
    <>
      <Header title={intl.formatMessage(navigationMessages[props.tabId])} />
      {getData(
        draftCurrentPage,
        healthSystemCurrentPage,
        progressCurrentPage,
        reviewCurrentPage,
        approvalCurrentPage,
        printCurrentPage,
        externalValidationCurrentPage,
        requireUpdateCurrentPage
      )}

      <FABContainer>
        <FloatingActionButton
          id="new_event_declaration"
          onClick={props.goToEvents}
          icon={() => <PlusTransparentWhite />}
        />
      </FABContainer>
      <NotificationToast showPaginated={showPaginated} />

      {showCertificateToast && (
        <FloatingNotification
          id="print-cert-notification"
          type={NOTIFICATION_TYPE.SUCCESS}
          show={showCertificateToast}
          callback={() => setShowCertificateToast(false)}
        >
          {intl.formatMessage(certificateMessage.toastMessage)}
        </FloatingNotification>
      )}
    </>
  )
}

function mapStateToProps(
  state: IStoreState,
  props: RouteComponentProps<{
    tabId: string
    selectorId?: string
  }>
): IBaseOfficeHomeStateProps {
  const { match } = props
  const userDetails = getUserDetails(state)
  const userLocationId = (userDetails && getUserLocation(userDetails).id) || ''
  const scope = getScope(state)
  return {
    declarations: state.declarationsState.declarations,
    workqueue: state.workqueueState.workqueue,
    language: state.i18n.language,
    scope,
    userLocationId,
    tabId:
      (match && match.params && match.params.tabId) ||
      WORKQUEUE_TABS.inProgress,
    selectorId: (match && match.params && match.params.selectorId) || '',
    storedDeclarations: state.declarationsState.declarations,
    drafts:
      (
        state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            declaration.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        )
      ).reverse() || [],
    declarationsReadyToSend: (
      (state.declarationsState.declarations &&
        state.declarationsState.declarations.filter(
          (declaration: IDeclaration) =>
            isDeclarationInReadyToReviewStatus(declaration.submissionStatus)
        )) ||
      []
    ).reverse(),
    userDetails
  }
}
export const OfficeHome = connect<
  IBaseOfficeHomeStateProps,
  IDispatchProps,
  IOwnProps,
  IStoreState
>(mapStateToProps, {
  goToEvents,
  goToPage,
  goToPrintCertificate,
  updateRegistrarWorkqueue
})(injectIntl(OfficeHomeView))
