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

import path from 'path'
import { Project } from 'ts-morph'
import { getCwd } from '.'

const ROLES_HANDLER_RELATIVE_PATH = 'src/data-seeding/roles/handler.ts'

async function main() {
  const rolesHandlerPath = path.join(getCwd(), ROLES_HANDLER_RELATIVE_PATH)

  const project = new Project({
    tsConfigFilePath: path.resolve(getCwd(), 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false
  })

  const sourceFile = project.getSourceFile(rolesHandlerPath)
  if (!sourceFile) {
    // eslint-disable-next-line no-console
    console.log(
      `No roles handler found at '${ROLES_HANDLER_RELATIVE_PATH}'. Nothing to do.`
    )
    return
  }

  let changed = false

  const constantsImport = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === '@countryconfig/constants'
  )
  if (constantsImport) {
    constantsImport.remove()
    changed = true
  }

  const rolesHandler = sourceFile.getFunction('rolesHandler')
  if (!rolesHandler) {
    // eslint-disable-next-line no-console
    console.log(
      `No rolesHandler export found in '${ROLES_HANDLER_RELATIVE_PATH}'. Nothing to do.`
    )
    return
  }

  const secondParam = rolesHandler.getParameters()[1]
  const secondParamName = secondParam?.getName()
  const responseToolkitIdentifier = secondParamName || 'h'

  const currentBodyText = rolesHandler.getBodyText()
  const normalizedCurrent = currentBodyText?.replace(/\s+/g, ' ').trim() ?? ''
  const normalizedDesired = `return ${responseToolkitIdentifier}.response(roles)`

  if (normalizedCurrent !== normalizedDesired) {
    rolesHandler.setBodyText(`return ${responseToolkitIdentifier}.response(roles)`)
    changed = true
  }

  if (!changed) {
    // eslint-disable-next-line no-console
    console.log(
      `No changes needed in '${ROLES_HANDLER_RELATIVE_PATH}'.`
    )
    return
  }

  await sourceFile.save()
  // eslint-disable-next-line no-console
  console.log(
    `Updated '${ROLES_HANDLER_RELATIVE_PATH}' to remove demo scope behavior while preserving file structure.`
  )
}

export { main }
