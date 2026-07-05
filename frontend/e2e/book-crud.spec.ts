import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Book CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('创建书籍并能在列表中搜索到', async ({ page }) => {
    const uniqueTitle = `E2E Book ${Date.now()}`

    // 创建
    await page.getByTestId('create-book-link').click()
    await page.getByRole('textbox', { name: '书名' }).fill(uniqueTitle)
    await page.getByRole('textbox', { name: '作者' }).fill('Playwright Author')
    await page.getByRole('spinbutton', { name: '页数' }).fill('256')
    await page.getByRole('combobox', { name: '阅读状态' }).selectOption('READING')
    await page.getByRole('button', { name: '保存' }).click()

    await expect(page.getByText(uniqueTitle)).toBeVisible()

    // 返回列表并搜索
    await page.goto('/')
    await page.getByTestId('book-search').fill(uniqueTitle)
    await expect(page.getByText(uniqueTitle)).toBeVisible()
  })
})