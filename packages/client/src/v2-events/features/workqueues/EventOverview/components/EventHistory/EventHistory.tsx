/* eslint-disable max-lines */
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
import format from 'date-fns/format'
import styled, { useTheme } from 'styled-components'
import { defineMessages, useIntl, IntlShape } from 'react-intl'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { Link, Pagination } from '@opencrvs/components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Table } from '@opencrvs/components/lib/Table'
import {
  Action,
  ActionDocument,
  ActionStatus,
  ActionType,
  ActionUpdate,
  deepMerge,
  isActionConfigType,
  EventDocument,
  getActionConfig,
  isSelectableAtAnchor,
  TokenUserType,
  todayISO,
  toPlainDate
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { ROUTES } from '@client/v2-events/routes'
import { useModal } from '@client/v2-events/hooks/useModal'
import * as routes from '@client/navigation/routes'
import { useEventOverviewContext } from '@client/v2-events/features/workqueues/EventOverview/EventOverviewContext'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import {
  useActionForHistory,
  extractHistoryActions,
  findImmediateApproveCorrection
} from '@client/v2-events/features/events/actions/correct/useActionForHistory'
import { usePermissions } from '@client/hooks/useAuthorization'
import { useValidatorContext } from '@client/v2-events/hooks/useValidatorContext'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useUserDetails } from '@client/v2-events/hooks/useUserDetails'
import { resolveLocationName } from '@client/v2-events/utils'
import { getOfflineData } from '@client/offline/selectors'
import { messages as dateFieldMessages } from '@client/v2-events/features/events/registered-fields/DateField'
import { useEventOverviewInfo } from '../useEventOverviewInfo'
import { EventHistoryDialog } from './EventHistoryDialog/EventHistoryDialog'

const eventHistoryStatusMessage = {
  id: 'events.history.status',
  defaultMessage:
    '{status, select, Rejected {{action, select, REGISTER {Registration failed} other {Rejected}}} other {{action, select, CREATE {Draft} NOTIFY {Notified} EDIT {Edited} VALIDATE {Validated} DRAFT {Draft} DECLARE {Declared} REGISTER {Registered} PRINT_CERTIFICATE {Certified} REJECT {Rejected} ARCHIVE {Archived} UNARCHIVE {Unarchived} DUPLICATE_DETECTED {Flagged as potential duplicate} MARK_AS_DUPLICATE {Marked as a duplicate} CORRECTED {Record corrected} REQUEST_CORRECTION {Correction requested} APPROVE_CORRECTION {Correction approved} REJECT_CORRECTION {Correction rejected} READ {Viewed} ASSIGN {Assigned} UNASSIGN {Unassigned} other {Unknown}}}}'
}

const LargeGreyedInfo = styled.div`
  height: 231px;
  background-color: ${({ theme }) => theme.colors.grey200};
  max-width: 100%;
  border-radius: 4px;
`

const TableDiv = styled.div`
  overflow: auto;
`

const LinkLeftAligned = styled(Link)`
  text-align: left;
`

const ExpandToggle = styled.button`
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.grey500};
`

const ConfirmationDetailLabel = styled.div`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.grey500};
`

/**
 * The action whose confirmation status the row reflects: normally itself, but
 * for a direct correction ("Record corrected") the paired APPROVE_CORRECTION.
 */
function getStatusSourceAction(
  action: ActionDocument,
  allActions: ActionDocument[]
): ActionDocument {
  if (action.type === ActionType.REQUEST_CORRECTION) {
    return findImmediateApproveCorrection(allActions, action) ?? action
  }
  return action
}

/**
 * The status of an action's confirmation (accept/reject via `originalActionId`)
 * when one exists, otherwise its own status. `Requested` with none = waiting.
 */
function getEffectiveStatus(
  action: ActionDocument,
  allActions: Action[]
): ActionStatus {
  const confirmation = allActions.find((a) => a.originalActionId === action.id)
  return confirmation ? confirmation.status : action.status
}

/**
 * The accept/reject action that confirmed this action *asynchronously* — a
 * separate confirmation (different transactionId) added after the fact, as an
 * external system does. Returns undefined for directly (synchronously) accepted
 * actions, which have no separate confirmation.
 */
