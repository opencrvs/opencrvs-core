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
import type { Model } from 'survey-core'
import { describe, expect, it } from 'vitest'
import { makeSurvey } from './helpers'

const menu = (survey: Model) =>
  survey.tocModel.listModel.actions.filter((item) => item.visible).map((item) => String(item.id))
const title = (survey: Model, id: string) =>
  survey.tocModel.listModel.actions.find((item) => item.id === id)?.title

async function fillEnvironment(survey: Model) {
  survey.setValue('ENVIRONMENT_NAME', 'my-env')
  survey.setValue('ENVIRONMENT_TYPE', 'non-production')
  survey.setValue('DOMAIN', 'example.opencrvs.org')
}

describe('left menu (built-in table of contents)', () => {
  it('is switched on and placed on the left', async () => {
    const { survey } = await makeSurvey()
    expect(survey.showTOC).toBe(true)
    expect(survey.tocLocation).toBe('left')
  })

  it('lists only the visible pages, under three headers, ends with Review, and follows visibility changes', async () => {
    const { survey } = await makeSurvey('fresh')
    expect(menu(survey)).toEqual([
      'group-general',
      'environment',
      'registry',
      'group-dependencies',
      'dependencies',
      'monitoring',
      'backup',
      'group-infrastructure',
      'cluster',
      'users',
      'traefik',
      'disk',
      'review'
    ])

    // The infrastructure pages go with "Configure Infrastructure"; Backup/Restore stays under Dependencies
    survey.setValue('CONFIGURE_INFRASTRUCTURE', false)
    expect(menu(survey)).toEqual([
      'group-general',
      'environment',
      'registry',
      'group-dependencies',
      'dependencies',
      'monitoring',
      'backup',
      'review'
    ])
    survey.setValue('CONFIGURE_INFRASTRUCTURE', true)
    expect(menu(survey)).toContain('group-infrastructure')

    survey.setValue('CONFIGURE_EMAIL', true)
    expect(menu(survey)).toContain('email')
    survey.setValue('CONFIGURE_EMAIL', false)
    expect(menu(survey)).not.toContain('email')

    const { survey: other } = await makeSurvey('registry-present')
    expect(menu(other)).toContain('registry') // the repository's registry secrets do not hide the page
  })

  it('groups the pages under General, Dependencies and Infrastructure', async () => {
    const { survey } = await makeSurvey()
    const items = survey.tocModel.listModel.actions
    const level = (id: string) => (items.find((item) => item.id === id)!.css?.includes('env-menu__child') ? 1 : 0)
    const pages = ['environment', 'registry', 'email', 'dependencies', 'monitoring', 'backup', 'cluster', 'users', 'traefik', 'disk']

    expect(['general', 'dependencies', 'infrastructure'].map((id) => title(survey, `group-${id}`))).toEqual(['General', 'Dependencies', 'Infrastructure'])
    expect(['group-general', 'group-dependencies', 'group-infrastructure'].map(level)).toEqual([0, 0, 0])
    expect(pages.map(level)).toEqual(pages.map(() => 1))
    expect(pages.map((id) => title(survey, id))).toEqual([
      'Environment',
      'Container registry',
      'Email',
      'Data stores',
      'Monitoring',
      'Backup/Restore',
      'Kubernetes',
      'SSH Users',
      'Traefik',
      'Disk encryption'
    ])
  })

  it('opens the first page of the group when the header is clicked', async () => {
    const { survey } = await makeSurvey('registry-present')
    await fillEnvironment(survey)
    survey.setValue('CONFIGURE_INFRASTRUCTURE', true)
    survey.currentPage = survey.getPageByName('cluster')! // pretend we are past the first pages
    survey.currentPage = survey.getPageByName('monitoring')!
    survey.tocModel.listModel.actions.find((item) => item.id === 'group-infrastructure')!.action!()
    expect(survey.currentPage.name).toBe('cluster')
  })

  describe('Review item', () => {
    const reviewItem = (survey: Model) => survey.tocModel.listModel.actions.find((item) => item.id === 'review')!

    it('is titled Review, is not a page and is not indented', async () => {
      const { survey } = await makeSurvey()
      expect(title(survey, 'review')).toBe('Review')
      expect(survey.getPageByName('review')).toBeNull()
      expect(reviewItem(survey).css).not.toContain('env-menu__child')
    })

    it('asks to complete the form, which the app turns into the review', async () => {
      const { survey } = await makeSurvey()
      let completing = 0
      survey.onCompleting.add((_, options) => {
        completing++
        options.allow = false // as FormStep does: the review is shown instead
      })
      await fillEnvironment(survey)
      expect(survey.isLastPage).toBe(false) // it works from any page, not only the last

      reviewItem(survey).action!()
      expect(completing).toBe(1)
    })

    it('stops on the current page while it has errors', async () => {
      const { survey } = await makeSurvey()
      let completing = 0
      survey.onCompleting.add(() => completing++)

      reviewItem(survey).action!() // the environment page is still empty
      expect(completing).toBe(0)
      expect(survey.currentPage.name).toBe('environment')
    })
  })

  it('does not let the menu jump ahead from an incomplete page', async () => {
    const { survey } = await makeSurvey()
    expect(survey.tryNavigateToPage(survey.getPageByName('cluster')!)).toBe(false)
    expect(survey.currentPage.name).toBe('environment')
  })

  it('checks a page only after it was left with all required answers filled', async () => {
    const { survey } = await makeSurvey()
    expect(title(survey, 'environment')).toBe('Environment')

    await fillEnvironment(survey)
    expect(title(survey, 'environment')).toBe('Environment') // still on it

    survey.currentPage = survey.getPageByName('registry')!
    expect(title(survey, 'environment')).toBe('✓ Environment')
    expect(title(survey, 'cluster')).toBe('Kubernetes') // never visited, even with no required fields
  })

  it('removes the check when a required answer is cleared', async () => {
    const { survey } = await makeSurvey()
    await fillEnvironment(survey)
    survey.currentPage = survey.getPageByName('registry')!
    survey.clearValue('DOMAIN')
    expect(title(survey, 'environment')).toBe('Environment')
  })

  describe('Backup/Restore page', () => {
    const leaveBackupPage = async (setup: (survey: Model) => void) => {
      const { survey } = await makeSurvey('name-taken')
      survey.setValue('CONFIGURE_INFRASTRUCTURE', false) // Backup/Restore does not depend on it
      survey.currentPage = survey.getPageByName('backup')!
      setup(survey)
      survey.currentPage = survey.getPageByName('monitoring')! // leaves the page
      return title(survey, 'backup')
    }

    it('is checked when neither backup nor restore is chosen', async () => {
      expect(await leaveBackupPage(() => {})).toBe('✓ Backup/Restore')
    })

    it('is checked when backup is chosen and filled in', async () => {
      const result = await leaveBackupPage((survey) => {
        survey.setValue('BACKUP_OR_RESTORE', 'backup')
        survey.setValue('BACKUP_HOST', '203.0.113.9')
        survey.setValue('BACKUP_SERVER_USER', 'backup') // no default any more
      })
      expect(result).toBe('✓ Backup/Restore')
    })

    it('is checked when restore is chosen and filled in', async () => {
      const result = await leaveBackupPage((survey) => {
        survey.setValue('BACKUP_OR_RESTORE', 'restore')
        survey.setValue('RESTORE_ENVIRONMENT_NAME', 'staging')
        survey.setValue('RESTORE_HOST', '203.0.113.20')
      })
      expect(result).toBe('✓ Backup/Restore')
    })

    it('is not checked while the chosen option is incomplete', async () => {
      expect(await leaveBackupPage((survey) => survey.setValue('BACKUP_OR_RESTORE', 'backup'))).toBe('Backup/Restore')
      expect(await leaveBackupPage((survey) => survey.setValue('BACKUP_OR_RESTORE', 'restore'))).toBe('Backup/Restore')
    })
  })

  it('does not check a visited page that is still incomplete', async () => {
    const { survey } = await makeSurvey()
    survey.currentPage = survey.getPageByName('registry')!
    survey.currentPage = survey.getPageByName('monitoring')!
    expect(title(survey, 'registry')).toBe('Container registry')
  })
})

describe('form header', () => {
  it('does not repeat the title on every page', async () => {
    const { survey } = await makeSurvey()
    expect(survey.showTitle).toBe(false)
    expect(survey.title).toBe('OpenCRVS Environment configuration') // still the form's name
  })
})
