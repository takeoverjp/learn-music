import { choices, expect, expectNotation, notationCases, openQuiz, test } from './helpers'

for (const [index, item] of notationCases.entries()) {
  test(`${item.label}: unique choices, counterpart and actual musical notation (9,10)`, async ({ page }) => {
    await openQuiz(page, index)
    const labels = await choices(page).evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')))
    expect(labels).toHaveLength(4)
    expect(new Set(labels).size).toBe(4)
    expect(labels).toContain(item.label)
    const counterpart = item.label.endsWith('m') ? item.label.slice(0, -1) : `${item.label}m`
    expect(labels).toContain(counterpart)
    expect(labels.filter((label) => label?.[0] !== item.label[0])).toHaveLength(2)
    expect(labels.every((label) => notationCases.some((entry) => entry.label === label))).toBe(true)
    await expectNotation(page, item)
  })
}
