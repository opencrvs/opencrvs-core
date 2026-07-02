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

import * as fs from 'fs';
import * as path from 'path';

import kleur from 'kleur'
import { manageUsers } from './manage-users'
import { warn } from './logger'

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
  dirPath: string = './infrastructure/server-setup/inventory/'
): Promise<string | null> {
  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    warn(`⚠️  No environment configuration directory found at ${dirPath}`)
    warn('Hint: If this is a new infrastructure repository, run `opencrvs environment init` first.')
    return null
  }

  // Read and filter files
  const files = fs.readdirSync(dirPath)
    .filter(file => {
      const filePath = path.join(dirPath, file);
      const isFile = fs.statSync(filePath).isFile();
      const ext = path.extname(file).slice(1).toLowerCase();
      return isFile && (ext === 'yml' || ext === 'yaml');
    })
    .sort();

  if (files.length === 0) {
    warn(`⚠️  No environment configuration files found at ${dirPath}`)
    warn('Hint: If this is a new infrastructure repository, run `opencrvs environment init` first.')
    return null
  }

  // Create choices - remove extension from display
  const choices = files.map(file => ({
    name: path.basename(file, path.extname(file)),
    value: path.join(dirPath, file)
  }));

  const selectedFile = await select({
    message: 'Select environment (inventory file) to load users:',
    choices: choices
  });

  return selectedFile;
}

export async function manageEnvironmentUsers() {
  console.log('\n', kleur.bold().underline("Manage users"), '\n')
  const inventory_file = await selectInventoryFile();
  if (!inventory_file) {
    return
  }
  await manageUsers(inventory_file)
}
