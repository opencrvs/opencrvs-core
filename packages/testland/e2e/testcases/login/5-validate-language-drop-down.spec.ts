import { test, expect } from '@playwright/test'
import { LOGIN_URL } from '../../constants'
import { ensureLoginPageReady } from '../../helpers'

test.describe('5. Validate language change', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    await ensureLoginPageReady(page)
  })

  test('5.1. Navigate to the OpenCRVS URL', async ({ page }) => {
    /*
     * Expected result: should navigate to openCRVS URL
     */
    await expect(page.getByText('Login to Farajaland CRVS')).toBeVisible()
  })

  test('5.2. Click on language drop down', async ({ page }) => {
    await page.locator('_react=LanguageSelect').click()

    /*
     * Expected result: should show option for changing language
     */
    await expect(page.getByText('Français')).toBeVisible()
  })

  test('5.3. Select french language', async ({ page }) => {
    await page.locator('_react=LanguageSelect').click()
    await page.getByText('Français').click()

    /*
     * Expected result: should change language to french
     */
    expect(await page.locator('_react=LanguageSelect').innerText()).toMatch(
      'Français'
    )
  })

  test.describe('5.4. Validate language of login page', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('_react=LanguageSelect').click()
      await page.getByText('Français').click()
    })
    test('5.4.1. Username label should be in french', async ({ page }) => {
      /*
       * Expected result: should change the 'Username' label to french
       */
      await expect(page.getByText("Nom d'utilisateur")).toBeVisible()
    })

    test('5.4.2. Password label should be in french', async ({ page }) => {
      /*
       * Expected result: should change the 'Password' label to french
       */
      await expect(page.getByText('Mot de passe')).toBeVisible()
    })

    test('5.4.3. Submit button label should be in french', async ({ page }) => {
      /*
       * Expected result: should change the 'Submit button' label to french
       */
      await expect(page.getByText('Se connecter')).toBeVisible()
    })

    test("5.4.4. Can't log in label should be in french", async ({ page }) => {
      /*
       * Expected result: should change the 'Can't log in label' to french
       */
      await expect(page.getByText('Vous ne pouvez pas vous')).toBeVisible()
    })
  })

  test.describe('5.5. Validate language of 2fa page', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('_react=LanguageSelect').click()
      await page.getByText('Français').click()
      await page.fill('#username', 'k.bwalya')
      await page.fill('#password', 'test')
      await page.getByText('Se connecter', { exact: true }).click()
    })

    test('5.5.1. 2fa header should be in french', async ({ page }) => {
      /*
       * Expected result: should change the header of the 2fa page to french
       */
      await expect(page.getByText('Vérifier votre compte')).toBeVisible()
    })

    test('5.5.2. 2fa description should be in french', async ({ page }) => {
      /*
       * Expected result: should change the description of 2fa page to french
       */
      await expect(
        page
          .getByText("Un code d'authentification a")
          .and(page.getByText('Ce code sera valable 10 minutes'))
      ).toBeVisible()
    })

    test('5.5.3. Input label should be in french', async ({ page }) => {
      /*
       * Expected result: should change the input label of the 2fa page to french
       */
      await expect(
        page.getByText('Code de vérification (6 chiffres)')
      ).toBeVisible()
    })

    test('5.5.4. Submit button should be in french', async ({ page }) => {
      /*
       * Expected result: should change the submit button of the 2fa page to french
       */
      await expect(page.getByText('Vérifier', { exact: true })).toBeVisible()
    })

    test('5.5.5. Resend button should be in french', async ({ page }) => {
      /*
       * Expected result: should change the resend button of the 2fa page to french
       */
      await expect(page.getByText('Renvoyer le Email')).toBeVisible()
    })
  })

  test.describe('5.6. Validate create pin page', () => {
    test.beforeEach(async ({ page }) => {
      await page.locator('_react=LanguageSelect').click()
      await page.getByText('Français').click()
      await page.fill('#username', 'k.bwalya')
      await page.fill('#password', 'test')
      await page.getByText('Se connecter', { exact: true }).click()
      await page.fill('#code', '000000')
      await page.getByText('Vérifier', { exact: true }).click()
    })

    test('5.6.1. Create pin header should be in french', async ({ page }) => {
      /*
       * Expected result: should change the create pin header to french
       */
      await expect(page.getByText('Créer un code PIN')).toBeVisible({
        timeout: 1000 * 20
      })
    })
    test('5.6.2. Create pin description should be in french', async ({
      page
    }) => {
      /*
       * Expected result: should change the create pin description to french
       */
      await expect(
        page.getByText(
          'Choisissez un code PIN qui ne comporte pas 4 chiffres répétitifs ou des numéros séquentiels.'
        )
      ).toBeVisible({
        timeout: 1000 * 20
      })
    })
  })

  test.describe("5.7. Validate Can't login page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(LOGIN_URL + '/?lang=fr')
      await ensureLoginPageReady(page)
      await page.getByText('Vous ne pouvez pas vous').click()
    })
    test("5.7.1. Title of can't login page should be in french", async ({
      page
    }) => {
      /*
       * Expected result: should change the title of unable to login page to french
       */
      await expect(
        page.getByText('Impossible de se connecter', { exact: true })
      ).toBeVisible()
    })

    test("5.7.2. Selector label of can't login page should be in french", async ({
      page
    }) => {
      /*
       * Expected result: should change the label for selector of unable to login page to french
       */
      await expect(
        page.getByText("Qu'avez-vous oublié ?", { exact: true })
      ).toBeVisible()
    })

    test("5.7.3. Username reminder option of can't login page should be in french", async ({
      page
    }) => {
      /*
       * Expected result: should change the username reminder option of unable to login page to french
       */
      await expect(
        page.getByText("Mon nom d'utilisateur", { exact: true })
      ).toBeVisible()
    })

    test("5.7.4. Password reset option of can't login page should be in french", async ({
      page
    }) => {
      /*
       * Expected result: should change the password reset option of unable to login page to french
       */
      await expect(
        page.getByText('Mon mot de passe', { exact: true })
      ).toBeVisible()
    })

    test("5.7.5. Continue button of can't login page should be in french", async ({
      page
    }) => {
      /*
       * Expected result: should change the continue button of unable to login page to french
       */
      await expect(page.getByText('Continuer', { exact: true })).toBeVisible()
    })

    test("5.7.6. Error of can't login page should be in french", async ({
      page
    }) => {
      await page.getByText('Continuer', { exact: true }).click()

      /*
       * Expected result: should change the error taost of unable to login page to french
       */
      await expect(
        page.getByText('Entrée invalide', { exact: true })
      ).toBeVisible()
    })
  })
})
