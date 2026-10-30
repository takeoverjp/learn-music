import { expect, expectScore, next, openQuiz, test } from './helpers'

test('melody quiz renders, plays and scores a public-domain excerpt', async ({ page }) => {
  await openQuiz(page)
  await page.getByRole('button', { name: '名曲メロディ' }).click()

  await expect(page.getByRole('heading', { name: 'この曲は？' })).toBeFocused()
  const staff = page.getByRole('img', { name: /^ト音記号の2小節のメロディ。/ })
  await expect(staff.locator('svg')).toHaveCount(1)
  await expect(staff.locator('svg')).toHaveAttribute('viewBox', '0 0 320 260')
  await expect(page.getByRole('group', { name: '曲名を選んでください' }).getByRole('button')).toHaveCount(4)
  await expectScore(page, 0, 0)

  const play = page.getByRole('button', { name: '▶ メロディを再生' })
  await play.click()
  await expect(page.getByRole('button', { name: '再生中…' })).toBeDisabled()

  await page.getByRole('button', {
    name: '交響曲第9番「歓喜の歌」（ベートーヴェン）',
  }).click()
  await expect(page.getByRole('status')).toHaveText(
    '正解！正解：交響曲第9番「歓喜の歌」（ベートーヴェン）',
  )
  await expectScore(page, 1, 1)
  await expect(next(page)).toBeFocused()
})

test('melody quiz excludes the previous song and keeps its score across mode switches', async ({ page }) => {
  await openQuiz(page)
  await page.getByRole('button', { name: '名曲メロディ' }).click()
  await page.getByRole('button', {
    name: '交響曲第9番「歓喜の歌」（ベートーヴェン）',
  }).click()
  await next(page).click()

  await expect(page.getByRole('img', { name: /^ト音記号の2小節のメロディ。音は E5、Dシャープ5/ }))
    .toBeVisible()
  await expect(page.getByRole('status')).toBeEmpty()
  await expectScore(page, 1, 1)

  await page.getByRole('button', { name: 'コード' }).click()
  await expectScore(page, 0, 0)
  await page.getByRole('button', { name: '名曲メロディ' }).click()
  await expectScore(page, 1, 1)
  await expect(page.getByRole('heading', { name: 'この曲は？' })).toBeFocused()
})

test('melody controls fit at 320 CSS pixels and retain touch targets', async ({ page }) => {
  await openQuiz(page)
  await page.setViewportSize({ width: 320, height: 844 })
  await page.getByRole('button', { name: '名曲メロディ' }).click()

  expect(await page.evaluate(() => (
    document.documentElement.scrollWidth <= document.documentElement.clientWidth
  ))).toBe(true)
  const staff = page.getByRole('img', { name: /^ト音記号の2小節のメロディ。/ })
  const bounds = await staff.locator('svg').boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.width / bounds!.height).toBeCloseTo(320 / 260, 2)
  const buttons = [
    page.getByRole('button', { name: '▶ メロディを再生' }),
    ...await page.getByRole('group', { name: '曲名を選んでください' }).getByRole('button').all(),
  ]
  for (const button of buttons) {
    const box = await button.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
})
