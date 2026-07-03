import { expect, test } from '@playwright/test'

test('searching for a repository shows results in the grid', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Search GitHub repositories').fill('vue')

  const vueRepoLink = page.getByRole('link', { name: 'vuejs/vue', exact: true })
  await expect(vueRepoLink).toBeVisible()

  const results = page.locator('.repo-grid article.repo-card')
  await expect(results.first()).toBeVisible()
  expect(await results.count()).toBeGreaterThan(0)
})

test('clicking a repo card navigates to its details page and shows the repo name', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByLabel('Search GitHub repositories').fill('vue')

  const vueRepoLink = page.getByRole('link', { name: 'vuejs/vue', exact: true })
  await expect(vueRepoLink).toBeVisible()
  await vueRepoLink.click()

  await expect(page).toHaveURL(/\/repo\/vuejs\/vue$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('vue')
})
