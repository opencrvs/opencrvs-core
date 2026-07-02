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

import { Octokit } from '@octokit/core'
import dotenv from 'dotenv'
import kleur from 'kleur'
import prompts, { PromptObject } from 'prompts'

async function confirm(options: any): Promise<boolean> {
  const inquirer = await import('@inquirer/prompts')
  return inquirer.confirm(options)
}

async function select<Value = string>(options: any): Promise<Value> {
  const inquirer = await import('@inquirer/prompts')
  return inquirer.select(options)
}

import {
  Secret,
  Variable,
  createEnvironment,
  createEnvironmentSecret,
  createRepositorySecret,
  createRepositoryVariable,
  createEnvironmentVariable,
  getRepositoryId,
  listEnvironmentSecrets,
  listEnvironmentVariables,
  listRepositorySecrets,
  listRepositoryVariables,
  updateEnvironmentVariable,
  updateRepositoryVariable,
  getRepositoryEnvironments
} from './github'

import { derivedVariables } from './derived-variables'
import { 
  generateLongPassword,
  findExistingValue,
  storeSecrets
} from './utils'


import { error, info, log, success, warn } from './logger'
import { generateInventory, copyChartsValues } from './templates'
import { generateSSHKeyPair } from "./ssh-keygen";
import {
  dockerhubQuestions,
  githubQuestions,
  githubTokenQuestion,
  githubOtherQuestions,
  infrastructureQuestions,
  staticSSLCertQuestions,
  countryQuestions,
  databaseAndMonitoringQuestions,
  diskQuestions,
  sentryQuestions,
  emailQuestions,
  metabaseAdminQuestions,
  backupQuestions,
} from './questions';

import {
  Question,
  QuestionDescriptor,
  SecretAnswer,
  VariableAnswer,
  Answer,
  Answers,
  AnswerWithNullValue
} from './custom-types'

import { askQuestionWithEditor } from './editor-questions'
import {
  selectWithCustom,
  getIndexFromChoices,
} from './questions-helper'
import { manageUsers } from './manage-users'

function questionToPrompt<T extends string>({
  // eslint-disable-next-line no-unused-vars
  valueType,
  // eslint-disable-next-line no-unused-vars
  valueLabel,
  // eslint-disable-next-line no-unused-vars
  scope,
  ...promptOptions
}: Question<T>): PromptObject<T> {
  return promptOptions
}

const ALL_QUESTIONS: Array<QuestionDescriptor<any>> = []
const ALL_ANSWERS: Array<Record<string, string>> = []

function getAnswers(existingValues: (Secret | Variable)[]): Answers {
  return ALL_ANSWERS.flatMap((answerObject) => {
    const questionsThatAreSecretsOrVariables = Object.entries(
      answerObject
    ).filter(([key, value]) => {
      if (value === '') {
        return false
      }
      const existingQuestion = ALL_QUESTIONS.find(
        (question) => question.name === key
      )
      const valueType = existingQuestion?.valueType
      return valueType === 'VARIABLE' || valueType === 'SECRET'
    })

    return questionsThatAreSecretsOrVariables.map(([key, value]) => {
      const existingQuestion = ALL_QUESTIONS.find(
        (question) => question.name === key
      )
      const valueType = existingQuestion!.valueType!

      if (valueType === 'SECRET') {
        const existingSecret = findExistingValue(
          existingQuestion!.valueLabel!,
          'SECRET',
          existingQuestion?.scope!,
          existingValues
        )
        return {
          type: valueType,
          name: existingQuestion?.valueLabel!,
          value: value.toString(),
          didExist: existingSecret,
          scope: existingQuestion!.scope!
        }
      }
      const existingVariable = findExistingValue(
        existingQuestion?.valueLabel!,
        valueType,
        existingQuestion?.scope!,
        existingValues
      )
      return {
        type: valueType,
        name: existingQuestion?.valueLabel!,
        didExist: findExistingValue(
          existingQuestion?.valueLabel!,
          valueType,
          existingQuestion?.scope!,
          existingValues
        ),
        value: value.toString() || existingVariable?.value || '',
        scope: existingQuestion!.scope!
      }
    })
  })
}

