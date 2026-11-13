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
import { FunctionFactory } from 'survey-core'
import { DEFAULT_HOSTS } from '../plan/dependencyHosts'
import { areValidKeys, countUsersWithoutKeys } from './users'

const OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)'
const IPV4 = new RegExp(`^(${OCTET}\\.){3}${OCTET}$`)
const CIDR = new RegExp(`^(${OCTET}\\.){3}${OCTET}/([0-9]|[12][0-9]|3[0-2])$`)

export const isIPv4 = (value: unknown) => typeof value === 'string' && IPV4.test(value.trim())

export const isCidrList = (value: unknown) =>
  typeof value === 'string' && value.split(',').every((cidr) => CIDR.test(cidr.trim()))

// The address a built-in component has inside the cluster, to pre-fill the question that asks for it:
// `defaultAddress('POSTGRES_HOST', {ENVIRONMENT_NAME})`. Empty until the environment has a name, and for a
// question that has no address. The same addresses are written for a component that is built in, so the
// form and the files cannot disagree (see DEFAULT_HOSTS).
export const defaultAddress = (question: unknown, environment: unknown) =>
  typeof question === 'string' && typeof environment === 'string' && environment ? (DEFAULT_HOSTS[question]?.(environment) ?? '') : ''

function register(name: string, func: (params: any[]) => unknown) {
  FunctionFactory.Instance.register(name, (params) => func(params))
}

register('defaultAddress', ([question, environment]) => defaultAddress(question, environment))
register('isIPv4', ([value]) => isIPv4(value))
register('isCidrList', ([value]) => isCidrList(value))
register('areValidKeys', ([value]) => areValidKeys(value))
register('usersWithoutKeys', ([rows]) => countUsersWithoutKeys(rows))
