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
import { describe, expect, it, vi } from 'vitest'
import { Project, ts } from 'ts-morph'
import { rewriteVersionedEventConfigUses } from './resolve-versioned-event-config'

/** A stand-in for the published toolkit, resolved like any `node_modules` package. */
const TOOLKIT_EVENTS_TYPES = `
export type EventConfig = { id: string; label: string; analytics?: boolean; actions: Array<{ type: string }> }
type EventLevelField = 'id' | 'label'
export type EventConfigVersion = Omit<EventConfig, EventLevelField> & { id: string; effectiveFrom: string }
export type VersionedEventConfig = Pick<EventConfig, EventLevelField> & { versions: EventConfigVersion[] }
export declare function resolveEventConfig(config: VersionedEventConfig): EventConfig
export declare function getCurrentEventState(event: unknown, config: EventConfig): unknown
export declare function getAllFields(configs: EventConfig[]): unknown[]
`

function rewrite(source: string) {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      strict: true,
      // `find` and friends come with ES2015
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Node10
    }
  })
  project.createSourceFile(
    '/node_modules/@opencrvs/toolkit/events/index.d.ts',
    TOOLKIT_EVENTS_TYPES
  )
  const sourceFile = project.createSourceFile('/src/analytics.ts', source)

  const changes = rewriteVersionedEventConfigUses(sourceFile)

  return { changes, text: sourceFile.getFullText() }
}