async function promptAndStoreAnswer(
  environment: string,
  questions: Array<QuestionDescriptor<any>>,
  existingValues: Array<Secret | Variable>
) {
  log('')
  const processedQuestions = questions.flatMap((question) => {
    const questionWithVariableLabel = {
      ...question,
      message: `${kleur.cyan(question.valueLabel || '')}: ${question.message}`
    }
    if (!questionWithVariableLabel.valueLabel) {
      return questionWithVariableLabel
    }

    if (questionWithVariableLabel.valueType === 'VARIABLE') {
      const existingVariable = findExistingValue(
        questionWithVariableLabel.valueLabel,
        'VARIABLE',
        questionWithVariableLabel.scope,
        existingValues
      )
      if (existingVariable) {
        let initial_value: string | number = existingVariable.value
        // Get correct initial value for select questions
        if (questionWithVariableLabel.type === 'select' && Array.isArray(questionWithVariableLabel.choices)) {
          initial_value = getIndexFromChoices(questionWithVariableLabel.choices, existingVariable.value)
        }
        
        return [
          {
            name: 'overWrite' + questionWithVariableLabel.name,
            type: 'confirm' as const,
            scope: questionWithVariableLabel.scope,
            message: `${kleur.yellow(
              `Variable ${kleur.cyan(
                existingVariable.name
              )} already exists in Github. Do you want to update it?`
            )}`
          },
          {
            ...questionWithVariableLabel,
            type: ((prev: boolean) =>
              prev ? questionWithVariableLabel.type : null) as any,
            initial: initial_value
          }
        ]
      }
    }

    if (questionWithVariableLabel.valueType === 'SECRET') {
      const existingSecret = findExistingValue(
        questionWithVariableLabel.valueLabel,
        'SECRET',
        questionWithVariableLabel.scope,
        existingValues
      )

      if (existingSecret) {
        return [
          {
            name: 'overWrite' + questionWithVariableLabel.name,
            type: 'confirm' as const,
            scope: questionWithVariableLabel.scope,
            message: `${kleur.yellow(
              `${existingSecret.scope === 'REPOSITORY'
                ? 'Repository secret'
                : 'Secret'
              } ${kleur.cyan(
                existingSecret.name
              )} already exists in Github. Do you want to update it?`
            )}`
          },
          {
            ...questionWithVariableLabel,
            type: ((prev: boolean) =>
              prev ? questionWithVariableLabel.type : null) as any
          }
        ]
      }
    }
    return questionWithVariableLabel
  })

  const promptQuestions = processedQuestions.map(questionToPrompt)

  const result = await prompts(promptQuestions, {
    onCancel: () => {
      process.exit(1)
    }
  })

  ALL_ANSWERS.push(result)

  storeSecrets(environment, getAnswers(existingValues))

  const existingValuesForQuestions = questions
    // Only variables can have previous values we can use
    .filter((question) => question.valueType === 'VARIABLE')
    .map((question) => [
      question.name,
      findExistingValue(
        question.valueLabel!,
        'VARIABLE',
        question.scope,
        existingValues
      )?.value
    ])

  return { ...Object.fromEntries(existingValuesForQuestions), ...result }
}



ALL_QUESTIONS.push(
  ...githubTokenQuestion,
  ...githubOtherQuestions,
  ...dockerhubQuestions,
  ...diskQuestions,
  ...infrastructureQuestions,
  ...backupQuestions,
  ...countryQuestions,
  ...databaseAndMonitoringQuestions,
  ...emailQuestions,
  ...sentryQuestions,
  ...derivedVariables,
  ...metabaseAdminQuestions
)

