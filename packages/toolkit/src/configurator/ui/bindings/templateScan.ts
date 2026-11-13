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
import Handlebars from 'handlebars'
import { parse as parseYaml } from 'yaml'

// Handlebars can render a template but cannot read a rendered file back. This
// finds, for every variable of a template, where its value ends up in the
// rendered YAML, by rendering with marker values and walking the parsed result:
//
//   kube_api_host:  {{kube_api_host}}   ->  all.vars.kube_api_host
//   {{#each kube_worker_nodes}} ... {{host}}   ->  all.children.workers.hosts.*.ansible_host
//
// Plain syntax only (no enums or parameter properties) so Node can run it directly.

// '*' stands for any object key or array index.
export interface FilePath {
  segments: string[]
  // Set when the value is only part of the string: `/home/backup/{{name}}` has prefix '/home/backup/'.
  prefix?: string
  suffix?: string
}

interface TemplateScan {
  // Variable (list items and object properties as `users.name`) -> where it appears.
  paths: Record<string, FilePath[]>
  // Variables the template uses that can never be read back from the rendered file.
  unreadable: string[]
}

const MARK = '§§'
const MARKED = new RegExp(`${MARK}([^§]+)${MARK}`, 'g')

interface Node {
  kind?: 'scalar' | 'list' | 'object'
  // Used as the condition of {{#if}} / {{#unless}}; only these are switched off in the second pass.
  flag?: boolean
  item?: Node
  props: Map<string, Node>
}

const node = (): Node => ({ props: new Map() })

function child(parent: Node, name: string): Node {
  let found = parent.props.get(name)
  if (!found) {
    found = node()
    parent.props.set(name, found)
  }
  return found
}

// Resolves `a.b.c` against the block parameters in scope (or the root context).
function resolve(parts: string[], scope: Map<string, Node | null>, root: Node): Node | null {
  const [first, ...rest] = parts
  if (first === undefined) return null
  let current: Node
  if (scope.has(first)) {
    const bound = scope.get(first)
    if (!bound) return null // a loop index
    current = bound
  } else {
    current = child(root, first)
  }
  for (const part of rest) {
    current.kind = current.kind ?? 'object'
    current = child(current, part)
  }
  return current
}

// Learns from the template's syntax tree which variables are lists, which are
// objects with properties, and which are plain values.
function analyse(statements: any[], scope: Map<string, Node | null>, root: Node) {
  const use = (path: any) => {
    if (!path || path.type !== 'PathExpression' || path.data) return null
    const target = resolve(path.parts, scope, root)
    if (target && !target.kind) target.kind = 'scalar'
    return target
  }

  for (const statement of statements) {
    if (statement.type === 'MustacheStatement') {
      if (statement.params.length === 0) use(statement.path)
      else statement.params.forEach(use) // a helper call: its name is not a variable
    } else if (statement.type === 'BlockStatement') {
      const name = statement.path.original
      const subject = statement.params[0]
      if (name === 'each') {
        const list = resolve(subject.parts, scope, root)
        const names: string[] = statement.program.blockParams ?? []
        const inner = new Map(scope)
        if (list) {
          list.kind = 'list'
          list.item = list.item ?? node()
          if (names[0]) inner.set(names[0], list.item)
        }
        if (names[1]) inner.set(names[1], null)
        analyse(statement.program.body, inner, root)
      } else {
        const condition = use(subject)
        if (condition) condition.flag = true
        analyse(statement.program.body, scope, root)
      }
      if (statement.inverse) analyse(statement.inverse.body, scope, root)
    }
  }
}

function build(n: Node, label: string, truthy: boolean, items: number): unknown {
  if (n.kind === 'list') {
    if (!truthy) return []
    return Array.from({ length: items }, () => build(n.item ?? node(), label, truthy, items))
  }
  if (n.kind === 'object') {
    if (!truthy) return {}
    const value: Record<string, unknown> = {}
    for (const [name, inner] of n.props) value[name] = build(inner, `${label}.${name}`, truthy, items)
    return value
  }
  // A value that is not a condition always shows, so a variable inside an {{else}} branch is still found.
  return truthy || !n.flag ? `${MARK}${label}${MARK}` : ''
}

function context(root: Node, truthy: boolean, items: number) {
  const value: Record<string, unknown> = {}
  for (const [name, n] of root.props) value[name] = build(n, name, truthy, items)
  return value
}

interface Found {
  label: string
  path: FilePath
}

function walk(value: unknown, segments: string[], found: Found[], unreadable: Set<string>) {
  if (typeof value === 'string') {
    const labels = [...value.matchAll(MARKED)]
    if (labels.length === 0) return
    if (labels.length > 1) {
      labels.forEach((match) => unreadable.add(match[1]!))
      return
    }
    const [match] = labels
    const prefix = value.slice(0, match!.index)
    const suffix = value.slice(match!.index! + match![0].length)
    found.push({
      label: match![1]!,
      path: { segments, ...(prefix ? { prefix } : {}), ...(suffix ? { suffix } : {}) }
    })
  } else if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, [...segments, String(index)], found, unreadable))
  } else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) walk(entry, [...segments, key], found, unreadable)
  }
}

