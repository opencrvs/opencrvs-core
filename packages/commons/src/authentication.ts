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

import { IAuthHeader } from './http';
import decode from 'jwt-decode';
import { Nominal } from './nominal';
import * as z from "zod/v4";

import { RawScopes, Scope, SCOPES } from './scopes';
export * from './scopes';

export const DEFAULT_ROLES_DEFINITION = [
{
  id: 'FIELD_AGENT',
  label: {
    defaultMessage: 'Field Agent',
    description: 'Name for user role Field Agent',
    id: 'userRole.fieldAgent'
  },
  scopes: [
  // new scopes
  SCOPES.RECORD_DECLARE_BIRTH,
  SCOPES.RECORD_DECLARE_DEATH,
  SCOPES.RECORD_DECLARE_MARRIAGE,
  SCOPES.RECORD_SUBMIT_INCOMPLETE,
  SCOPES.RECORD_SUBMIT_FOR_REVIEW,
  SCOPES.SEARCH_BIRTH,
  SCOPES.SEARCH_DEATH,
  SCOPES.SEARCH_MARRIAGE]

},
{
  id: 'REGISTRATION_AGENT',
  label: {
    defaultMessage: 'Registration Agent',
    description: 'Name for user role Registration Agent',
    id: 'userRole.registrationAgent'
  },
  scopes: [
  SCOPES.PERFORMANCE,
  SCOPES.CERTIFY,
  SCOPES.RECORD_DECLARE_BIRTH,
  SCOPES.RECORD_DECLARE_DEATH,
  SCOPES.RECORD_DECLARE_MARRIAGE,
  SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
  SCOPES.RECORD_SUBMIT_FOR_UPDATES,
  SCOPES.RECORD_DECLARATION_ARCHIVE,
  SCOPES.RECORD_DECLARATION_REINSTATE,
  SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION,
  SCOPES.RECORD_REGISTRATION_PRINT,
  SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS,
  SCOPES.RECORD_EXPORT_RECORDS,
  SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
  SCOPES.RECORD_REGISTRATION_VERIFY_CERTIFIED_COPIES,
  SCOPES.RECORD_CREATE_COMMENTS,
  SCOPES.PERFORMANCE_READ,
  SCOPES.PERFORMANCE_READ_DASHBOARDS,
  SCOPES.ORGANISATION_READ_LOCATIONS,
  SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
  SCOPES.SEARCH_BIRTH,
  SCOPES.SEARCH_DEATH,
  SCOPES.SEARCH_MARRIAGE]

},
{
  id: 'LOCAL_REGISTRAR',
  label: {
    defaultMessage: 'Local Registrar',
    description: 'Name for user role Local Registrar',
    id: 'userRole.localRegistrar'
  },
  scopes: [
  SCOPES.PERFORMANCE,
  SCOPES.CERTIFY,
  SCOPES.RECORD_DECLARE_BIRTH,
  SCOPES.RECORD_DECLARE_DEATH,
  SCOPES.RECORD_DECLARE_MARRIAGE,
  SCOPES.RECORD_SUBMIT_FOR_UPDATES,
  SCOPES.RECORD_REVIEW_DUPLICATES,
  SCOPES.RECORD_DECLARATION_ARCHIVE,
  SCOPES.RECORD_DECLARATION_REINSTATE,
  SCOPES.RECORD_REGISTER,
  SCOPES.RECORD_REGISTRATION_CORRECT,
  SCOPES.RECORD_REGISTRATION_PRINT,
  SCOPES.RECORD_PRINT_RECORDS_SUPPORTING_DOCUMENTS,
  SCOPES.RECORD_EXPORT_RECORDS,
  SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
  SCOPES.RECORD_REGISTRATION_VERIFY_CERTIFIED_COPIES,
  SCOPES.RECORD_CREATE_COMMENTS,
  SCOPES.PERFORMANCE_READ,
  SCOPES.PERFORMANCE_READ_DASHBOARDS,
  SCOPES.ORGANISATION_READ_LOCATIONS,
  SCOPES.PROFILE_ELECTRONIC_SIGNATURE,
  SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
  SCOPES.SEARCH_BIRTH,
  SCOPES.SEARCH_DEATH,
  SCOPES.SEARCH_MARRIAGE]

},
{
  id: 'LOCAL_SYSTEM_ADMIN',
  label: {
    defaultMessage: 'Local System Admin',
    description: 'Name for user role Local System Admin',
    id: 'userRole.localSystemAdmin'
  },
  scopes: [
  SCOPES.SYSADMIN,
  SCOPES.USER_READ_MY_OFFICE,
  SCOPES.USER_CREATE_MY_JURISDICTION,
  SCOPES.USER_UPDATE_MY_JURISDICTION,
  SCOPES.ORGANISATION_READ_LOCATIONS,
  SCOPES.PERFORMANCE_READ,
  SCOPES.PERFORMANCE_READ_DASHBOARDS,
  SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
  // 'organisation.read-users' ?
  ]
},
{
  id: 'NATIONAL_SYSTEM_ADMIN',
  label: {
    defaultMessage: 'National System Admin',
    description: 'Name for user role National System Admin',
    id: 'userRole.nationalSystemAdmin'
  },
  scopes: [
  SCOPES.SYSADMIN,
  SCOPES.NATLSYSADMIN,
  SCOPES.USER_CREATE,
  SCOPES.USER_READ,
  SCOPES.USER_UPDATE,
  SCOPES.ORGANISATION_READ_LOCATIONS,
  SCOPES.PERFORMANCE_READ,
  SCOPES.PERFORMANCE_READ_DASHBOARDS,
  SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS
  // 'organisation.read-users' ?
  ]
},
{
  id: 'PERFORMANCE_MANAGER',
  label: {
    defaultMessage: 'Performance Manager',
    description: 'Name for user role Performance Manager',
    id: 'userRole.performanceManager'
  },
  scopes: [
  SCOPES.PERFORMANCE,
  SCOPES.PERFORMANCE_READ,
  SCOPES.PERFORMANCE_READ_DASHBOARDS,
  SCOPES.PERFORMANCE_EXPORT_VITAL_STATISTICS]

}] satisfies
Array<{
  id: string;
  label: {defaultMessage: string;description: string;id: string;};
  scopes: Scope[];
}>;

