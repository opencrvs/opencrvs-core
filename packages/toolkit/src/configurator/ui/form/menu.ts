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
import { Action, type PageModel, type Question, type SurveyModel } from 'survey-core'

// The built-in menu is a flat list of pages. A group is a header item plus
// page items marked with a CSS class that styles the indent (see styles.css);
// the pages stay ordinary pages, so validation, Next, the progress bar and the
// check marks work unchanged.
interface MenuGroup {
  id: string
  title: string
  pages: string[]
}

// The pages of a group follow each other in forms/wizard.yml, because a group is a header placed before its first page.
export const MENU_GROUPS: MenuGroup[] = [
  { id: 'general', title: 'General', pages: ['environment', 'registry', 'email'] },
  { id: 'dependencies', title: 'Dependencies', pages: ['dependencies', 'monitoring', 'backup'] },
  { id: 'infrastructure', title: 'Infrastructure', pages: ['cluster', 'users', 'traefik', 'disk'] }
]

export function groupMenu(survey: SurveyModel, groups: MenuGroup[] = MENU_GROUPS) {
  const list = survey.tocModel.listModel
  const items = [...list.actions]

  for (const group of groups) {
    const firstIndex = items.findIndex((item) => item.id === group.pages[0])
    if (firstIndex < 0) continue

    // Clicking the header opens the first visible page of the group.
    const header = new Action({
      id: `group-${group.id}`,
      title: group.title,
      css: 'env-menu__group',
      action: () => {
        const target = group.pages.map((name) => survey.getPageByName(name)).find((page) => page?.isVisible)
        if (target) survey.tryNavigateToPage(target)
      }
    })
    // The header follows its pages: it is shown only while at least one of them is visible.
    const syncHeader = () => {
      header.visible = group.pages.some((name) => survey.getPageByName(name)?.isVisible)
    }
    syncHeader()
    survey.onPageVisibleChanged.add(syncHeader)
    items.splice(firstIndex, 0, header)
    for (const item of items) {
      if (group.pages.includes(String(item.id))) item.css = [item.css, 'env-menu__child'].filter(Boolean).join(' ')
    }
  }
  list.setItems(items)
}

export const REVIEW_ITEM_ID = 'review'

// The last item of the menu is not a page: it does what the last page's button does and asks to complete the
// form, which src/app/FormStep.tsx turns into the review (validating every page first). So it can be used from
// any page, and an incomplete form stops at its first problem.
export function addReviewItem(survey: SurveyModel) {
  const list = survey.tocModel.listModel
  const review = new Action({
    id: REVIEW_ITEM_ID,
    title: 'Review',
    css: 'env-menu__review',
    action: () => {
      survey.tryComplete()
    }
  })
  list.setItems([...list.actions, review])
}

// A question inside a hidden panel still reports itself as visible, so the panels
// around it have to be checked too.
export function isShown(question: Question): boolean {
  if (!question.isVisible) return false
  for (let parent = question.parent; parent; parent = parent.parent) {
    if (!parent.isVisible) return false
  }
  return true
}

// A page counts as answered when every shown required question has a value.
// Validators are not run here: they would also fire the async name lookup.
export const isPageAnswered = (page: PageModel) =>
  page.questions.every((question) => !isShown(question) || !question.isRequired || !question.isEmpty())

// Marks pages in the built-in table of contents with a check once the user has
// moved on from them with every required answer filled in. Titles are changed
// on the TOC's own list items, so SurveyJS keeps rendering and navigating them.
export function trackMenuStatus(survey: SurveyModel) {
  const left = new Set<string>()

  const refresh = () => {
    for (const item of survey.tocModel.listModel.actions) {
      const page = survey.getPageByName(String(item.id))
      if (!page) continue
      item.title = `${left.has(page.name) && isPageAnswered(page) ? '✓ ' : ''}${page.title}`
    }
  }

  survey.onCurrentPageChanged.add((_, { oldCurrentPage }) => {
    if (oldCurrentPage) left.add(oldCurrentPage.name)
    refresh()
  })
  survey.onValueChanged.add(refresh)
}