const same = (a: FilePath, b: FilePath) =>
  a.segments.join('\0') === b.segments.join('\0') && a.prefix === b.prefix && a.suffix === b.suffix

function dedupe(paths: FilePath[]): FilePath[] {
  const unique: FilePath[] = []
  for (const path of paths) if (!unique.some((other) => same(other, path))) unique.push(path)
  return unique
}

// Positions that differ between the one-item and the two-item render are loop positions.
function generalise(one: FilePath[], two: FilePath[]): FilePath[] {
  const fixed = one.filter((path) => two.some((other) => same(other, path)))
  const result: FilePath[] = []
  const covered = new Set<FilePath>()
  for (const path of two) {
    if (one.some((other) => same(other, path))) continue
    const twin = one.find(
      (other) =>
        other.segments.length === path.segments.length && other.prefix === path.prefix && other.suffix === path.suffix
    )
    if (!twin) continue
    covered.add(twin)
    result.push({
      ...path,
      segments: path.segments.map((segment, index) => (segment === twin.segments[index] ? segment : '*'))
    })
  }
  // A path rendered once per item shows up in both renders; the loop makes it a pattern.
  return prune(dedupe([...fixed.filter((path) => !covered.has(path)), ...result]))
}

// `a.*.b.*` already covers `a.*.b.0` and `a.0.b.*`.
function covers(general: FilePath, specific: FilePath) {
  return (
    general !== specific &&
    general.prefix === specific.prefix &&
    general.suffix === specific.suffix &&
    general.segments.length === specific.segments.length &&
    general.segments.every((segment, index) => segment === '*' || segment === specific.segments[index])
  )
}

const prune = (paths: FilePath[]) => paths.filter((path) => !paths.some((other) => covers(other, path)))

function render(source: string, data: unknown) {
  const env = Handlebars.create()
  // Same helper as the CLI's: worker labels start at 2.
  env.registerHelper('data_label_idx', (value: unknown) => Number.parseInt(String(value), 10) + 2)
  return env.compile(source)(data)
}

function collect(text: string): { found: Found[]; unreadable: Set<string> } {
  const found: Found[] = []
  const unreadable = new Set<string>()
  // With every {{#if}} on, exclusive branches (lets_encrypt / static_ssl) repeat a key: the last one wins.
  walk(parseYaml(text, { uniqueKeys: false }), [], found, unreadable)
  return { found, unreadable }
}

export function scanTemplate(source: string): TemplateScan {
  const root = node()
  analyse(Handlebars.parse(source).body, new Map(), root)

  // Everything on (reveals every {{#if}} branch), then everything off (reveals {{else}} branches).
  const one = collect(render(source, context(root, true, 1)))
  const two = collect(render(source, context(root, true, 2)))
  const off = collect(render(source, context(root, false, 1)))

  const paths: Record<string, FilePath[]> = {}
  const labels = new Set([...one.found, ...two.found, ...off.found].map((entry) => entry.label))
  for (const label of labels) {
    const pick = (entries: Found[]) => entries.filter((entry) => entry.label === label).map((entry) => entry.path)
    paths[label] = generalise(dedupe(pick(one.found)), dedupe(pick(two.found)))
    for (const path of dedupe(pick(off.found))) {
      if (!paths[label]!.some((other) => same(other, path))) paths[label]!.push(path)
    }
  }

  const unreadable = new Set([...one.unreadable, ...two.unreadable, ...off.unreadable])
  for (const label of unreadable) if (paths[label]) unreadable.delete(label)

  // Variables used only in conditions or inside longer strings never get a path of their own.
  const known = new Set<string>()
  const names = (n: Node, label: string) => {
    known.add(label)
    for (const [name, inner] of n.props) names(inner, label ? `${label}.${name}` : name)
    if (n.item) for (const [name, inner] of n.item.props) names(inner, `${label}.${name}`)
  }
  for (const [name, n] of root.props) names(n, name)
  for (const label of known) if (!paths[label] && !label.includes('.')) unreadable.add(label)

  return { paths, unreadable: [...unreadable].sort() }
}

// All values at a path pattern in a parsed YAML document.
export function readPath(document: unknown, path: FilePath): unknown[] {
  let level: unknown[] = [document]
  for (const segment of path.segments) {
    const next: unknown[] = []
    for (const value of level) {
      if (Array.isArray(value)) {
        if (segment === '*') next.push(...value)
        else if (value[Number(segment)] !== undefined) next.push(value[Number(segment)])
      } else if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>
        if (segment === '*') next.push(...Object.values(record))
        else if (segment in record) next.push(record[segment])
      }
    }
    level = next
  }

  if (path.prefix === undefined && path.suffix === undefined) return level
  const prefix = path.prefix ?? ''
  const suffix = path.suffix ?? ''
  return level.flatMap((value) =>
    typeof value === 'string' && value.startsWith(prefix) && value.endsWith(suffix) && value.length > prefix.length + suffix.length
      ? [value.slice(prefix.length, value.length - suffix.length)]
      : []
  )
}

// The array or object that holds the loop items: the path up to its first '*'.
export function readContainer(document: unknown, path: FilePath): unknown {
  const stop = path.segments.indexOf('*')
  const prefix = stop === -1 ? path.segments : path.segments.slice(0, stop)
  return readPath(document, { segments: prefix })[0]
}