/*
 * Describes a "legacy" user role such as FIELD_AGENT, REGISTRATION_AGENT, etc.
 * These are roles we are slowly sunsettings in favor of the new, more configurable user roles.
 */

export const TokenUserType = z.enum(['user', 'system']);
export type TokenUserType = z.infer<typeof TokenUserType>;

export interface ITokenPayload {
  sub: string;
  exp: string;
  algorithm: string;
  scope: Scope[];
  userType: TokenUserType;
}

export function getScopes(authHeader: IAuthHeader): RawScopes[] {
  if (!authHeader || !authHeader.Authorization) {
    return [];
  }
  const tokenPayload = getTokenPayload(authHeader.Authorization.split(' ')[1]);
  return tokenPayload.scope || [];
}

export function hasScope(authHeader: IAuthHeader, scope: Scope) {
  return getScopes(authHeader).includes(scope);
}

export function inScope(authHeader: IAuthHeader, scopes: Scope[]) {
  const tokenScopes = getScopes(authHeader);
  return scopes.some((scope) => tokenScopes.includes(scope));
}

export const getTokenPayload = (token: string): ITokenPayload => {
  let decoded: ITokenPayload;
  try {
    decoded = decode(token);
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    );
  }
  return decoded;
};

export const getUserId = (token: TokenWithBearer): string => {
  const tokenPayload = getTokenPayload(token.split(' ')[1]);
  return z.string().parse(tokenPayload.sub);
};

export const getUserTypeFromToken = (token: TokenWithBearer): TokenUserType => {
  const tokenPayload = getTokenPayload(token.split(' ')[1]);

  return TokenUserType.parse(tokenPayload.userType);
};

export const TokenWithBearer = z.
string().
regex(/^Bearer\s/) as z.ZodType<`Bearer ${string}`>;
export type TokenWithBearer = z.infer<typeof TokenWithBearer>;
export type Token = Nominal<string, 'TokenWithoutBearer'>;