function getAsyncConfirmation(
  action: ActionDocument,
  allActions: Action[]
): ActionDocument | undefined {
  const confirmation = allActions.find(
    (a) =>
      a.originalActionId === action.id &&
      (a.status === ActionStatus.Accepted || a.status === ActionStatus.Rejected)
  )
  if (confirmation && confirmation.transactionId !== action.transactionId) {
    return confirmation as ActionDocument
  }
  return undefined
}

const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10

const messages = defineMessages({
  timeOnlyFormat: {
    defaultMessage: 'hh.mm a',
    id: 'configuration.timeOnlyFormat',
    description: 'Time format for the time line of the "When" column'
  },
  when: {
    defaultMessage: 'When',
    description: 'Header for the column showing when an action happened',
    id: 'events.history.when'
  },
  system: {
    id: 'event.history.system',
    defaultMessage: 'System',
    description: 'Name for system initiated actions in the event history'
  },
  action: {
    defaultMessage: 'Action',
    description: 'Action Label',
    id: 'constants.label.action'
  },
  by: {
    defaultMessage: 'By',
    description: 'Label for By (the person who performed the action)',
    id: 'constants.by'
  },
  audit: {
    defaultMessage: 'Audit',
    description: 'Audit heading',
    id: 'constants.audit'
  },
  statusAccepted: {
    defaultMessage: 'Accepted',
    description: 'Status badge shown on an action that has been confirmed',
    id: 'events.history.status.accepted'
  },
  statusRejected: {
    defaultMessage: 'Rejected',
    description: 'Status badge shown on an action that was rejected',
    id: 'events.history.status.rejected'
  },
  statusRequested: {
    defaultMessage: 'Requested',
    description:
      'Label for the requested action shown in the expanded audit dropdown',
    id: 'events.history.status.requested'
  },
  toggleConfirmationDetails: {
    defaultMessage: 'Show validation details',
    description:
      'Accessible label for the toggle that expands a row to show who accepted or rejected the action and when',
    id: 'events.history.toggleConfirmationDetails'
  },
  location: {
    defaultMessage: 'Location',
    description: 'Label for location',
    id: 'constants.location'
  }
})

function StatusBadge({
  status,
  size = 'medium'
}: {
  status: ActionStatus
  size?: 'small' | 'medium' | 'large'
}) {
  if (status === ActionStatus.Rejected) {
    return <Icon color="red" name="XCircle" size={size} />
  }

  if (status === ActionStatus.Requested) {
    return <Icon color="orange" name="PauseCircle" size={size} />
  }

  return <Icon color="green" name="CheckCircle" size={size} />
}

const StatusCell = styled.span`
  display: flex;
  align-items: center;
  padding-left: 6px;
`

function getStatusLabel(status: ActionStatus, intl: IntlShape): string {
  if (status === ActionStatus.Rejected) {
    return intl.formatMessage(messages.statusRejected)
  }

  if (status === ActionStatus.Requested) {
    return intl.formatMessage(messages.statusRequested)
  }

  return intl.formatMessage(messages.statusAccepted)
}

const BoldLine = styled.div`
  ${({ theme }) => theme.fonts.bold14};
`

const DetailActionCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const SecondaryLine = styled.div`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.grey500};
`

function ActionLocation({
  action,
  muted
}: {
  action: ActionDocument
  muted?: boolean
}) {
  const { findUser, getLocation } = useEventOverviewContext()
  const { canAccessOffice } = usePermissions()
  const navigate = useNavigate()
  const { getUserDetails } = useUserDetails()

  const user = findUser(action.createdBy)
  // Each history entry's office is resolved at that action's own date, so it
  // shows where the action actually happened under its then-current name.
  const location = action.createdAtLocation
    ? getLocation(action.createdAtLocation)
    : undefined
  const locationName = location
    ? resolveLocationName(location, toPlainDate(action.createdAt))
    : undefined

  const isOfficeActiveToday =
    !!location && isSelectableAtAnchor(location.versions, todayISO())

  const hasAccessToOffice =
    !!user &&
    canAccessOffice({
      id: user.primaryOfficeId
    })

  const { type } = getUserDetails({
    createdByUserType: action.createdByUserType,
    createdBy: action.createdBy,
    type: action.type,
    createdByRole:
      action.createdByUserType === TokenUserType.enum.user
        ? (action.createdByRole as string)
        : undefined
  })

  // Integrations have no office by design
  if (type === 'system' || type === 'integration') {
    return null
  }

  // Dropdown sub-rows render the office name as plain grey text, never a link.
  if (muted) {
    return <SecondaryLine>{locationName}</SecondaryLine>
  }

  return hasAccessToOffice && isOfficeActiveToday ? (
    <LinkLeftAligned
      font="bold14"
      onClick={() => {
        navigate({
          pathname: routes.TEAM_USER_LIST,
          search: serializeSearchParams({
            locationId: action.createdAtLocation
          })
        })
      }}
    >
      {locationName}
    </LinkLeftAligned>
  ) : (
    locationName
  )
}

