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

import { colors } from '../colors'

export enum IconSize {
  small = 12,
  medium = 18,
  large = 24
}

export enum IconName {
  Activity = 'Activity',
  AlertCircle = 'AlertCircle',
  Archive = 'Archive',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowUpCircle = 'ArrowUpCircle',
  ArrowDownCircle = 'ArrowDownCircle',
  Award = 'Award',
  Bell = 'Bell',
  Box = 'Box',
  Calendar = 'Calendar',
  Check = 'Check',
  ChevronLeft = 'ChevronLeft',
  ChevronRight = 'ChevronRight',
  ChevronUp = 'ChevronUp',
  ChevronDown = 'ChevronDown',
  Compass = 'Compass',
  Delete = 'Delete',
  Edit = 'Edit',
  Eye = 'Eye',
  EyeOff = 'EyeOff',
  File = 'File',
  HelpCircle = 'HelpCircle',
  LogOut = 'LogOut',
  MapPin = 'MapPin',
  Menu = 'Menu',
  Minus = 'Minus',
  MoreVertical = 'MoreVertical',
  Paperclip = 'Paperclip',
  Phone = 'Phone',
  Plus = 'Plus',
  Printer = 'Printer',
  RotateCcw = 'RotateCcw',
  RotateCw = 'RotateCw',
  Search = 'Search',
  Settings = 'Settings',
  Share = 'Share',
  Target = 'Target',
  Trash2 = 'Trash2',
  TrendingUp = 'TrendingUp',
  User = 'User',
  Users = 'Users',
  UserPlus = 'UserPlus',
  WifiOff = 'WifiOff',
  X = 'X',
  XCircle = 'XCircle'
}

export interface IPropsIcon {
  name: keyof typeof IconName
  strokeColor?: keyof typeof colors
  fillColor?: keyof typeof colors
  strokeWidth?: number
  size?: keyof typeof IconSize
}
