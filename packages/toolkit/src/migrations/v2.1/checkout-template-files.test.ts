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
import { describe, expect, it } from 'vitest'
import {
  keepTiltfileSettings,
  startTiltScript,
  withoutPnpmfile
} from './checkout-template-files'
import { readTemplateFile } from './countryconfig-template'

describe('withoutPnpmfile', () => {
  it.each(['Dockerfile', 'Tiltfile'])(
    "takes .pnpmfile.cjs out of the template's %s",
    (file) => {
      const template = readTemplateFile(file)
      expect(template).toContain('.pnpmfile.cjs')

      const result = withoutPnpmfile(file, template)

      expect(result).toBeDefined()
      expect(result).not.toContain('.pnpmfile.cjs')
    }
  )

  it('keeps the rest of the COPY line', () => {
    expect(
      withoutPnpmfile(
        'Dockerfile',
        'COPY package.json pnpm-lock.yaml .pnpmfile.cjs ./\n'
      )
    ).toBe('COPY package.json pnpm-lock.yaml ./\n')
  })

  it('refuses a reference it does not know how to remove', () => {
    expect(
      withoutPnpmfile('Dockerfile', 'RUN node .pnpmfile.cjs\n')
    ).toBeUndefined()
  })
})

describe('keepTiltfileSettings', () => {
  it("carries the country's image name and tag over", () => {
    const template = [
      'core_images_tag = os.getenv("OPENCRVS_CORE_IMAGE_TAG", "v2.1.0")',
      'countryconfig_image_name="opencrvs/ocrvs-countryconfig"',
      'countryconfig_image_tag="local"',
      ''
    ].join('\n')
    const local = [
      'core_images_tag = "develop"',
      'countryconfig_image_name = "example/ocrvs-example"',
      ''
    ].join('\n')

    expect(keepTiltfileSettings(template, local)).toBe(
      [
        'core_images_tag = os.getenv("OPENCRVS_CORE_IMAGE_TAG", "v2.1.0")',
        'countryconfig_image_name = "example/ocrvs-example"',
        'countryconfig_image_tag="local"',
        ''
      ].join('\n')
    )
  })
})

describe('startTiltScript', () => {
  it('drops the setup steps', () => {
    expect(
      startTiltScript(
        'pnpm setup-analytics && pnpm setup-reference-data &&  cross-env NODE_ENV=development nodemon --watch src --exec ts-node src/index.ts'
      )
    ).toBe(
      'cross-env NODE_ENV=development nodemon --watch src --exec ts-node src/index.ts'
    )
  })

  it("matches the template's own start:tilt", () => {
    expect(
      startTiltScript(
        'pnpm setup-analytics && cross-env NODE_ENV=development NODE_OPTIONS=--dns-result-order=ipv4first nodemon --watch src --exec tsx src/index.ts'
      )
    ).toBe(
      'cross-env NODE_ENV=development NODE_OPTIONS=--dns-result-order=ipv4first nodemon --watch src --exec tsx src/index.ts'
    )
  })
})