const TwoLineCell = styled.div`
  display: flex;
  flex-direction: column;
`

function WhenCell({ isoDate, muted }: { isoDate: string; muted?: boolean }) {
  const intl = useIntl()
  const date = new Date(isoDate)
  const dateText = format(
    date,
    intl.formatMessage(dateFieldMessages.dateFormat)
  )
  const timeText = format(date, intl.formatMessage(messages.timeOnlyFormat))
  return (
    <TwoLineCell>
      {muted ? (
        <SecondaryLine>{dateText}</SecondaryLine>
      ) : (
        <BoldLine>{dateText}</BoldLine>
      )}
      <SecondaryLine>{timeText}</SecondaryLine>
    </TwoLineCell>
  )
}

function ActionByCell({
  action,
  muted
}: {
  action: ActionDocument
  muted?: boolean
}) {
  const intl = useIntl()
  const { config } = useSelector(getOfflineData)
  const { findUser } = useEventOverviewContext()
  const navigate = useNavigate()
  const { canReadUser } = usePermissions()
  const { getUserDetails } = useUserDetails()

  const { type, name, role } = getUserDetails({
    createdByUserType: action.createdByUserType,
    createdBy: action.createdBy,
    type: action.type,
    createdByRole: action.createdByRole
  })

  const NameLine = muted ? SecondaryLine : BoldLine

  if (type !== 'user') {
    return (
      <TwoLineCell>
        <NameLine data-testid="user-name">
          {muted ? config.APPLICATION_NAME : name}
        </NameLine>
        <SecondaryLine>{intl.formatMessage(messages.system)}</SecondaryLine>
      </TwoLineCell>
    )
  }

  const user = findUser(action.createdBy)
  const canViewUser = !muted && !!user && canReadUser(user)

  return (
    <TwoLineCell>
      {canViewUser ? (
        <LinkLeftAligned
          data-testid="user-name"
          font="bold14"
          id="profile-link"
          onClick={() =>
            navigate(
              ROUTES.V2.SETTINGS.USER.VIEW.buildPath({ userId: user.id })
            )
          }
        >
          {name}
        </LinkLeftAligned>
      ) : (
        <NameLine data-testid="user-name">{name}</NameLine>
      )}
      {role && <SecondaryLine>{role}</SecondaryLine>}
    </TwoLineCell>
  )
}

function EventHistorySkeleton() {
  const intl = useIntl()
  return (
    <Content
      size={ContentSize.LARGE}
      title={intl.formatMessage(messages.audit)}
    >
      <LargeGreyedInfo />
    </Content>
  )
}

/**
 *  Renders the event history table. Used for audit trail.
 */
