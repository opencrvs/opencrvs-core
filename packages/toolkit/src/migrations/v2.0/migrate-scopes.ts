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

import { Node, Project, SyntaxKind, Expression } from 'ts-morph'
import path from 'path'
import {
  migrateLegacyScopesArrayToV2Scopes,
  SCOPES
} from '@opencrvs/commons/scopes.deprecated.do-not-use'
const ROLES_FILE_RELATIVE_PATH = 'src/data-seeding/roles/roles.ts'
const SCOPES_PROPERTY_NAME = 'scopes'
const TOOLKIT_SCOPES_MODULE = '@opencrvs/toolkit/scopes'
const DEFINE_SCOPES_IMPORT_NAME = 'defineScopes'
const DEFINE_ROLES_IMPORT_NAME = 'defineRoles'

function resolveScopeKeyFromElementAccess(element: Expression): string | null {
  if (
    Node.isPropertyAccessExpression(element) &&
    element.getExpression().getText() === 'SCOPES'
  ) {
    return element.getName()
  }

  if (
    Node.isElementAccessExpression(element) &&
    element.getExpression().getText() === 'SCOPES'
  ) {
    const argumentExpression = element.getArgumentExpression()
    if (
      argumentExpression &&
      (Node.isStringLiteral(argumentExpression) ||
        Node.isNoSubstitutionTemplateLiteral(argumentExpression))
    ) {
      return argumentExpression.getLiteralValue()
    }
  }

  return null
}

function resolveLegacyScopeFromElement(element: Expression): string | null {
  if (
    Node.isStringLiteral(element) ||
    Node.isNoSubstitutionTemplateLiteral(element)
  ) {
    return element.getLiteralValue()
  }

  const scopeKey = resolveScopeKeyFromElementAccess(element)
  if (scopeKey) {
    const scopeValue = (SCOPES as Record<string, string>)[scopeKey]
    return typeof scopeValue === 'string' ? scopeValue : null
  }

  const expressionType = element.getType()
  if (expressionType.isStringLiteral()) {
    const literalValue = expressionType.getLiteralValue()
    return typeof literalValue === 'string' ? literalValue : null
  }

  return null
}

/**
 * Walks each `scopes: [...]` array in the roles file, classifies elements,
 * and rewrites the whole array using `migrateLegacyScopesArrayToV2Scopes`
 * (which preserves v1.9 AND semantics by merging pairs of legacy scopes
 * that targeted the same v2 type). See issue #12489.
 *
 * Elements are partitioned into three kinds:
 *   - drop: `SCOPES.X` references where X is not in the SCOPES map (warned
 *     and removed, matching pre-refactor behavior).
 *   - raw: non-literal expressions we cannot statically resolve (e.g.
 *     `...sharedScopes` spreads). Preserved verbatim in output so authoring
 *     intent isn't lost.
 *   - legacy: literal strings or resolvable `SCOPES.X` references.
 *     Collected and passed as a batch to the merge function.
 *
 * The output array text is `[...rawTexts, ...mergedScopesAsJson]`. Order of
 * legacy entries relative to raw expressions is not preserved — scopes in a
 * v2 array compose with OR, so position is semantically irrelevant.
 */
