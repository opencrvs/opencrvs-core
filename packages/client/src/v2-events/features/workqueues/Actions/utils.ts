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

import { z } from 'zod/v4'
import {
  ActionType,
  ClientSpecificAction,
  WorkqueueActionType,
  ActionTypes,
  TranslationConfig,
  DisplayableAction
} from '@opencrvs/commons/client'
import { IconProps } from '@opencrvs/components'

export const actionLabels = {
  [ActionType.READ]: {
    defaultMessage: 'Review',
    description: 'Action label for reading a record from the workqueue',
    id: 'actions.read'
  },
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
    defaultMessage: 'Review potential duplicates',
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
    defaultMessage: 'Correct',
    description: 'Label for request correction button in dropdown menu',
    id: 'event.birth.action.request-correction.label'
  },
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: {
    defaultMessage: 'Review correction request',
    description: 'Label for review correction button in dropdown menu',
    id: 'event.action.review-correction.label'
  }
} as const

export const actionIcons: Record<
  ActionMenuActionType | WorkqueueActionType,
  IconProps['name']
> = {
  [ActionType.ASSIGN]: 'PushPin',
  [ActionType.UNASSIGN]: 'ArrowCircleDown',
  [ActionType.ARCHIVE]: 'Archive',
  [ActionType.MARK_AS_DUPLICATE]: 'PencilLine',
  [ActionType.DELETE]: 'Trash',
  [ActionType.DECLARE]: 'PencilLine',
  [ActionType.EDIT]: 'PencilLine',
  [ActionType.REJECT]: 'FileX',
  [ActionType.REGISTER]: 'PencilLine',
  [ActionType.PRINT_CERTIFICATE]: 'Printer',
  [ActionType.REQUEST_CORRECTION]: 'NotePencil',
  [ClientSpecificAction.REVIEW_CORRECTION_REQUEST]: 'NotePencil',
  [ActionType.READ]: 'Eye'
}

export interface ActionCtaConfig<T extends DisplayableAction> {
  label: TranslationConfig
  icon: IconProps['name']
  /** onClick is used when clicking an action menu item. */
  onClick: (workqueue?: string) => Promise<void> | void
  disabled?: boolean
  hidden?: boolean
  customActionType?: string
  type: T
}

export const ActionMenuActionType = z
  .enum([
    ...WorkqueueActionType.options,
    ClientSpecificAction.REVIEW_CORRECTION_REQUEST,
    ActionType.ASSIGN,
    ActionType.UNASSIGN
  ])
  .exclude([ActionType.READ])

export type ActionMenuActionType = z.infer<typeof ActionMenuActionType>
export type ActionMenuItem = ActionCtaConfig<
  ActionMenuActionType | (typeof ActionTypes.enum)['CUSTOM']
>