function EventHistory({ fullEvent }: { fullEvent: EventDocument }) {
  const [currentPageNumber, setCurrentPageNumber] = React.useState(1)

  const validatorContext = useValidatorContext(fullEvent)
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)

  const intl = useIntl()
  const theme = useTheme()
  const [modal, openModal] = useModal()
  const [expandedActionIds, setExpandedActionIds] = React.useState<string[]>([])
  const { getActionTypeForHistory } = useActionForHistory()
  const { getUserDetails } = useUserDetails()

  const toggleExpanded = (actionId: string) =>
    setExpandedActionIds((ids) =>
      ids.includes(actionId)
        ? ids.filter((id) => id !== actionId)
        : [...ids, actionId]
    )

  const history = extractHistoryActions(fullEvent)
  const allActions = fullEvent.actions as ActionDocument[]

  const visibleHistory = [...history]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .filter(({ type }) => type !== ActionType.CREATE)

  const onHistoryRowClick = (
    action: ActionDocument,
    userName: string,
    title: string,
    isAwaitingConfirmation: boolean,
    systemUpdates?: ActionUpdate
  ) => {
    void openModal<void>((close) => (
      <EventHistoryDialog
        action={action}
        close={close}
        fullEvent={fullEvent}
        isAwaitingConfirmation={isAwaitingConfirmation}
        systemUpdates={systemUpdates}
        title={title}
        userName={userName}
        validatorContext={validatorContext}
      />
    ))
  }

  // Pagination must be based on this filtered list, not visibleHistory,
  // because paired APPROVE_CORRECTION rows are removed after the filter. Using the pre-filter
  // count would overcount the total pages and produce an empty last page.
  const displayableHistory = visibleHistory
    .map((x) => {
      if (x.type === ActionType.REQUEST_CORRECTION) {
        const immediateApprovedCorrection = findImmediateApproveCorrection(
          allActions,
          x
        )
        // Adding flag on immediately approved REQUEST_CORRECTION to show it
        // as 'Record corrected' in history table
        if (immediateApprovedCorrection) {
          return {
            ...x,
            annotation: { ...x.annotation, isImmediateCorrection: true }
          }
        }
      }
      return x
    })
    .filter((x) => {
      // Remove every immediately-approved correction row (whether the approval
      // is accepted or still requested). The pair is shown as a single 'Record corrected' row.
      if (
        x.type === ActionType.APPROVE_CORRECTION &&
        x.content?.immediateCorrection
      ) {
        return false
      }
      return true
    })

  const historyRows = displayableHistory
    .slice(
      (currentPageNumber - 1) * DEFAULT_HISTORY_RECORD_PAGE_SIZE,
      currentPageNumber * DEFAULT_HISTORY_RECORD_PAGE_SIZE
    )
    .flatMap((action) => {
      const { name: actionCreatorName } = getUserDetails({
        createdByUserType: action.createdByUserType,
        createdBy: action.createdBy,
        type: action.type,
        createdByRole: action.createdByRole
      })

      // Only configurable action types should call getActionConfig
      let actionConfig
      if (isActionConfigType(action.type)) {
        actionConfig = getActionConfig({
          eventConfiguration,
          actionType: action.type,
          customActionType:
            'customActionType' in action ? action.customActionType : undefined
        })
      }

      const statusSourceAction = getStatusSourceAction(action, allActions)
      const effectiveStatus = getEffectiveStatus(
        statusSourceAction,
        fullEvent.actions
      )
      const isAwaitingConfirmation = effectiveStatus === ActionStatus.Requested

      // A row can be expanded when there is a lifecycle to reveal: an action
      // accepted/rejected asynchronously (request + confirmation), or one still
      // only requested and awaiting approval (just the request).
      const asyncConfirmation = getAsyncConfirmation(
        statusSourceAction,
        fullEvent.actions
      )
      const isExpandable = !!asyncConfirmation || isAwaitingConfirmation
      const isExpanded = expandedActionIds.includes(action.id)

      const acceptedAction =
        allActions.find(
          (a) =>
            a.originalActionId === statusSourceAction.id &&
            a.status === ActionStatus.Accepted
        ) ??
        (statusSourceAction.status === ActionStatus.Accepted
          ? statusSourceAction
          : undefined)

      const dialogAction: ActionDocument = acceptedAction
        ? {
            ...action,
            declaration: deepMerge(
              action.declaration,
              acceptedAction.declaration
            ),
            annotation: deepMerge(
              action.annotation ?? {},
              acceptedAction.annotation ?? {}
            )
          }
        : action

      const systemUpdates =
        asyncConfirmation?.status === ActionStatus.Accepted
          ? asyncConfirmation.declaration
          : undefined

      // If a audit history label is configured in action config, use that!
      const title =
        actionConfig && actionConfig.type === ActionType.CUSTOM
          ? intl.formatMessage(actionConfig.auditHistoryLabel)
          : intl.formatMessage(eventHistoryStatusMessage, {
              action: getActionTypeForHistory(allActions, action),
              status: statusSourceAction.status,
              // Lets countries configure different wording for actions
              // performed by an integration, e.g. "Registered and UIN created"
              userType: action.createdByUserType
            })

      const mainRow = {
        status: (
          <StatusCell title={getStatusLabel(effectiveStatus, intl)}>
            <StatusBadge status={effectiveStatus} />
          </StatusCell>
        ),
        action: (
          <LinkLeftAligned
            font="bold14"
            onClick={() =>
              onHistoryRowClick(
                dialogAction,
                actionCreatorName,
                title,
                isAwaitingConfirmation,
                systemUpdates
              )
            }
          >
            {title}
          </LinkLeftAligned>
        ),
        when: <WhenCell isoDate={action.createdAt} />,
        by: <ActionByCell action={action} />,
        location: <ActionLocation action={action} />,
        expand: isExpandable ? (
          <ExpandToggle
            aria-expanded={isExpanded}
            aria-label={intl.formatMessage(messages.toggleConfirmationDetails)}
            onClick={() => toggleExpanded(action.id)}
          >
            <Icon name={isExpanded ? 'CaretDown' : 'CaretRight'} size="small" />
          </ExpandToggle>
        ) : (
          ''
        ),
        rowBackgroundColor:
          effectiveStatus === ActionStatus.Requested
            ? theme.colors.orangeLighter
            : undefined,
        // The whole row toggles the dropdown, except when a link or button
        // inside it (the action, name or location) was clicked.
        onRowClick: isExpandable
          ? (e: React.MouseEvent) => {
              if ((e.target as HTMLElement).closest('a, button')) {
                return
              }
              toggleExpanded(action.id)
            }
          : undefined
      }

      if (!isExpandable || !isExpanded) {
        return [mainRow]
      }

      const buildDetailRow = (
        detailAction: ActionDocument,
        status: ActionStatus
      ) => ({
        status: '',
        action: (
          <DetailActionCell>
            <StatusBadge size="small" status={status} />
            <ConfirmationDetailLabel>
              {getStatusLabel(status, intl)}
            </ConfirmationDetailLabel>
          </DetailActionCell>
        ),
        when: <WhenCell muted isoDate={detailAction.createdAt} />,
        by: <ActionByCell muted action={detailAction} />,
        location: <ActionLocation muted action={detailAction} />,
        expand: '',
        rowBackgroundColor: theme.colors.grey100
      })

      // Show the request action first, then the accept/reject that followed
      const detailRows = [
        buildDetailRow(statusSourceAction, ActionStatus.Requested)
      ]
      if (asyncConfirmation) {
        detailRows.push(
          buildDetailRow(asyncConfirmation, asyncConfirmation.status)
        )
      }

      return [mainRow, ...detailRows]
    })

  const columns = [
    {
      label: '',
      width: 4,
      key: 'status',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    {
      label: intl.formatMessage(messages.action),
      width: 34,
      key: 'action'
    },
    {
      label: intl.formatMessage(messages.location),
      width: 22,
      key: 'location'
    },
    {
      label: intl.formatMessage(messages.by),
      width: 21,
      key: 'by'
    },
    {
      label: intl.formatMessage(messages.when),
      width: 15,
      key: 'when'
    },
    {
      label: '',
      width: 4,
      key: 'expand',
      isIconColumn: true,
      alignment: ColumnContentAlignment.RIGHT,
      ICON_ALIGNMENT: ColumnContentAlignment.RIGHT
    }
  ]

  return (
    <Content
      noPadding
      size={ContentSize.LARGE}
      title={intl.formatMessage(messages.audit)}
    >
      <TableDiv>
        <Table
          highlightRowOnMouseOver
          columns={columns}
          content={historyRows}
          id="task-history"
          noResultText=""
          pageSize={Math.max(historyRows.length, 1)}
        />
        {displayableHistory.length > DEFAULT_HISTORY_RECORD_PAGE_SIZE && (
          <Pagination
            currentPage={currentPageNumber}
            totalPages={Math.ceil(
              displayableHistory.length / DEFAULT_HISTORY_RECORD_PAGE_SIZE
            )}
            onPageChange={(page) => setCurrentPageNumber(page)}
          />
        )}
      </TableDiv>
      {modal}
    </Content>
  )
}

export function EventHistoryIndex() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.AUDIT)
  const { fullEvent, shouldShowFullOverview: shouldShowHistory } =
    useEventOverviewInfo(eventId)

  if (!shouldShowHistory) {
    return <EventHistorySkeleton />
  }

  return <EventHistory fullEvent={fullEvent} />
}
