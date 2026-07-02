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

import kleur from 'kleur'
import { generateLongPassword } from './utils'
import { getRepoInfo } from './git'


const notEmpty = (value: string | number) =>
  value.toString().trim().length > 0 ? true : 'Please enter a value'

function validateCIDR(input: string): true | string {
  if (!input.trim()) {
    return true
  }

  const cidrRegex =
    /^((25[0-5]|(2[0-4]|1\d|[1-9]?\d)\d?)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]?\d)\d?)\/([0-9]|[12][0-9]|3[0-2])$/

  return cidrRegex.test(input.trim())
    ? true
    : 'Please enter a valid CIDR (e.g. 10.0.0.0/24)'
}

function validateCIDRs(input: string): true | string {
  if (!input.trim()) {
    return true
  }

  const cidrs = input.split(',').map((v) => v.trim())

  for (const cidr of cidrs) {
    const result = validateCIDR(cidr)

    if (result !== true) {
      return `Invalid CIDR: ${cidr}`
    }
  }

  return true
}


export const dockerhubQuestions = [
  {
    name: 'dockerhubOrganisation',
    type: 'text' as const,
    message: 'What is the name of your Docker Hub organisation?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKERHUB_ACCOUNT',
    validate: notEmpty,
    initial: process.env.DOCKER_ORGANISATION,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'dockerhubRepository',
    type: 'text' as const,
    message: 'What is the name of your private Docker Hub repository?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKERHUB_REPO',
    validate: notEmpty,
    initial: process.env.DOCKER_REPO,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'dockerhubUsername',
    type: 'text' as const,
    message:
      'What is the Docker Hub username the the target server should be using?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKER_USERNAME',
    validate: notEmpty,
    initial: process.env.DOCKER_USERNAME,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'dockerhubToken',
    type: 'text' as const,
    message: 'What is the token of this Docker Hub account?',
    valueType: 'SECRET' as const,
    valueLabel: 'DOCKER_TOKEN',
    validate: notEmpty,
    initial: process.env.DOCKER_TOKEN,
    scope: 'REPOSITORY' as const
  }
]

export const githubQuestions = [
  {
    name: 'githubOrganisation',
    type: 'text' as const,
    message: 'What is the name of your Github organisation?',
    validate: notEmpty,
    initial: process.env.GITHUB_ORGANISATION || getRepoInfo().organization,
    scope: 'REPOSITORY' as const
  },
  {
    name: 'githubRepository',
    type: 'text' as const,
    message: 'What is your Github infrastructure repository?',
    validate: notEmpty,
    initial: process.env.GITHUB_REPOSITORY || getRepoInfo().repository,
    scope: 'REPOSITORY' as const
  },
]
export const githubOtherQuestions = [
  {
    name: 'githubApprovers',
    type: 'text' as const,
    message: 'Please provide/update list of production approvers?',
    initial: process.env.GH_APPROVERS,
    valueType: 'VARIABLE' as const,
    valueLabel: 'GH_APPROVERS',
    scope: 'REPOSITORY' as const
  },
  {
    name: 'approvalRequired',
    type: 'select' as const,
    message: 'Would you like to enable approvals process for GitHub action workflows?',
    choices: [
      {
        title: 'True',
        value: 'true'
      },
      {
        title: 'False',
        value: 'false'
      }
    ],
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'APPROVAL_REQUIRED',
    initial: process.env.APPROVAL_REQUIRED,
    scope: 'ENVIRONMENT' as const
  },
]
export const githubTokenQuestion = [
  {
    name: 'githubToken',
    type: 'text' as const,
    message: 'What is your Github token?',
    validate: notEmpty,
    initial: process.env.GITHUB_TOKEN,
    valueType: 'SECRET' as const,
    scope: 'REPOSITORY' as const,
    valueLabel: 'GH_TOKEN'
  }
]

export const countryQuestions = [
  {
    name: 'country',
    type: 'text' as const,
    message:
      'What is the ISO 3166-1 alpha-3 country-code? (e.g. "NZL" for New Zealand) Reference: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3',
    valueType: 'VARIABLE' as const,
    valueLabel: 'COUNTRY',
    initial: process.env.COUNTRY,
    scope: 'REPOSITORY' as const
  }
]

export const infrastructureQuestions = [
  {
    name: 'domain',
    type: 'text' as const,
    message: 'What is the web domain applied after all subdomains in URLs?',
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'DOMAIN',
    initial: process.env.DOMAIN,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'kubeAPIHost',
    type: 'text' as const,
    message: 
      `Kubernetes API endpoint (default: auto-detect)`,
    valueType: 'VARIABLE' as const,
    // validate: notEmpty,
    valueLabel: 'KUBE_API_HOST',
    initial: process.env.KUBE_API_HOST,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'kubeApiAllowedCidrs',
    type: 'text' as const,
    message:
      `Allowed CIDRs for Kubernetes API access (default: KUBE_API_HOST)`,
    valueType: 'VARIABLE' as const,
    validate: validateCIDRs,
    valueLabel: 'KUBE_API_ALLOWED_CIDRS',
    initial: process.env.KUBE_API_ALLOWED_CIDRS || "",
    scope: 'ENVIRONMENT' as const,
  },
  {
    name: 'kubeWorkerNodes',
    type: 'text' as const,
    message:
      `Kubernetes worker node hostnames or IPs (comma-separated, default: no worker nodes)`,
    valueType: 'VARIABLE' as const,
    // validate: notEmpty,
    valueLabel: 'KUBE_WORKER_NODES',
    initial: process.env.KUBE_WORKER_NODES || '',
    scope: 'ENVIRONMENT' as const,
  },
]

