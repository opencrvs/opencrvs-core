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

export const derivedVariables = [
  {
    name: 'ACTIVATE_USERS',
    valueLabel: 'ACTIVATE_USERS',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'COUNTRY_CONFIG_HOST',
    valueLabel: 'COUNTRY_CONFIG_HOST',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'GATEWAY_HOST',
    valueLabel: 'GATEWAY_HOST',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'CONTENT_SECURITY_POLICY_WILDCARD',
    valueLabel: 'CONTENT_SECURITY_POLICY_WILDCARD',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'CLIENT_APP_URL',
    valueLabel: 'CLIENT_APP_URL',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'LOGIN_URL',
    valueLabel: 'LOGIN_URL',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
    valueLabel: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'KIBANA_SYSTEM_PASSWORD',
    valueLabel: 'KIBANA_SYSTEM_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MINIO_ROOT_USER',
    valueLabel: 'MINIO_ROOT_USER',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MINIO_ROOT_PASSWORD',
    valueLabel: 'MINIO_ROOT_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MONGODB_ADMIN_USER',
    valueLabel: 'MONGODB_ADMIN_USER',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'MONGODB_ADMIN_PASSWORD',
    valueLabel: 'MONGODB_ADMIN_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'POSTGRES_USER',
    valueLabel: 'POSTGRES_USER',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'POSTGRES_PASSWORD',
    valueLabel: 'POSTGRES_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'SUPER_USER_PASSWORD',
    valueLabel: 'SUPER_USER_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'ENCRYPTION_KEY',
    valueLabel: 'ENCRYPTION_KEY',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'GH_ENCRYPTION_PASSWORD',
    valueLabel: 'GH_ENCRYPTION_PASSWORD',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'REPOSITORY'
  },
  {
    name: 'BACKUP_ENCRYPTION_PASSPHRASE',
    valueLabel: 'BACKUP_ENCRYPTION_PASSPHRASE',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'BACKUP_HOST_PRIVATE_KEY',
    valueLabel: 'BACKUP_HOST_PRIVATE_KEY',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'BACKUP_HOST_PUBLIC_KEY',
    valueLabel: 'BACKUP_HOST_PUBLIC_KEY',
    valueType: 'SECRET',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'RESTORE_ENVIRONMENT_NAME',
    valueLabel: 'RESTORE_ENVIRONMENT_NAME',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
  {
    name: 'NOTIFICATION_TRANSPORT',
    valueLabel: 'NOTIFICATION_TRANSPORT',
    valueType: 'VARIABLE',
    type: 'disabled',
    scope: 'ENVIRONMENT'
  },
] as const;