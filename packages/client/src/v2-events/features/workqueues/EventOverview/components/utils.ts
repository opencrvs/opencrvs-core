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
  ActionType,
  ClientSpecificAction,
  WorkqueueActionType,
  ActionTypes,
  TranslationConfig
} from '@opencrvs/commons/client'
import { IconProps } from '@opencrvs/components'

export const actionLabels = {
  [ActionType.NOTIFY]: {
    defaultMessage: 'Notify',
    description: 'Notify action label',
    id: 'actions.notify'
  },
  [ActionType.ASSIGN]: {
    defaultMessage: 'Assign',
    description: `Label for the ${ActionType.ASSIGN} action in the action menu`,
    id: 'action.assign.label'
  },
  [ActionType.UNASSIGN]: {
    defaultMessage: 'Unassign',
    description: `Label for the ${ActionType.UNASSIGN} action in the action menu`,
    id: 'action.unassign.label'
  },
  [ActionType.DECLARE]: {
    defaultMessage: 'Declare',
    description:
      'This is shown as the action name anywhere the user can trigger the action from',
    id: 'event.birth.action.declare.label'
  },
  [ActionType.EDIT]: {
    defaultMessage: 'Edit',
    description: 'Edit action label',
    id: 'actions.edit'
  },
  [ActionType.REJECT]: {
    defaultMessage: 'Reject',
    description: 'Label for reject button in dropdown menu',
    id: 'event.birth.action.reject.label'
  },
  [ActionType.ARCHIVE]: {
    defaultMessage: 'Archive',
    description: 'Label for archive record button in dropdown menu',
    id: 'event.birth.action.archive.label'
  },
  [ActionType.REGISTER]: {
    defaultMessage: 'Register',
    description: 'Label for review record button in dropdown menu',
    id: 'event.birth.action.register.label'
  },
  [ActionType.MARK_AS_DUPLICATE]: {
    defaultMessage: 'Review',
    description: 'Label for review potential duplicate button in dropdown menu',
    id: 'event.birth.action.mark-as-duplicate.label'
  },
  [ActionType.PRINT_CERTIFICATE]: {
    defaultMessage: 'Print',
    description:
      'This is shown as the action name anywhere the user can trigger the action from',
    id: 'event.birth.action.collect-certificate.label'
  },
  [ActionType.DELETE]: {
    defaultMessage: 'Delete',
    description: 'Label for delete button in dropdown menu',
    id: 'event.birth.action.delete.label'
  },
  [ActionType.REQUEST_CORRECTION]: {
    defaultMessage: 'Correct record',
    description: 'Label for request correction button in dropdown menu',
    id: 'event.birth.action.request-correction.label'
  },
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: {
    defaultMessage: 'Review correction request',
    description: 'Label for review correction button in dropdown menu',
    id: 'event.action.review-correction.label'
  }
} as const

export interface ActionConfig {
  label: TranslationConfig
  icon: IconProps['name']
  /** onClick is used when clicking an action menu item. */
  onClick: (workqueue?: string) => Promise<void> | void
  disabled?: boolean
  hidden?: boolean
  customActionType?: string
}

export type ActionMenuActionType = WorkqueueActionType | ClientSpecificAction

export interface ActionMenuItem extends ActionConfig {
  type: ActionMenuActionType | (typeof ActionTypes.enum)['CUSTOM']
}
