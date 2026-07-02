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

import fs, { readFileSync, writeFileSync } from 'fs'
import * as yaml from 'js-yaml';

import dotenv from 'dotenv'
import {
  Secret,
  Variable
} from './github'
import {
  Answers
} from './custom-types'


export function generateLongPassword() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = 16; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export function findExistingValue<T extends string>(
  name: string,
  type: T,
  scope: 'ENVIRONMENT' | 'REPOSITORY',
  existingValues: Array<Secret | Variable>
) {
  return existingValues.find(
    (value) =>
      value.name === name && value.type === type && value.scope === scope
  ) as
    | (T extends 'SECRET' ? Secret : T extends 'VARIABLE' ? Variable : never)
    | undefined
}

/**
 * Merges and stores secrets in `.env.{environment}` file.
 * Updates existing variables, preserves unchanged ones, adds new ones.
 * 
 * @param environment - Environment name (e.g., 'production')
 * @param answers - Variables to update: `[{ name: 'KEY', value: 'val' }]`
 * 
 * @example
 * storeSecrets('prod', [{ name: 'API_KEY', value: 'abc123' }]);
 */
export function storeSecrets(environment: string, answers: Answers) {
  let envConfig: Record<string, string> = {}
  try {
    envConfig = dotenv.parse(
      readFileSync(`${process.cwd()}/.env.${environment}`)
    )
  } catch (error) {
    envConfig = {}
  }

  const linesFromAnswers = answers.map(
    (update) => `${update.name}="${update.value}"`
  )
  const linesFromEnvConfig = Object.entries(envConfig)
    .filter(([name]) => !answers.find((update) => update.name === name))
    .map(([name, value]) => `${name}="${value}"`)

  const allLines = [...linesFromEnvConfig, ...linesFromAnswers].sort()

  writeFileSync(`.env.${environment}`, allLines.join('\n'))
}

export function readYamlFile(filePath: any): any {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return yaml.load(fileContent);
}

export function writeYamlFile(filePath: string, data: any) {
  try {
    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: -1,
      flowLevel: -1,  // Prevent flow style for arrays/objects
      noRefs: true,
      sortKeys: false
    });
    
    fs.writeFileSync(filePath, yamlContent, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write inventory file: ${error}`);
  }
}