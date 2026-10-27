import { choices, expect, expectScore, next, openQuiz, staff, test } from './helpers'

test('initial question has a staff, four choices and zero scores (1)', async ({ page }) => {
  await openQuiz(page)
  await expect(staff(page)).toHaveAttribute('aria-label', 'ト音記号の五線譜。下から C4、E4、G4。')
  await expect(choices(page)).toHaveCount(4)
  await expectScore(page, 0, 0)
  await expect(page.getByRole('status')).toBeEmpty()
  await expect(next(page)).toHaveCount(0)
  for (const button of await choices(page).all()) await expect(button).toBeEnabled()
})

test('correct answer locks the question and prevents repeated scoring (2,4,5)', async ({ page }) => {
  await openQuiz(page)
  const initialNotation = await staff(page).innerHTML()
  // Dispatch both clicks in the same browser task to exercise the state guard as well as disabled UI.
  await page.getByRole('button', { name: 'C', exact: true }).evaluate((button) => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await expect(page.getByRole('status')).toHaveText('正解！正解のコード名：C')
  await expectScore(page, 1, 1)
  for (const button of await choices(page).all()) await expect(button).toBeDisabled()
  await page.getByRole('button', { name: 'Cm', exact: true }).dispatchEvent('click')
  await page.waitForTimeout(600)
  await expectScore(page, 1, 1)
  await expect(page.getByRole('status')).toHaveText('正解！正解のコード名：C')
  expect(await staff(page).innerHTML()).toBe(initialNotation)
  await expect(next(page)).toBeFocused()
})

test('wrong answer reveals the answer and counts only one attempt (3,5)', async ({ page }) => {
  await openQuiz(page)
  await page.getByRole('button', { name: 'Cm', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('不正解正解のコード名：C')
  await expectScore(page, 0, 1)
  await page.getByRole('button', { name: 'C', exact: true }).dispatchEvent('click')
  await expectScore(page, 0, 1)
  await expect(page.getByRole('status')).toHaveText('不正解正解のコード名：C')
  for (const button of await choices(page).all()) await expect(button).toBeDisabled()
})

test('next resets selection, excludes the previous chord, accumulates and reloads (6,7,8)', async ({ page }) => {
  await openQuiz(page)
  await page.getByRole('button', { name: 'C', exact: true }).click()
  await next(page).click()
  await expect(staff(page)).toHaveAttribute('aria-label', 'ト音記号の五線譜。下から C4、Eフラット4、G4。')
  await expect(page.getByRole('status')).toBeEmpty()
  await expect(next(page)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'このコードは？' })).toBeFocused()
  for (const button of await choices(page).all()) {
    await expect(button).toBeEnabled()
    await expect(button).not.toContainText(/正解|選択/)
  }
  await expectScore(page, 1, 1)
  await page.getByRole('button', { name: 'C', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('不正解正解のコード名：Cm')
  await expectScore(page, 1, 2)
  await next(page).click()
  await expect(staff(page)).toHaveAttribute('aria-label', 'ト音記号の五線譜。下から C4、E4、G4。')
  await page.getByRole('button', { name: 'C', exact: true }).click()
  await expectScore(page, 2, 3)
  await page.reload()
  await expectScore(page, 0, 0)
  await expect(page.getByRole('status')).toBeEmpty()
  await expect(next(page)).toHaveCount(0)
  for (const button of await choices(page).all()) await expect(button).toBeEnabled()
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 })
})

test('keyboard navigation exposes focus and announces answers (13)', async ({ page }) => {
  await openQuiz(page)
  await expect(page.getByRole('heading', { name: 'このコードは？' })).toBeFocused()
  const buttons = choices(page)
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press('Tab')
    await expect(buttons.nth(index)).toBeFocused()
    expect(await buttons.nth(index).evaluate((element) => {
      const style = getComputedStyle(element)
      return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2
    })).toBe(true)
  }
  await page.keyboard.press('Shift+Tab')
  await expect(buttons.nth(2)).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  await expect(page.getByRole('status')).toHaveAttribute('aria-atomic', 'true')
  await expect(page.getByRole('status')).toContainText('不正解')
  await expect(next(page)).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'このコードは？' })).toBeFocused()
  await expect(page.getByRole('status')).toBeEmpty()
  await page.keyboard.press('Tab')
  await expect(choices(page).first()).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toContainText('正解！')
})

test('320px and phone layouts fit without clipping and maintain tap targets (11,14)', async ({ page }) => {
  await openQuiz(page)
  const originalViewport = page.viewportSize()
  expect(originalViewport).not.toBeNull()
  for (const width of [320, 393, 390, originalViewport!.width]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    await expect(staff(page).locator('svg')).toHaveCount(1)
    const bounds = await staff(page).locator('svg').boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    expect(bounds!.width / bounds!.height).toBeCloseTo(320 / 180, 2)
    for (const button of await choices(page).all()) {
      const box = await button.boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  }
  await page.getByRole('button', { name: 'C', exact: true }).click()
  const nextBox = await next(page).boundingBox()
  expect(nextBox!.width).toBeGreaterThanOrEqual(44)
  expect(nextBox!.height).toBeGreaterThanOrEqual(44)
  await next(page).click()
  await expect(staff(page).locator('svg')).toHaveCount(1)
  await page.setViewportSize({ width: 320, height: 700 })
  await expect(staff(page).locator('svg')).toHaveCount(1)
})

test('touch answer and next-question workflow (12)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Touch workflow is covered by both mobile browser projects.')
  await openQuiz(page)
  await page.getByRole('button', { name: 'C', exact: true }).tap()
  await expectScore(page, 1, 1)
  await next(page).tap()
  await expect(staff(page)).toHaveAttribute('aria-label', 'ト音記号の五線譜。下から C4、Eフラット4、G4。')
  await page.getByRole('button', { name: 'Cm', exact: true }).tap()
  await expectScore(page, 2, 2)
})
