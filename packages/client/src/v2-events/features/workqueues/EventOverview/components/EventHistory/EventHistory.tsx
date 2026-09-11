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
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { Link, Pagination } from '@opencrvs/components'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Table } from '@opencrvs/components/lib/Table'
import { Text } from '@opencrvs/components/lib/Text'
import {
  Action,
  ActionDocument,
  ActionStatus,
  ActionType,
  isActionConfigType,
  EventDocument,
  getActionConfig,
  isSelectableAtAnchor,
  TokenUserType,
  todayISO,
  toPlainDate
} from '@opencrvs/commons/client'
import { Box } from '@opencrvs/components/lib/icons'
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
import { useEventOverviewInfo } from '../useEventOverviewInfo'
import { UserAvatar } from './UserAvatar'
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

/**
 * The action whose confirmation status the row should reflect. Usually the row
 * action itself, but for a direct correction shown as "Record corrected" it is
 * the paired APPROVE_CORRECTION — that is the action awaiting external
 * validation, not the request that is displayed.
 */
function getStatusSourceAction(
  action: ActionDocument,
  history: ActionDocument[]
): ActionDocument {
  if (action.type === ActionType.REQUEST_CORRECTION) {
    return findImmediateApproveCorrection(history, action) ?? action
  }
  return action
}

/**
 * The effective status of an original action: the status of its confirmation
 * (accept/reject, linked via `originalActionId`) when one exists, otherwise the
 * action's own status. A still-`Requested` action with no confirmation is
 * waiting for external validation.
 */
function getEffectiveStatus(
  action: ActionDocument,
  allActions: Action[]
): ActionStatus {
  const confirmation = allActions.find(
    (other) => other.originalActionId === action.id
  )
  return confirmation ? confirmation.status : action.status
}

const DEFAULT_HISTORY_RECORD_PAGE_SIZE = 10