export const staticSSLCertQuestions = [
  {
    name: 'sslCrt',
    type: 'text' as const,
    message:
      'Provide SSL Certificate or Certificate chain:',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SSL_CRT',
    initial: process.env.SSL_CRT,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'sslKey',
    type: 'text' as const,
    message:
      'Provide SSL Certificate key',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SSL_KEY',
    initial: process.env.SSL_KEY,
    scope: 'ENVIRONMENT' as const
  },
]

export const backupQuestions = [
  {
    name: 'backupHost',
    type: 'text' as const,
    message:
      `Please enter backup server host/IP address, (default: no backup):`,
    valueType: 'VARIABLE' as const,
    // validate: notEmpty,
    valueLabel: 'BACKUP_HOST',
    initial: process.env.BACKUP_HOST || '',
    scope: 'ENVIRONMENT' as const,
  },
  {
    name: 'backupUser',
    type: 'text' as const,
    message:
      `Please enter backup server user name:`,
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'BACKUP_SERVER_USER',
    initial: process.env.BACKUP_SERVER_USER || 'backup',
    scope: 'ENVIRONMENT' as const,
  },
  {
    name: 'backupType',
    type: 'select' as const,
    message: 'Select environment backup mode',
    choices: [
      {
        title: 'Full dump (daily full database backup)',
        value: 'dump'
      },
      {
        title: 'Differential (weekly full, daily diff backup)',
        value: 'differential'
      }
    ],
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'BACKUP_ENVIRONMENT_MODE',
    initial: process.env.BACKUP_ENVIRONMENT_MODE,
    scope: 'ENVIRONMENT' as const,
  },
]

export const diskQuestions = [
  {
    name: 'diskSpace',
    type: 'text' as const,
    message: `What is the amount of diskspace that should be dedicated to OpenCRVS data and will become the size of an encrypted cryptfs data directory.
    \n${kleur.red('DO NOT USE ALL DISKSPACE FOR OPENCRVS!')}
    \nLeave at least 50g available for OS use.`,
    valueType: 'VARIABLE' as const,
    validate: notEmpty,
    valueLabel: 'DISK_SPACE',
    initial: process.env.DISK_SPACE || '200g',
    scope: 'ENVIRONMENT' as const,
  },
]

export const databaseAndMonitoringQuestions = [
  {
    name: 'kibanaUsername',
    type: 'text' as const,
    message: 'Input the username for logging in to Kibana',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'KIBANA_USERNAME',
    initial: process.env.KIBANA_USERNAME || 'opencrvs-admin',
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'kibanaPassword',
    type: 'text' as const,
    message: 'Input the password for logging in to Kibana',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'KIBANA_PASSWORD',
    initial: process.env.KIBANA_PASSWORD || generateLongPassword(),
    scope: 'ENVIRONMENT' as const
  }
]

export const emailQuestions = [
  {
    name: 'smtpHost',
    type: 'text' as const,
    message: 'What is your SMTP host?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_HOST',
    initial: process.env.SMTP_HOST,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpUsername',
    type: 'text' as const,
    message: 'What is your SMTP username?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_USERNAME',
    initial: process.env.SMTP_USERNAME,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpPassword',
    type: 'text' as const,
    message: 'What is your SMTP password?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_PASSWORD',
    initial: process.env.SMTP_PASSWORD,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpPort',
    type: 'text' as const,
    message: 'What is your SMTP port?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_PORT',
    initial: process.env.SMTP_PORT,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'smtpSecure',
    type: 'select' as const,
    message: 'Is the SMTP connection made securely using TLS?',
    choices: [
      {
        title: 'True',
        value: 'true'
      },
      {
        title: 'False',
        value: 'false'
      }
    ],
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SMTP_SECURE',
    initial: process.env.SMTP_SECURE,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'senderEmailAddress',
    type: 'text' as const,
    message: 'What is your sender email address?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SENDER_EMAIL_ADDRESS',
    initial: process.env.SENDER_EMAIL_ADDRESS,
    scope: 'ENVIRONMENT' as const
  },
  {
    name: 'alertEmail',
    type: 'text' as const,
    message:
      'What is the email address to receive alert emails or a Slack channel email link?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'ALERT_EMAIL',
    initial: process.env.ALERT_EMAIL,
    scope: 'ENVIRONMENT' as const
  }
]

export const sentryQuestions = [
  {
    name: 'sentryDsn',
    type: 'text' as const,
    message: 'What is your Sentry DSN?',
    valueType: 'SECRET' as const,
    validate: notEmpty,
    valueLabel: 'SENTRY_DSN',
    initial: process.env.SENTRY_DSN,
    scope: 'ENVIRONMENT' as const
  }
]

export const metabaseAdminQuestions = [
  {
    valueType: 'SECRET' as const,
    name: 'OPENCRVS_METABASE_ADMIN_EMAIL',
    type: 'text' as const,
    message:
      'Email for Metabase super admin. Used as a username when logging in to the dashboard',
    valueLabel: 'OPENCRVS_METABASE_ADMIN_EMAIL',
    scope: 'ENVIRONMENT' as const,
    initial: 'user@opencrvs.org'
  },
  {
    valueType: 'SECRET' as const,
    name: 'OPENCRVS_METABASE_ADMIN_PASSWORD',
    type: 'text' as const,
    message: 'Password for Metabase super admin.',
    valueLabel: 'OPENCRVS_METABASE_ADMIN_PASSWORD',
    scope: 'ENVIRONMENT' as const,
    initial: generateLongPassword()
  }
]
