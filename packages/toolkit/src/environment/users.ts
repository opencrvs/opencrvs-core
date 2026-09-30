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

import * as fs from 'fs'
/* eslint-disable no-console */
import * as path from 'path'

import kleur from 'kleur'
import { manageUsers } from './manage-users'
import { warn } from './logger'
import { getEnvironmentInventoryPath } from './paths'

async function select<Value = string>(options: any): Promise<Value> {
  const inquirer = await import('@inquirer/prompts')
  return inquirer.select(options)
}

/**
 * Allow user to select inventory file (environment from a list)
 *
 * @param {string} dirPath - Path to the inventory file
 *
 * * @returns {string} Inventory file
 */
async function selectInventoryFile(
  dirPath: string = './environments'
): Promise<string | null> {
  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    warn(`⚠️  No environment configuration directory found at ${dirPath}`)
    warn(
      'Hint: If this is a new infrastructure repository, run `opencrvs environment init` first.'
    )
    return null
  }

  const environments = fs
    .readdirSync(dirPath)
    .filter((entry) => {
      const filePath = path.join(dirPath, entry)
      return (
        fs.statSync(filePath).isDirectory() &&
        fs.existsSync(getEnvironmentInventoryPath(entry))
      )
    })
    .sort()

  if (environments.length === 0) {
    warn(`⚠️  No environment configuration files found at ${dirPath}`)
    warn(
      'Hint: If this is a new infrastructure repository, run `opencrvs environment init` first.'
    )
    return null
  }

  const choices = environments.map((environment) => ({
    name: environment,
    value: getEnvironmentInventoryPath(environment)
  }))

  const selectedFile = await select({
    message: 'Select environment (inventory file) to load users:',
    choices: choices
  })

  return selectedFile
}

export async function manageEnvironmentUsers() {
  console.log('\n', kleur.bold().underline('Manage users'), '\n')
  const inventory_file = await selectInventoryFile()
  if (!inventory_file) {
    return
  }
  await manageUsers(inventory_file)
}
