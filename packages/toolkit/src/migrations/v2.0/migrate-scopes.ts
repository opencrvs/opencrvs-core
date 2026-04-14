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

import { Node, Project, SyntaxKind } from 'ts-morph'
import path from 'path'
import { getCwd } from '.'

const ROLES_FILE_RELATIVE_PATH = 'src/data-seeding/roles/roles.ts'
const SCOPES_PROPERTY_NAME = 'scopes'

function clearScopesArrays(rolesFilePath: string, project: Project): number {
  const sourceFile = project.getSourceFile(rolesFilePath)
  if (!sourceFile) return 0

  let clearedCount = 0

  const scopesProperties = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .filter((prop) => prop.getName() === SCOPES_PROPERTY_NAME)

  for (const scopesProp of scopesProperties) {
    const initializer = scopesProp.getInitializer()
    if (!initializer || !Node.isArrayLiteralExpression(initializer)) continue

    if (initializer.getElements().length === 0) continue

    initializer.replaceWithText('[]')
    clearedCount++
  }

  return clearedCount
}

async function main() {
  const cwd = getCwd()
  const srcDir = path.join(cwd, 'src')
  const rolesFilePath = path.join(cwd, ROLES_FILE_RELATIVE_PATH)

  console.log(`Scanning roles scopes in: ${rolesFilePath}`)

  const project = new Project({
    tsConfigFilePath: path.resolve(srcDir, '../tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFile = project.getSourceFile(rolesFilePath)
  if (!sourceFile) {
    console.log(
      `No roles file found at '${ROLES_FILE_RELATIVE_PATH}'. Nothing to do.`
    )
    return
  }

  const clearedCount = clearScopesArrays(rolesFilePath, project)

  if (clearedCount === 0) {
    console.log('No non-empty scopes arrays found. Nothing to do.')
    return
  }

  await sourceFile.save()
  console.log(
    `Done. Cleared ${clearedCount} role scope array(s) in '${ROLES_FILE_RELATIVE_PATH}'.`
  )
}

export { main }
