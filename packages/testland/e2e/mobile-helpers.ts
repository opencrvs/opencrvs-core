import { Page } from '@playwright/test'

export const MOBILE_VIEWPORT_SIZE = { height: 800, width: 360 }

export async function setMobileViewport(page: Page) {
  await page.setViewportSize(MOBILE_VIEWPORT_SIZE)
}

export function isMobile(page: Page) {
  const width = page.viewportSize()?.width
  return width ? width <= MOBILE_VIEWPORT_SIZE.width : false
}