; (async () => {
    log('\n', kleur.bold().underline('Github'), '\n')
    const { githubOrganisation, githubRepository } = await prompts(
      githubQuestions.map(questionToPrompt),
      {
        onCancel: () => {
          process.exit(1)
        }
      }
    )

    const { githubToken } = await promptAndStoreAnswer(
      '',
      githubTokenQuestion,
      []
    )

    const octokit = new Octokit({
      auth: githubToken
    })
    log(kleur.green('\nSuccessfully logged in to Github\n'))
    let existingEnvironments = await getRepositoryEnvironments(octokit, githubOrganisation, githubRepository);

    let defaultChoices = [
            { name: 'Development', value: 'development' },
            { name: 'Quality assurance (no PII data)', value: 'qa' },
            {
              name: 'Staging (hosts PII data, no backups)',
              value: 'staging'
            },
            {
              name: 'Production (hosts PII data, requires frequent backups)',
              value: 'production'
            },
          ]
    // Add only environments that are not already present
    const choices = [
      ...defaultChoices,
      ...existingEnvironments
        .filter(
          (env) => !defaultChoices.some((choice) => choice.value === env)
        )
        .map((env) => ({
          name: env,
          value: env
        }))
    ];
    const environment = await selectWithCustom(
          {
          message: 'Choose a name and purpose for the environment?',
          choices: choices
        }
    )
    let environment_type = 'non-production'
    if (['development', 'qa'].includes(environment)) {
        environment_type = 'non-production'
    } else if (['staging', 'production'].includes(environment)) {
        environment_type = 'production'
    } else {
        environment_type = await select(
          {
            message: 'Purpose for the environment?',
            choices: [
            { name: 'Development/Quality assurance/Testing (no PII data)', value: 'non-production' },
            { name: 'Staging/Production (hosts PII data, requires frequent backups)', value: 'production' },
            ],
          }
        )
    }
    const environment_exists = existingEnvironments
      .map((e) => e.trim())
      .includes(environment);
    if (!environment) {
        process.exit(1)
      }
    // Read users .env file based on the environment name they gave above, e.g. .env.production
    dotenv.config({
      path: `${process.cwd()}/.env.${environment}`
    })

    await createEnvironment(
      octokit,
      environment,
      githubOrganisation,
      githubRepository
    )

    const repositoryId = await getRepositoryId(
      octokit,
      githubOrganisation,
      githubRepository
    )

    const existingRepositorySecrets = await listRepositorySecrets(
      octokit,
      githubOrganisation,
      githubRepository
    )
    const existingRepositoryVariables = await listRepositoryVariables(
      octokit,
      githubOrganisation,
      githubRepository
    )
    const existingEnvironmentVariables = await listEnvironmentVariables(
      octokit,
      repositoryId,
      environment
    )

    const existingEnvironmentSecrets = await listEnvironmentSecrets(
      octokit,
      githubOrganisation,
      repositoryId,
      environment
    )

    const existingValues = [
      ...existingEnvironmentVariables,
      ...existingRepositoryVariables,
      ...existingRepositorySecrets,
      ...existingEnvironmentSecrets
    ]

    if (
      existingEnvironmentVariables.length > 0 ||
      existingEnvironmentSecrets.length > 0
    ) {
      log(
        '\nEnvironment with the name',
        environment,
        'already exists in Github.',
        '\nFound',
        existingEnvironmentVariables.length,
        'existing variables and',
        existingEnvironmentSecrets.length,
        'secrets'
      )
    }
    if (environment_type === 'production') {
      log('\n', kleur.yellow().bold(
        'WARNING! You are setting up a production environment.\n Make sure you have read the deployment guide carefully before proceeding.\n'
      ))
      await promptAndStoreAnswer(environment, githubOtherQuestions, existingValues)
    }

    log('\n', kleur.bold().underline('Docker Hub'))
    await promptAndStoreAnswer(environment, dockerhubQuestions, existingValues)

    log('\n', kleur.bold().underline('Kubernetes & Runtime'))

    const infrastructure = await promptAndStoreAnswer(
      environment,
      infrastructureQuestions,
      existingValues
    )
    const kubeWorkerNodes = infrastructure.kubeWorkerNodes
      ? infrastructure.kubeWorkerNodes.split(',').map((ip: string) => ip.trim()) : []

    log('\n', kleur.bold().underline('SSH Users'), '\n')
    const users = await manageUsers(`infrastructure/server-setup/inventory/${environment}.yml`)


    log('\n', kleur.bold().underline('Traefik SSL Certificate'), '\n')
    const sslCertExists = findExistingValue(
      'SSL_CRT',
      'SECRET',
      'ENVIRONMENT',
      existingValues
    )

    let ssl_answers: AnswerWithNullValue[] = [];
    const traefikConfOption = (await prompts(
        [
          {
            name: 'traefikConfOption',
            type: 'select' as const,
            message: 'Choose option to configure Traefik SSL Certificate',
            choices: [
              {title: "Let's Encrypt certificate", value: 'lets_encrypt'},
              {title: "Static SSL certificate", value: 'static_ssl'},
              {title: "Custom configuration", value: 'custom'}
            ],
            initial: sslCertExists ? 1 : 0
          }
        ])
      ).traefikConfOption
    if (traefikConfOption === "static_ssl") {
      ssl_answers = await askQuestionWithEditor(staticSSLCertQuestions, existingEnvironmentSecrets)
    }
    
    log('\n', kleur.bold().underline('Storage'), '\n')

    let enableEncryption = false
    const encryption_key_defined = findExistingValue(
      'ENCRYPTION_KEY',
      'SECRET',
      'ENVIRONMENT',
      existingValues
    )
    if (!encryption_key_defined && !environment_exists) {
      const answers_enable_encryption = await prompts(
        [
          {
            name: 'enableEncryption',
            type: 'confirm' as const,
            message: 'Do you want to enable disk encryption?',
            scope: 'ENVIRONMENT' as const,
            initial: Boolean(process.env.ENABLE_ENCRYPTION)
          }
        ].map(questionToPrompt)
      )
      enableEncryption = answers_enable_encryption.enableEncryption
    }
    if (enableEncryption && !encryption_key_defined && !environment_exists) {
      log(kleur.bold().green('✔'), kleur.bold().yellow(' Disk encryption is enabled'))
      await promptAndStoreAnswer(environment, diskQuestions, existingValues)
    } else {
      if (!enableEncryption && !encryption_key_defined && environment_exists) {
        log(kleur.bold().green('✔'), kleur.bold().grey(`Environment ${environment} is already configured, skipping disk encryption question`))
      }
      const DISK_SPACE = findExistingValue(
        'DISK_SPACE',
        'VARIABLE',
        'ENVIRONMENT',
        existingValues
      )
      if (!DISK_SPACE) {
        log(kleur.bold().green('✔'), kleur.bold().grey('All available disk space at /data will be used'))
      } else {
        log(kleur.bold().green('✔'), kleur.bold().yellow('Variable DISK_SPACE is read-only, allocated space:'), DISK_SPACE?.value)
      }
    }

    // Backup and restore configuration
    let backupHost = findExistingValue(
      'BACKUP_HOST',
      'VARIABLE',
      'ENVIRONMENT',
      existingValues
    )?.value || ''
    let backupType = ''

    let restoreEnvironmentName = findExistingValue(
      'RESTORE_ENVIRONMENT_NAME',
      'VARIABLE',
      'ENVIRONMENT',
      existingValues
    )?.value
    let restoreType = findExistingValue(
      'RESTORE_ENVIRONMENT_MODE',
      'VARIABLE',
      'ENVIRONMENT',
      existingValues
    )?.value || process.env.RESTORE_ENVIRONMENT_MODE || 'dump'

    log('\n', kleur.bold().underline('Backup'))
    let configureBackup = backupHost ? true : false
    // Ask question only if backup and restore are not configured
    if (!configureBackup && !restoreEnvironmentName) {
      configureBackup = await confirm({
          message: 'Do you want to configure backup?',
          default: Boolean(process.env.CONFIGURE_BACKUP)
        })
    }

    let backupHostPrivateKey = ''
    let backupHostPublicKey = ''
    if (configureBackup) {
      const backupAnswers = (await promptAndStoreAnswer(
        environment,
        backupQuestions,
        existingValues
      ))
      let backupHostPrivateKeyExists = findExistingValue(
        'BACKUP_HOST_PRIVATE_KEY',
        'SECRET',
        'ENVIRONMENT',
        existingValues
      )
      backupType = backupAnswers.backupType
      backupHost = backupAnswers.backupHost || backupHost
      if (!backupHostPrivateKeyExists) {
        const { publicKey, privateKey } = generateSSHKeyPair();
        backupHostPublicKey = publicKey;
        backupHostPrivateKey = privateKey;
        log(kleur.bold().green('✔'), kleur.bold().yellow(`Generated new SSH key pair for backup host: ${backupHost}`))
      }
    } else {
      log(kleur.bold().green('✔'), kleur.bold().yellow('Backup is disabled'))
    }

    log('\n', kleur.bold().underline('Restore'))
    let configureRestore = restoreEnvironmentName ? true : false
    if (!restoreEnvironmentName && !configureBackup) {
      configureRestore = await confirm({
          message: 'Do you want to configure restore?',
          default: Boolean(process.env.CONFIGURE_RESTORE)
        })
    }
    if (configureRestore) {
        const env_list_filtered = existingEnvironments.filter(env => env !== environment);
        restoreEnvironmentName = await selectWithCustom({
              message: 'What is the name of your environment to restore?',
              choices: env_list_filtered.map(env => ({
                name: env,
                value: env
              })),
              initial: restoreEnvironmentName
            },
        )
        restoreType = await select(
          { message: `Select ${kleur.yellow().bold(restoreEnvironmentName)} environment backup mode`,
              choices: [
                {
                  name: 'Full dump (daily full database backup)',
                  value: 'dump'
                },
                {
                  name: 'Differential (weekly full, daily diff backup)',
                  value: 'differential'
                }
              ]}
        )
      }
    else {
      log(kleur.bold().green('✔'), kleur.bold().yellow('Restore is disabled'))
    }

    log('\n', kleur.bold().underline('Monitoring'))
    await promptAndStoreAnswer(
      environment,
      databaseAndMonitoringQuestions,
      existingValues
    )
    const sentryDSNExists = findExistingValue(
      'SENTRY_DSN',
      'SECRET',
      'ENVIRONMENT',
      existingValues
    )

    log('\n', kleur.bold().underline('Sentry'))
    if (sentryDSNExists) {
      await promptAndStoreAnswer(environment, sentryQuestions, existingValues)
    } else {
      const { useSentry } = await prompts(
        [
          {
            name: 'useSentry',
            type: 'confirm' as const,
            message: 'Do you want to use Sentry?',
            initial: Boolean(process.env.SENTRY_DNS)
          }
        ]
      )

      if (useSentry) {
        await promptAndStoreAnswer(environment, sentryQuestions, existingValues)
      }
    }

    log('\n', kleur.bold().underline('METABASE ADMIN'))
    await promptAndStoreAnswer(
      environment,
      metabaseAdminQuestions,
      existingValues
    )

    log('\n', kleur.bold().underline('SMTP'))
    await promptAndStoreAnswer(environment, emailQuestions, existingValues)

    const allAnswers = ALL_ANSWERS.reduce((acc, answer) => {
      return { ...acc, ...answer }
    })

    /*
     * Variables the user doesn't need to set manually
     */
    const answerOrExisting = (
      variable: string | undefined,
      existingValue: Variable | undefined,
      // eslint-disable-next-line no-unused-vars
      fn: (value: string | undefined) => string
    ) => fn(variable || existingValue?.value) || ''

    function findExistingOrDefine(
      name: string,
      type: 'SECRET' | 'VARIABLE',
      scope: 'REPOSITORY' | 'ENVIRONMENT',
      newValue: string
    ) {
      return findExistingValue(name, type, scope, existingValues)
        ? null
        : process.env[name] || newValue
    }

    const derivedUpdates: AnswerWithNullValue[] = [
      {
        name: 'GH_ENCRYPTION_PASSWORD',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'GH_ENCRYPTION_PASSWORD',
          'SECRET',
          'REPOSITORY',
          existingValues
        ),
        value: findExistingOrDefine(
          'GH_ENCRYPTION_PASSWORD',
          'SECRET',
          'REPOSITORY',
          generateLongPassword()
        ),
        scope: 'REPOSITORY' as const
      },
    ]
    derivedUpdates.push({
        name: 'NOTIFICATION_TRANSPORT',
        type: 'VARIABLE' as const,
        didExist: findExistingValue(
          'NOTIFICATION_TRANSPORT',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'NOTIFICATION_TRANSPORT',
          'VARIABLE',
          'ENVIRONMENT',
          'email'
        ),
        scope: 'ENVIRONMENT' as const
      })
    derivedUpdates.push(...ssl_answers)
    if (configureBackup) {
      derivedUpdates.push({
        name: 'BACKUP_ENCRYPTION_PASSPHRASE',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'BACKUP_ENCRYPTION_PASSPHRASE',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'BACKUP_ENCRYPTION_PASSPHRASE',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      })
    }

    const applicationServerUpdates = [
      {
        name: 'ELASTICSEARCH_SUPERUSER_PASSWORD',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'ELASTICSEARCH_SUPERUSER_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'ELASTICSEARCH_SUPERUSER_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'KIBANA_SYSTEM_PASSWORD',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'KIBANA_SYSTEM_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'KIBANA_SYSTEM_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'MINIO_ROOT_USER',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'MINIO_ROOT_USER',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'MINIO_ROOT_USER',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'MINIO_ROOT_PASSWORD',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'MINIO_ROOT_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'MINIO_ROOT_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'MONGODB_ADMIN_USER',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'MONGODB_ADMIN_USER',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'MONGODB_ADMIN_USER',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'MONGODB_ADMIN_PASSWORD',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'MONGODB_ADMIN_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'MONGODB_ADMIN_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'POSTGRES_USER',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'POSTGRES_USER',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'POSTGRES_USER',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'POSTGRES_PASSWORD',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'POSTGRES_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'POSTGRES_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        name: 'SUPER_USER_PASSWORD',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'SUPER_USER_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'SUPER_USER_PASSWORD',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        type: 'VARIABLE' as const,
        name: 'ACTIVATE_USERS',
        value: 'production' === environment_type ? 'false' : 'true',
        didExist: findExistingValue(
          'ACTIVATE_USERS',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        type: 'VARIABLE' as const,
        name: 'COUNTRY_CONFIG_HOST',
        value: answerOrExisting(
          allAnswers.domain,
          findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
          (val) => `https://countryconfig.${val}`
        ),
        didExist: findExistingValue(
          'COUNTRY_CONFIG_HOST',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        type: 'VARIABLE' as const,
        name: 'GATEWAY_HOST',
        value: answerOrExisting(
          allAnswers.domain,
          findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
          (val) => `https://gateway.${val}`
        ),
        didExist: findExistingValue(
          'GATEWAY_HOST',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        type: 'VARIABLE' as const,
        name: 'CONTENT_SECURITY_POLICY_WILDCARD',
        value: answerOrExisting(
          allAnswers.domain,
          findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
          (val) => `*.${val}`
        ),
        didExist: findExistingValue(
          'CONTENT_SECURITY_POLICY_WILDCARD',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        type: 'VARIABLE' as const,
        name: 'CLIENT_APP_URL',
        value: answerOrExisting(
          allAnswers.domain,
          findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
          (val) => `https://register.${val}`
        ),
        didExist: findExistingValue(
          'CLIENT_APP_URL',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        type: 'VARIABLE' as const,
        name: 'LOGIN_URL',
        value: answerOrExisting(
          allAnswers.domain,
          findExistingValue('DOMAIN', 'VARIABLE', 'ENVIRONMENT', existingValues),
          (val) => `https://login.${val}`
        ),
        didExist: findExistingValue(
          'LOGIN_URL',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        scope: 'ENVIRONMENT' as const
      },
      {
        type: 'VARIABLE' as const,
        name: 'RESTORE_ENVIRONMENT_NAME',
        value: answerOrExisting(restoreEnvironmentName, findExistingValue(
          'RESTORE_ENVIRONMENT_NAME',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ), (val) => val || ''),
        didExist: findExistingValue(
          'RESTORE_ENVIRONMENT_NAME',
          'VARIABLE',
          'ENVIRONMENT',
          existingValues
        ),
        scope: 'ENVIRONMENT' as const
      }
    ]

    if (enableEncryption) {
      applicationServerUpdates.push({
        name: 'ENCRYPTION_KEY',
        type: 'SECRET' as const,
        didExist: findExistingValue(
          'ENCRYPTION_KEY',
          'SECRET',
          'ENVIRONMENT',
          existingValues
        ),
        value: findExistingOrDefine(
          'ENCRYPTION_KEY',
          'SECRET',
          'ENVIRONMENT',
          generateLongPassword()
        ),
        scope: 'ENVIRONMENT' as const
      })
    }

    if (configureBackup && backupHostPrivateKey && backupHostPublicKey) {
      applicationServerUpdates.push({
        name: 'BACKUP_HOST_PRIVATE_KEY',
        type: 'SECRET' as const,
        didExist: undefined,
        value: backupHostPrivateKey,
        scope: 'ENVIRONMENT' as const
      })
      applicationServerUpdates.push({
        name: 'BACKUP_HOST_PUBLIC_KEY',
        type: 'SECRET' as const,
        didExist: undefined,
        value: backupHostPublicKey,
        scope: 'ENVIRONMENT' as const
      })
    }

    derivedUpdates.push(...applicationServerUpdates)


    const updates = getAnswers(existingValues)
      .concat(
        ...derivedUpdates.filter(
          (update): update is Answer => update.value !== null
        )
      )
      .filter(
        (variable) =>
          Boolean(variable.value) &&
          // Only update values that changed
          (variable.type !== 'VARIABLE' ||
            variable.value !== variable.didExist?.value)
      )

    storeSecrets(environment, updates)

    /*
     * List out all updates to the variables and confirm with the user
     */

    const newSecrets = updates.filter(
      (update): update is SecretAnswer =>
        update.type === 'SECRET' && !update.didExist
    )
    const updatedSecrets = updates.filter(
      (update): update is SecretAnswer =>
        update.type === 'SECRET' && Boolean(update.didExist)
    )
    const newVariables = updates.filter(
      (update): update is VariableAnswer =>
        update.type === 'VARIABLE' && !update.didExist
    )
    const updatedVariables = updates.filter(
      (update): update is VariableAnswer =>
        update.type === 'VARIABLE' && Boolean(update.didExist)
    )

    const unknownVariables = existingValues.filter((value) => {
      return !ALL_QUESTIONS.find(
        (question) =>
          question.valueLabel === value.name &&
          question.valueType === value.type &&
          question.scope === value.scope
      )
    })

    log('')

    if (newSecrets.length > 0) {
      log(
        kleur.yellow(
          `The following secrets will be added to Github for environment ${environment}:`
        )
      )
      newSecrets
        .filter(({ scope }) => scope === 'ENVIRONMENT')
        .forEach((secret) => {
          log(secret.name, '=', secret.value)
        })
      log('')
      log(
        kleur.yellow(`The following secrets will be added to Github repository:`)
      )
      newSecrets
        .filter(({ scope }) => scope === 'REPOSITORY')
        .forEach((secret) => {
          log(secret.name, '=', secret.value)
        })
      log('')
    }
    if (updatedSecrets.length > 0) {
      log(
        kleur.yellow(
          `The following secrets will be updated in Github for environment ${environment}:`
        )
      )
      updatedSecrets.forEach((secret) => {
        log(secret.name, '=', secret.value)
      })
      log('')
    }
    if (newVariables.length > 0) {
      log(
        kleur.yellow(
          `The following variables will be added to Github for environment ${environment}:`
        )
      )
      newVariables.forEach((variable) => {
        log(variable.name, '=', variable.value)
      })
      log('')
    }
    if (updatedVariables.length > 0) {
      log(
        kleur.yellow(
          `The following variables will be updated in Github for environment ${environment}:`
        )
      )

      updatedVariables.forEach((variable) => {
        log(
          variable.name,
          '=',
          variable.value,
          `(was ${variable.didExist?.value})`
        )
      })
      log('')
    }

    if (unknownVariables.length > 0) {
      log(
        kleur.yellow(
          `The following unknown variables/secrets were stored in Github are not managed by this script:`
        )
      )
      log('')
      log(kleur.blue(`Repository:`))

      unknownVariables
        .filter(({ scope }) => scope === 'REPOSITORY')
        .forEach((variable) => {
          log(kleur.cyan(variable.type) + ':', variable.name)
        })

      log('')
      log(kleur.blue(`Environment:`))

      unknownVariables
        .filter(({ scope }) => scope === 'ENVIRONMENT')
        .forEach((variable) => {
          log(kleur.cyan(variable.type) + ':', variable.name)
        })

      log('')
      log(
        kleur.yellow(
          `These variables will not be updated by this script. If you want to update them, you will need to do so manually.`
        )
      )
      log('')
    }

    if (
      ([] as Array<any>)
        .concat(newSecrets)
        .concat(updatedSecrets)
        .concat(newVariables)
        .concat(updatedVariables).length === 0
    ) {
      process.exit(0)
    }

    const saveChanges = await confirm({
        message: 'Do you want to continue?',
        default: true
      })

    if (!saveChanges) {
      process.exit(0)
    }

    for (const newSecret of newSecrets) {
      log(`Creating secret ${newSecret.name} with value ${newSecret.value}`)
      if (newSecret.scope === 'ENVIRONMENT') {
        await createEnvironmentSecret(
          octokit,
          repositoryId,
          environment,
          newSecret.name,
          newSecret.value,
          githubOrganisation,
          githubRepository
        )
      } else {
        await createRepositorySecret(
          octokit,
          repositoryId,
          newSecret.name,
          newSecret.value,
          githubOrganisation,
          githubRepository
        )
      }
    }
    for (const updatedSecret of updatedSecrets) {
      log(
        `Updating secret ${updatedSecret.name} with value ${updatedSecret.value}`
      )
      if (updatedSecret.scope === 'ENVIRONMENT') {
        await createEnvironmentSecret(
          octokit,
          repositoryId,
          environment,
          updatedSecret.name,
          updatedSecret.value,
          githubOrganisation,
          githubRepository
        )
      } else {
        await createRepositorySecret(
          octokit,
          repositoryId,
          updatedSecret.name,
          updatedSecret.value,
          githubOrganisation,
          githubRepository
        )
      }
    }

    for (const newVariable of newVariables) {
      log(`Creating variable ${newVariable.name} with value ${newVariable.value}`)
      if (newVariable.scope === 'ENVIRONMENT') {
        await createEnvironmentVariable(
          octokit,
          repositoryId,
          environment,
          newVariable.name,
          newVariable.value
        )
      } else {
        await createRepositoryVariable(
          octokit,
          repositoryId,
          newVariable.name,
          newVariable.value
        )
      }

    }

    for (const updatedVariable of updatedVariables) {
      log(
        `Updating variable ${updatedVariable.name} with value ${updatedVariable.value}`
      )
      if (updatedVariable.scope === 'ENVIRONMENT') {
        await updateEnvironmentVariable(
          octokit,
          repositoryId,
          environment,
          updatedVariable.name,
          updatedVariable.value
        )
      } else {
        await updateRepositoryVariable(
          octokit,
          repositoryId,
          updatedVariable.name,
          updatedVariable.value
        )
      }
    }

    log(
      kleur.green(
        `Successfully updated Github secrets and variables for environment ${environment}`
      )
    )

    log('\n', kleur.bold().underline('Running configuration files updates'))
    generateInventory(
      environment,
      {
        kube_worker_nodes: kubeWorkerNodes,
        kube_api_host: infrastructure.kubeAPIHost || '',
        backup_host: backupHost || '',
        users: users
      }
    )
    copyChartsValues(
      environment,
      {
        env: environment,
        environment_type: environment_type,
        // FIXME: In general that should be environment_type,
        // Hardcode like this blocks us from being generic:
        // https://github.com/opencrvs/opencrvs-core/issues/11171
        two_fa_enabled: environment !== 'production' ? false : true,
        backup_enabled: configureBackup ? true : false,
        restore_enabled: restoreEnvironmentName ? true : false,
        restore_environment_name: restoreEnvironmentName || "",
        restore_type: restoreType,
        traefik_mode: traefikConfOption,
        backup_type: backupType
      }
    )
    let addon_message = kubeWorkerNodes.length > 0 || configureBackup ? 
      "--------------------------------------------------------------------------------------------\n" +
      `\n➡️ ${kleur.bold().yellow('COPY the SSH public key from the master VM to your clipboard')}\n` +
      "--------------------------------------------------------------------------------------------\n" : ""
    addon_message += kubeWorkerNodes.length > 0 ?
      `➡️ ${kleur.bold().yellow('Run following command on Kubernetes worker VM to create provision user and setup SSH key:')}\n` +
      "\n" +
      "curl -sfL https://raw.githubusercontent.com/opencrvs/infrastructure/refs/heads/develop/scripts/bootstrap/opencrvs-bootstrap.sh -o opencrvs-bootstrap.sh && \\ \n" +
      `bash opencrvs-bootstrap.sh --ssh-public-key "${kleur.bold('[PUT PROVISION USER PUBLIC KEY FROM MASTER NODE]')}"\n` : ""

    addon_message += configureBackup ? 
      `\n➡️ ${kleur.bold().yellow('Run following command on backup server to create provision user and setup SSH key:')}\n` +
      "curl -sfL https://raw.githubusercontent.com/opencrvs/infrastructure/refs/heads/develop/scripts/bootstrap/opencrvs-bootstrap.sh -o opencrvs-bootstrap.sh && \\ \n" +
      `bash opencrvs-bootstrap.sh --ssh-public-key "${kleur.bold('[PUT PROVISION USER PUBLIC KEY FROM MASTER NODE]')}"` : ""

  log(`
${kleur.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
Follow the steps below to complete the setup of your environment:
${kleur.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
➡️ ${kleur.bold().yellow('Run following command on Kubernetes master VM to bootstrap self-hosted runner:')}

curl -sfL https://raw.githubusercontent.com/opencrvs/infrastructure/refs/heads/develop/scripts/bootstrap/opencrvs-bootstrap.sh -o opencrvs-bootstrap.sh && \\
bash opencrvs-bootstrap.sh --owner ${githubOrganisation} \\
            --repo ${githubRepository} \\
            --env ${environment} \\
            --token ${githubToken} \\
            --enable-runner

${addon_message}

${kleur.yellow('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')}
${kleur.yellow('Please KINDLY read hints above')}
    `)
    log('\nAll variables stored in', kleur.cyan(`.env.${environment}`))
    log(kleur.bold().yellow('DO NOT COMMIT THIS FILE TO GIT!'))
  })()