describe('rewriteVersionedEventConfigUses', () => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  it('rewrites a read of a version field and adds the import', () => {
    const { changes, text } =
      rewrite(`import { VersionedEventConfig } from '@opencrvs/toolkit/events'

export function actionTypes(config: VersionedEventConfig) {
  return config.actions.map((action) => action.type)
}
`)

    expect(changes).toBe(1)
    expect(text).toContain(
      'return resolveEventConfig(config).actions.map((action) => action.type)'
    )
    expect(text).toContain(
      "import { VersionedEventConfig, resolveEventConfig } from '@opencrvs/toolkit/events'"
    )
  })

  it('leaves the fields shared by every version alone', () => {
    const { changes, text } =
      rewrite(`import { VersionedEventConfig } from '@opencrvs/toolkit/events'

export function describe(config: VersionedEventConfig) {
  return [config.id, config.label, config.versions.length]
}
`)

    expect(changes).toBe(0)
    expect(text).not.toContain('resolveEventConfig')
  })

  it('rewrites the reads and arguments in a country config analytics file', () => {
    const { changes, text } = rewrite(`import {
  getCurrentEventState,
  VersionedEventConfig
} from '@opencrvs/toolkit/events'

declare const eventConfigs: VersionedEventConfig[]

const analyticsEventConfigs = eventConfigs.filter(
  (event) => event.analytics === true
)

function getEventConfig(eventType: string) {
  const config = analyticsEventConfigs.find((event) => event.id === eventType)
  if (!config) {
    throw new Error(\`Unsupported event type: \${eventType}\`)
  }
  return config
}

export function transform(eventType: string, event: unknown) {
  const eventConfig = getEventConfig(eventType)
  const state = getCurrentEventState(event, eventConfig)
  const actionConfig = eventConfig.actions.find((a) => a.type === 'DECLARE')
  return { state, actionConfig }
}
`)

    expect(changes).toBe(3)
    expect(text).toContain(
      '(event) => resolveEventConfig(event).analytics === true'
    )
    expect(text).toContain(
      'getCurrentEventState(event, resolveEventConfig(eventConfig))'
    )
    expect(text).toContain(
      "resolveEventConfig(eventConfig).actions.find((a) => a.type === 'DECLARE')"
    )
    expect(text).toContain(`import {
  getCurrentEventState,
  VersionedEventConfig,
  resolveEventConfig
} from '@opencrvs/toolkit/events'`)
  })

  it('maps an array of versioned configurations passed where configurations are expected', () => {
    const { changes, text } =
      rewrite(`import { getAllFields, VersionedEventConfig } from '@opencrvs/toolkit/events'

declare const eventConfigs: VersionedEventConfig[]

export const fields = getAllFields(eventConfigs)
`)

    expect(changes).toBe(1)
    expect(text).toContain('getAllFields(eventConfigs.map(resolveEventConfig))')
  })

  it('rewrites a versioned configuration assigned to an EventConfig', () => {
    const { changes, text } =
      rewrite(`import { EventConfig, VersionedEventConfig } from '@opencrvs/toolkit/events'

declare const birth: VersionedEventConfig

export const config: EventConfig = birth
`)

    expect(changes).toBe(1)
    expect(text).toContain(
      'export const config: EventConfig = resolveEventConfig(birth)'
    )
  })

  it('rewrites nested uses from the inside out', () => {
    const { changes, text } =
      rewrite(`import { getCurrentEventState, VersionedEventConfig } from '@opencrvs/toolkit/events'

declare const configs: Record<string, VersionedEventConfig>

export const state = getCurrentEventState(configs.birth.actions, configs.birth)
`)

    expect(changes).toBe(2)
    expect(text).toContain(
      'getCurrentEventState(resolveEventConfig(configs.birth).actions, resolveEventConfig(configs.birth))'
    )
  })

  it('leaves a VersionedEventConfig type declared by the country config alone', () => {
    const { changes } =
      rewrite(`type VersionedEventConfig = { id: string; actions: [] }

export function actions(config: VersionedEventConfig) {
  return config.actions
}
`)

    expect(changes).toBe(0)
  })

  it('adds a value import when the file only imports toolkit types', () => {
    const { text } =
      rewrite(`import type { VersionedEventConfig as Config } from '@opencrvs/toolkit/events'

export const actions = (config: Config) => config.actions
`)

    expect(text).toContain('resolveEventConfig(config).actions')
    expect(text).toContain(
      "import type { VersionedEventConfig as Config } from '@opencrvs/toolkit/events'"
    )
    expect(text).toContain(
      "import { resolveEventConfig } from '@opencrvs/toolkit/events'"
    )
  })

  it('uses the local name of an already imported resolveEventConfig', () => {
    const { text } = rewrite(`import {
  resolveEventConfig as resolve,
  VersionedEventConfig
} from '@opencrvs/toolkit/events'

export const actions = (config: VersionedEventConfig) => config.actions
`)

    expect(text).toContain('resolve(config).actions')
    expect(text.match(/resolveEventConfig/g)).toHaveLength(1)
  })

  it('is idempotent', () => {
    const source = `import { VersionedEventConfig } from '@opencrvs/toolkit/events'

export const actions = (config: VersionedEventConfig) => config.actions
`
    const once = rewrite(source).text
    const twice = rewrite(once)

    expect(twice.changes).toBe(0)
    expect(twice.text).toBe(once)
  })

  it('skips and logs optional chains, writes and possibly undefined values', () => {
    warn.mockClear()

    const { changes, text } =
      rewrite(`import { getCurrentEventState, VersionedEventConfig } from '@opencrvs/toolkit/events'

export function update(config: VersionedEventConfig | undefined, other: VersionedEventConfig) {
  const actions = config?.actions
  other.analytics = false
  return getCurrentEventState(actions, config)
}
`)

    expect(changes).toBe(0)
    expect(text).not.toContain('resolveEventConfig(')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Skipped optional chain `config?.actions`')
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Skipped write to `other.analytics`')
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Skipped `config`, which may be undefined')
    )
  })

  it('logs destructuring a version field without rewriting it', () => {
    warn.mockClear()

    const { changes } =
      rewrite(`import { VersionedEventConfig } from '@opencrvs/toolkit/events'

export function actions(config: VersionedEventConfig) {
  const { id, actions } = config
  return { id, actions }
}
`)

    expect(changes).toBe(0)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Destructures a field of a version')
    )
  })

  it('leaves the file alone when it declares its own resolveEventConfig', () => {
    warn.mockClear()

    const { changes, text } =
      rewrite(`import { VersionedEventConfig } from '@opencrvs/toolkit/events'

function resolveEventConfig(config: VersionedEventConfig) {
  return config.versions[0]
}

export const actions = (config: VersionedEventConfig) => config.actions
`)

    expect(changes).toBe(0)
    expect(text).toContain('=> config.actions')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('already declares its own `resolveEventConfig`')
    )
  })
})
