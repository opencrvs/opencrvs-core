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
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderTiltfile, upgradeTilt, withIgnoreEntry } from './upgrade-tilt'

const TEMPLATE_DIR = path.resolve(
  __dirname,
  '../../../../countryconfig-template'
)

const V2_0_TILTFILE = `
countryconfig_image_name="farajaland/ocrvs-countryconfig"
countryconfig_image_tag="local"
load('../opencrvs-helm-charts/tilt/opencrvs.tilt', 'setup_opencrvs')
`

describe('renderTiltfile', () => {
  const template = [
    'core_ref = "develop"',
    'countryconfig_image_name="opencrvs/ocrvs-countryconfig"',
    'countryconfig_image_tag="local"'
  ].join('\n')

  it('keeps the image name the country config already uses', () => {
    expect(renderTiltfile(template, V2_0_TILTFILE)).toContain(
      'countryconfig_image_name="farajaland/ocrvs-countryconfig"'
    )
  })

  it('uses the template as is when there is no Tiltfile yet', () => {
    expect(renderTiltfile(template)).toBe(template)
  })

  it('uses the template as is when the Tiltfile has no image name', () => {
    expect(renderTiltfile(template, 'print("hello")')).toBe(template)
  })
})

describe('withIgnoreEntry', () => {
  it('appends the entry', () => {
    expect(withIgnoreEntry('node_modules\n', '.opencrvs-core-charts')).toBe(
      'node_modules\n.opencrvs-core-charts\n'
    )
  })

  it('adds a newline to a file that does not end with one', () => {
    expect(withIgnoreEntry('node_modules', '.opencrvs-core-charts')).toBe(
      'node_modules\n.opencrvs-core-charts\n'
    )
  })

  it.each([
    '.opencrvs-core-charts',
    '/.opencrvs-core-charts',
    '.opencrvs-core-charts/'
  ])('leaves a file already ignoring it as %s alone', (existing) => {
    const contents = `node_modules\n${existing}\n`
    expect(withIgnoreEntry(contents, '.opencrvs-core-charts/')).toBe(contents)
  })
})

describe('upgradeTilt', () => {
  let cwd: string

  const read = (file: string) => readFileSync(path.join(cwd, file), 'utf8')
  const template = (file: string) =>
    readFileSync(path.join(TEMPLATE_DIR, file), 'utf8')
  const write = (file: string, contents: string) => {
    mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true })
    writeFileSync(path.join(cwd, file), contents)
  }

  beforeEach(() => {
    cwd = mkdtempSync(path.join(tmpdir(), 'upgrade-tilt-'))
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('upgrades a v2.0 country config', () => {
    write('Tiltfile', V2_0_TILTFILE)
    write('.gitignore', 'node_modules\n')

    upgradeTilt(cwd, TEMPLATE_DIR)

    expect(read('Tiltfile')).toContain("load('./tilt/opencrvs.tilt'")
    expect(read('Tiltfile')).toContain(
      'countryconfig_image_name="farajaland/ocrvs-countryconfig"'
    )
    expect(read('tilt/opencrvs.tilt')).toBe(template('tilt/opencrvs.tilt'))
    expect(read('tilt/examples/opencrvs-services/values.yaml')).toBe(
      template('tilt/examples/opencrvs-services/values.yaml')
    )
    expect(read('tilt/helm/opencrvs-services/values.yaml')).toBe(
      template('tilt/helm/opencrvs-services/values.yaml')
    )
    expect(read('.gitignore')).toBe('node_modules\n.opencrvs-core-charts\n')
    expect(read('.tiltignore')).toBe('.opencrvs-core-charts/\n')
  })

  it('keeps shell scripts executable', () => {
    upgradeTilt(cwd, TEMPLATE_DIR)

    expect(
      statSync(path.join(cwd, 'tilt/clear-all-data.sh')).mode & 0o111
    ).not.toBe(0)
  })

  it('replaces core owned files but never the country overrides', () => {
    write('tilt/opencrvs.tilt', '# edited locally\n')
    write('tilt/helm/opencrvs-services/values.yaml', 'countryconfig: {}\n')

    upgradeTilt(cwd, TEMPLATE_DIR)

    expect(read('tilt/opencrvs.tilt')).toBe(template('tilt/opencrvs.tilt'))
    expect(read('tilt/helm/opencrvs-services/values.yaml')).toBe(
      'countryconfig: {}\n'
    )
  })

  it('leaves files the template does not have in place and warns about them', () => {
    write('tilt/examples/opencrvs-services/values.override.yaml', 'a: 1\n')

    upgradeTilt(cwd, TEMPLATE_DIR)

    expect(read('tilt/examples/opencrvs-services/values.override.yaml')).toBe(
      'a: 1\n'
    )
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'tilt/examples/opencrvs-services/values.override.yaml'
      )
    )
  })

  it('changes nothing when run a second time', () => {
    write('Tiltfile', V2_0_TILTFILE)
    upgradeTilt(cwd, TEMPLATE_DIR)
    vi.mocked(console.log).mockClear()

    upgradeTilt(cwd, TEMPLATE_DIR)

    expect(console.log).not.toHaveBeenCalled()
  })
})