const messages = defineMessages({
  timeFormat: {
    defaultMessage: 'MMMM dd, yyyy · hh.mm a',
    id: 'configuration.timeFormat',
    description: 'Time format for timestamps in event history'
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
  date: {
    defaultMessage: 'Date',
    description: 'Date Label',
    id: 'constants.label.date'
  },
  audit: {
    defaultMessage: 'Audit',
    description: 'Audit heading',
    id: 'constants.audit'
  },
  labelRole: {
    defaultMessage: 'Role',
    description: 'Role label',
    id: 'constants.role'
  },
  waitingForExternalValidation: {
    defaultMessage: 'Waiting for external validation',
    description:
      'Status badge shown on an action that is still awaiting confirmation from an external system',
    id: 'events.history.waitingForExternalValidation'
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
  location: {
    defaultMessage: 'Location',
    description: 'Label for location',
    id: 'constants.location'
  }
})

function StatusBadge({
  status,
  intl
}: {
  status: ActionStatus
  intl: IntlShape
}) {
  if (status === ActionStatus.Rejected) {
    return (
      <span title={intl.formatMessage(messages.statusRejected)}>
        <Icon color="red" name="XCircle" size="large" />
      </span>
    )
  }

  if (status === ActionStatus.Requested) {
    return (
      <span title={intl.formatMessage(messages.waitingForExternalValidation)}>
        <Icon color="orange" name="PauseCircle" size="large" />
      </span>
    )
  }

  return (
    <span title={intl.formatMessage(messages.statusAccepted)}>
      <Icon color="green" name="CheckCircle" size="large" />
    </span>
  )
}

const SystemName = styled.div`
  display: flex;
  align-items: center;

  > div {
    flex-grow: 0;
    flex-shrink: 0;
    border-radius: 100%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    margin-right: 10px;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.grey200};
  }
`

function User({ action }: { action: ActionDocument }) {
  const { findUser } = useEventOverviewContext()
  const navigate = useNavigate()
  const user = findUser(action.createdBy)
  const { canReadUser } = usePermissions()
  const { getUserDetails } = useUserDetails()

  const { type, name } = getUserDetails({
    createdByUserType: action.createdByUserType,
    createdBy: action.createdBy,
    type: action.type,
    createdByRole: action.createdByRole
  })

  if (type !== 'user') {
    throw new Error('Expected action creator to be a user')
  }

  const canViewUser = !!user && canReadUser(user)

  return canViewUser ? (
    <LinkLeftAligned
      font="bold14"
      id="profile-link"
      onClick={() =>
        navigate(
          ROUTES.V2.SETTINGS.USER.VIEW.buildPath({
            userId: user.id
          })
        )
      }
    >
      <UserAvatar avatar={user.avatar} names={name} />
    </LinkLeftAligned>
  ) : (
    <UserAvatar avatar={user?.avatar} names={name} />
  )
}

function Integration({ action }: { action: ActionDocument }) {
  const { getUserDetails } = useUserDetails()

  const { type, name } = getUserDetails({
    createdByUserType: action.createdByUserType,
    createdBy: action.createdBy,
    type: action.type
  })

  if (type !== 'integration') {
    throw new Error('Expected action creator to be an integration')
  }

  return (
    <SystemName>
      <div>
        <Box />
      </div>
      <Text color="primary" element="span" variant="bold14">
        {name}
      </Text>
    </SystemName>
  )
}

function ActionCreator({ action }: { action: ActionDocument }) {
  const intl = useIntl()
  if (action.createdByUserType === 'system') {
    return <Integration action={action} />
  }
  if (action.type === ActionType.DUPLICATE_DETECTED) {
    return (
      <SystemName>
        <div>
          <Box />
        </div>
        {intl.formatMessage(messages.system)}
      </SystemName>
    )
  }
  return <User action={action} />
}

function ActionLocation({ action }: { action: ActionDocument }) {
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
  const { getActionTypeForHistory } = useActionForHistory()
  const { getUserDetails } = useUserDetails()

  const history = extractHistoryActions(fullEvent)

  // Each row is an original action; the outcome of its confirmation (accepted,
  // rejected, or still waiting) is surfaced as a status on the row itself, so a
  // rejected registration no longer needs a separate row.
  const visibleHistory = [...history]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .filter(({ type }) => type !== ActionType.CREATE)

  const onHistoryRowClick = (
    action: ActionDocument,
    userName: string,
    title: string
  ) => {
    void openModal<void>((close) => (
      <EventHistoryDialog
        action={action}
        close={close}
        fullEvent={fullEvent}
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
          visibleHistory,
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
      // is accepted or still requested). The pair is shown as a single
      // 'Record corrected' row on the REQUEST_CORRECTION; its pending external
      // validation is surfaced there as a status badge instead of a separate
      // 'Waiting for external validation' row.
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
    .map((action) => {
      const { name: actionCreatorName, role } = getUserDetails({
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

      const effectiveStatus = getEffectiveStatus(
        getStatusSourceAction(action, history),
        fullEvent.actions
      )

      // If a audit history label is configured in action config, use that!
      const title =
        actionConfig && actionConfig.type === ActionType.CUSTOM
          ? intl.formatMessage(actionConfig.auditHistoryLabel)
          : intl.formatMessage(eventHistoryStatusMessage, {
              action: getActionTypeForHistory(history, action),
              // The row shows the original (request) action; label it by the
              // outcome of its confirmation.
              status: effectiveStatus,
              // Lets countries configure different wording for actions
              // performed by an integration, e.g. "Registered and UIN created"
              userType: action.createdByUserType
            })

      return {
        status: <StatusBadge intl={intl} status={effectiveStatus} />,
        action: (
          <LinkLeftAligned
            font="bold14"
            onClick={() => onHistoryRowClick(action, actionCreatorName, title)}
          >
            {title}
          </LinkLeftAligned>
        ),
        date: format(
          new Date(action.createdAt),
          intl.formatMessage(messages.timeFormat)
        ),
        user: <ActionCreator action={action} />,
        // Integrations have no role, and the table cell type takes no undefined
        role: role ?? '',
        location: <ActionLocation action={action} />,
        // Highlight rows still waiting for external validation.
        rowBackgroundColor:
          effectiveStatus === ActionStatus.Requested
            ? theme.colors.orangeLighter
            : undefined
      }
    })

  const columns = [
    {
      label: '',
      width: 6,
      key: 'status',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    {
      label: intl.formatMessage(messages.action),
      width: 20,
      key: 'action'
    },
    {
      label: intl.formatMessage(messages.date),
      width: 21,
      key: 'date'
    },
    {
      label: intl.formatMessage(messages.by),
      width: 20,
      key: 'user',
      isIconColumn: true,
      ICON_ALIGNMENT: ColumnContentAlignment.LEFT
    },
    {
      label: intl.formatMessage(messages.labelRole),
      width: 15,
      key: 'role'
    },
    {
      label: intl.formatMessage(messages.location),
      width: 20,
      key: 'location'
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
          fixedWidth={1088}
          id="task-history"
          noResultText=""
          pageSize={DEFAULT_HISTORY_RECORD_PAGE_SIZE}
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
