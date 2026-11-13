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
import { bindings, scanned } from '../../ui/bindings/load'
import { MockGitHub } from '../../ui/github/mock'
import type { LocalServerPort } from '../../ui/local/port'
import { MockLocalServer } from '../../ui/local/mock'
import { fileStatus, prepareReview } from '../../ui/plan/review'
import { answersFor } from './answers'

const input = (sources: Parameters<typeof prepareReview>[0]['sources'], environment = 'qa') => ({
  environment,
  values: { ...answersFor('qa'), DOMAIN: 'qa.opencrvs.example', SMTP_HOST: 'smtp.example.org' },
  publicValues: { ...answersFor('qa'), DOMAIN: 'qa.opencrvs.example' },
  sources,
  bindings,
  scanned
})

describe('prepareReview', () => {
  it('reads GitHub now, plans against it, and renders the files', async () => {
    const github = new MockGitHub('existing', 0)
    const review = await prepareReview(input({ github, local: new MockLocalServer() }))
    expect(review.plan.createEnvironment).toBe(false)
    expect(review.plan.items.find((item) => item.name === 'DOMAIN')?.status).toBe('unchanged')
    expect(review.plan.items.find((item) => item.name === 'SMTP_HOST')?.status).toBe('update')
    expect(review.files.map((file) => [file.path, fileStatus(file)])).toEqual([
      ['inventory.yml', 'new'],
      ['dependencies/values.yaml', 'new'],
      ['traefik/values.yaml', 'new'],
      ['opencrvs-services/values.yaml', 'new']
    ])

    // someone changes GitHub in the meantime: the next review sees it
    await github.putVariable({ scope: 'environment', environment: 'qa', name: 'DOMAIN', value: 'changed.example' })
    const later = await prepareReview(input({ github, local: new MockLocalServer() }))
    expect(later.plan.items.find((item) => item.name === 'DOMAIN')?.status).toBe('update')
  })

  it('works without GitHub', async () => {
    const review = await prepareReview(input({ local: new MockLocalServer() }))
    expect(review.plan).toMatchObject({ github: false, items: [] })
    expect(review.files).toHaveLength(4)
  })

  it('still reviews GitHub when the files cannot be rendered', async () => {
    const broken = new MockLocalServer()
    broken.renderFiles = () => Promise.reject(new Error('The local dev server is not reachable.'))
    const review = await prepareReview(input({ github: new MockGitHub('existing', 0), local: broken as LocalServerPort }))
    expect(review.files).toEqual([])
    expect(review.filesError).toBe('The local dev server is not reachable.')
    expect(review.plan.items.length).toBeGreaterThan(0)
  })

  it('marks files as new, update or unchanged', async () => {
    const local = new MockLocalServer()
    await local.writeFiles('qa', answersFor('qa'))
    const same = await local.renderFiles('qa', answersFor('qa'))
    expect(same.map(fileStatus)).toEqual(['unchanged', 'unchanged', 'unchanged', 'unchanged'])
    const changed = await local.renderFiles('qa', { ...answersFor('qa'), KUBE_API_HOST: '10.9.9.9' })
    expect(changed.map(fileStatus)).toEqual(['update', 'unchanged', 'unchanged', 'unchanged'])
  })
})
