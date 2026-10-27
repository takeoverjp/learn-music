import { expect, expectNotation, notationCases, openQuiz, staff, test } from './helpers'

test.skip(process.platform !== 'linux', 'Notation baselines are reviewed Linux Chromium images.')

for (const [index, item] of notationCases.entries()) {
  test(`${item.label} staff rendering`, async ({ page }) => {
    await openQuiz(page, index)
    await expectNotation(page, item)
    await expect(staff(page)).toHaveScreenshot(`staff-${item.label}.png`, {
      animations: 'disabled',
      maxDiffPixels: 0,
    })
  })
}
