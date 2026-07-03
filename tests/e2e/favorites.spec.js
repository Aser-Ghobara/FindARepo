import { expect, test } from '@playwright/test'
import { VUE_REPO } from './repo-fixture.js'

test('favoriting a repo from search shows it on the Favorites page', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Search GitHub repositories').fill('vue')

  const vueCard = page.locator('article.repo-card', {
    has: page.getByRole('link', { name: 'vuejs/vue', exact: true }),
  })
  await expect(vueCard).toBeVisible()
  await vueCard.getByRole('button', { name: 'Add vue to favorites' }).click()

  await page.getByRole('link', { name: 'Favorites' }).click()

  await expect(page).toHaveURL(/\/favorites$/)
  await expect(page.getByRole('link', { name: 'vuejs/vue', exact: true })).toBeVisible()
})

test('unfavoriting from the Favorites page removes it and shows the empty state', async ({
  page,
}) => {
  await page.addInitScript((repo) => {
    window.localStorage.setItem('github-favorites', JSON.stringify([repo]))
  }, VUE_REPO)

  await page.goto('/favorites')

  const vueCard = page.locator('article.repo-card', {
    has: page.getByRole('link', { name: 'vuejs/vue', exact: true }),
  })
  await expect(vueCard).toBeVisible()

  await vueCard.getByRole('button', { name: 'Remove vue from favorites' }).click()

  await expect(vueCard).not.toBeVisible()
  await expect(page.getByText('No favorites yet. Click on the heart icon to save one here.')).toBeVisible()
})