function migrateScopesArrays(
  rolesFilePath: string,
  project: Project
): { migratedCount: number; removedCount: number; mergedCount: number } {
  const sourceFile = project.getSourceFile(rolesFilePath)
  if (!sourceFile) {
    return { migratedCount: 0, removedCount: 0, mergedCount: 0 }
  }

  let migratedCount = 0
  let removedCount = 0
  let mergedCount = 0

  const scopesProperties = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .filter((prop) => prop.getName() === SCOPES_PROPERTY_NAME)

  const relPath = path.relative(process.cwd(), rolesFilePath)

  for (const scopesProp of scopesProperties) {
    const initializer = scopesProp.getInitializer()
    if (!initializer || !Node.isArrayLiteralExpression(initializer)) continue

    const rawTexts: string[] = []
    const legacyStrings: string[] = []
    let anyChange = false

    for (const element of initializer.getElements()) {
      const scopeKey = resolveScopeKeyFromElementAccess(element)
      if (scopeKey && !(scopeKey in SCOPES)) {
        // eslint-disable-next-line no-console
        console.warn(
          `  [${relPath}] Removing unknown scope reference: SCOPES.${scopeKey}`
        )
        removedCount++
        anyChange = true
        continue
      }

      const legacyScope = resolveLegacyScopeFromElement(element)
      if (!legacyScope) {
        // eslint-disable-next-line no-console
        console.warn(
          `  [${relPath}] Preserving non-literal scope expression verbatim: ${element.getText()}`
        )
        rawTexts.push(element.getText())
        continue
      }

      legacyStrings.push(legacyScope)
      anyChange = true
    }

    if (!anyChange) continue

    let mergedScopes
    try {
      mergedScopes = migrateLegacyScopesArrayToV2Scopes(legacyStrings)
    } catch (error) {
      throw new Error(
        `[${relPath}] Failed to migrate scopes for role: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { cause: error }
      )
    }

    migratedCount += legacyStrings.length
    mergedCount += legacyStrings.length - mergedScopes.length

    const outputElements = [
      ...rawTexts,
      ...mergedScopes.map((s) => JSON.stringify(s))
    ]
    scopesProp.setInitializer(`[${outputElements.join(', ')}]`)
  }

  if (removedCount > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `  Removed ${removedCount} unknown SCOPES reference(s) from '${relPath}'.`
    )
  }

  return { migratedCount, removedCount, mergedCount }
}

function ensureScopesHelpersImport(
  rolesFilePath: string,
  project: Project
): boolean {
  const sourceFile = project.getSourceFile(rolesFilePath)
  if (!sourceFile) return false

  const existingImport = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === TOOLKIT_SCOPES_MODULE
  )

  let changed = false

  if (existingImport) {
    const hasDefineScopesImport = existingImport
      .getNamedImports()
      .some((ni) => ni.getName() === DEFINE_SCOPES_IMPORT_NAME)
    const hasDefineRolesImport = existingImport
      .getNamedImports()
      .some((ni) => ni.getName() === DEFINE_ROLES_IMPORT_NAME)

    if (!hasDefineScopesImport) {
      existingImport.addNamedImport(DEFINE_SCOPES_IMPORT_NAME)
      changed = true
    }

    if (!hasDefineRolesImport) {
      existingImport.addNamedImport(DEFINE_ROLES_IMPORT_NAME)
      changed = true
    }

    const encodeScopeImport = existingImport
      .getNamedImports()
      .find((ni) => ni.getName() === 'encodeScope')

    if (encodeScopeImport) {
      encodeScopeImport.remove()
      changed = true
    }

    return changed
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier: TOOLKIT_SCOPES_MODULE,
    namedImports: [DEFINE_SCOPES_IMPORT_NAME, DEFINE_ROLES_IMPORT_NAME]
  })

  return true
}

function wrapScopesArraysWithDefineScopes(
  rolesFilePath: string,
  project: Project
): number {
  const sourceFile = project.getSourceFile(rolesFilePath)
  if (!sourceFile) return 0

  let wrappedCount = 0

  const scopesProperties = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .filter((prop) => prop.getName() === SCOPES_PROPERTY_NAME)

  for (const scopesProp of scopesProperties) {
    const initializer = scopesProp.getInitializer()
    if (!initializer) continue

    if (
      Node.isCallExpression(initializer) &&
      initializer.getExpression().getText() === DEFINE_SCOPES_IMPORT_NAME
    ) {
      continue
    }

    if (!Node.isArrayLiteralExpression(initializer)) continue

    scopesProp.setInitializer(
      `${DEFINE_SCOPES_IMPORT_NAME}(${initializer.getText()})`
    )
    wrappedCount++
  }

  return wrappedCount
}

function wrapRolesWithDefineRoles(
  rolesFilePath: string,
  project: Project
): boolean {
  const sourceFile = project.getSourceFile(rolesFilePath)
  if (!sourceFile) return false

  const rolesDeclaration = sourceFile.getVariableDeclaration('roles')
  if (!rolesDeclaration) return false

  const initializer = rolesDeclaration.getInitializer()
  if (!initializer) return false

  if (
    Node.isCallExpression(initializer) &&
    initializer.getExpression().getText() === DEFINE_ROLES_IMPORT_NAME
  ) {
    return false
  }

  if (!Node.isArrayLiteralExpression(initializer)) return false

  const typeNode = rolesDeclaration.getTypeNode()
  if (typeNode?.getText().includes('Role')) {
    rolesDeclaration.removeType()
  }

  rolesDeclaration.setInitializer(
    `${DEFINE_ROLES_IMPORT_NAME}(${initializer.getText()})`
  )
  return true
}

function pruneNamedImportIfUnused(
  sourceFile: ReturnType<Project['getSourceFileOrThrow']>,
  moduleSpecifier: string,
  importName: string
): boolean {
  const importDeclaration = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === moduleSpecifier
  )
  if (!importDeclaration) return false

  const namedImport = importDeclaration
    .getNamedImports()
    .find((ni) => ni.getName() === importName)
  if (!namedImport) return false

  const references = sourceFile
    .getDescendantsOfKind(SyntaxKind.Identifier)
    .filter(
      (identifier) =>
        identifier.getText() === importName &&
        !Node.isImportSpecifier(identifier.getParent())
    )

  if (references.length > 0) {
    return false
  }

  namedImport.remove()
  if (
    importDeclaration.getNamedImports().length === 0 &&
    !importDeclaration.getDefaultImport() &&
    !importDeclaration.getNamespaceImport()
  ) {
    importDeclaration.remove()
  }

  return true
}

function removeRoleTypeDefinitionAndUnusedImports(
  rolesFilePath: string,
  project: Project
): boolean {
  const sourceFile = project.getSourceFile(rolesFilePath)
  if (!sourceFile) return false

  let removed = false

  const roleTypeAlias = sourceFile.getTypeAlias('Role')
  if (roleTypeAlias) {
    roleTypeAlias.remove()
    removed = true
  }

  const roleInterface = sourceFile.getInterface('Role')
  if (roleInterface) {
    roleInterface.remove()
    removed = true
  }

  const removedScopeImport = pruneNamedImportIfUnused(
    sourceFile,
    TOOLKIT_SCOPES_MODULE,
    'Scope'
  )
  const removedMessageDescriptorImport = pruneNamedImportIfUnused(
    sourceFile,
    'react-intl',
    'MessageDescriptor'
  )

  removed = removed || removedScopeImport || removedMessageDescriptorImport

  return removed
}

async function main() {
  const cwd = process.cwd()
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

  const importChanged = ensureScopesHelpersImport(rolesFilePath, project)
  const { migratedCount, removedCount, mergedCount } = migrateScopesArrays(
    rolesFilePath,
    project
  )
  const wrappedScopesCount = wrapScopesArraysWithDefineScopes(
    rolesFilePath,
    project
  )
  const wrappedRoles = wrapRolesWithDefineRoles(rolesFilePath, project)
  const removedRoleType = removeRoleTypeDefinitionAndUnusedImports(
    rolesFilePath,
    project
  )

  if (
    migratedCount === 0 &&
    removedCount === 0 &&
    wrappedScopesCount === 0 &&
    !wrappedRoles &&
    !removedRoleType &&
    !importChanged
  ) {
    console.log('No migratable literal scopes found. Nothing to do.')
    return
  }

  await sourceFile.save()
  console.log(
    `Done. Migrated ${migratedCount} legacy scope(s), merged ${mergedCount} AND-paired scope(s) into single v2 objects (privilege-escalation fix, see issue #12489), removed ${removedCount} unknown SCOPES reference(s), wrapped ${wrappedScopesCount} scope array(s) with defineScopes()${wrappedRoles ? ', wrapped roles with defineRoles()' : ''}${removedRoleType ? ', and removed Role type definition' : ''}${importChanged ? '. Updated toolkit/scopes imports.' : '.'}`
  )
}

export { main }
